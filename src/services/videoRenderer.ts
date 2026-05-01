import { VideoScene } from "../types";

export interface RenderProgress {
  stage: string;
  progress: number;
}

export const renderVideo = async (
  scenes: VideoScene[],
  onProgress: (progress: RenderProgress) => void
): Promise<Blob> => {
  const width = 1280;
  const height = 720;
  const fps = 30;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const stream = canvas.captureStream(fps);
  const audioContext = new AudioContext();
  const audioDestination = audioContext.createMediaStreamDestination();
  
  // Add audio track to stream
  stream.addTrack(audioDestination.stream.getAudioTracks()[0]);

  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];
  const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: supportedMimeType,
    videoBitsPerSecond: 5000000 // 5Mbps
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise(async (resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    mediaRecorder.onerror = (e) => reject(e);
    
    // Ensure AudioContext is running
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }

    mediaRecorder.start();

    try {
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        onProgress({ stage: `Rendering Scene ${i + 1}/${scenes.length}`, progress: (i / scenes.length) * 100 });

        if (!scene.visualUrl || !scene.audioUrl) {
          console.warn(`Scene ${i} is missing visual or audio URL. Skipping.`);
          continue;
        }

        // 1. Load Image
        const img = await loadImage(scene.visualUrl);
        
        // 2. Load Audio
        const audioBuffer = await loadAudio(scene.audioUrl, audioContext);
        const duration = audioBuffer.duration;

        // 3. Play Audio to Destination
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioDestination);
        source.start();

        // 4. Draw Frames for the duration
        const startTime = performance.now();
        while (performance.now() - startTime < duration * 1000) {
          drawFrame(ctx, img, scene, (performance.now() - startTime) / 1000, duration);
          await new Promise(r => requestAnimationFrame(r));
        }
        
        source.stop();
      }

      mediaRecorder.stop();
    } catch (err) {
      mediaRecorder.stop();
      reject(err);
    }
  });
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

const loadAudio = async (url: string, context: AudioContext): Promise<AudioBuffer> => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await context.decodeAudioData(arrayBuffer);
};

const drawFrame = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  scene: VideoScene,
  elapsed: number,
  duration: number
) => {
  const { width, height } = ctx.canvas;

  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);

  // Draw Background Image with subtle zoom
  const zoom = 1 + (elapsed / duration) * 0.05;
  const w = width * zoom;
  const h = height * zoom;
  const x = (width - w) / 2;
  const y = (height - h) / 2;
  ctx.drawImage(img, x, y, w, h);

  // Draw Overlays
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, height - 120, width, 120);

  // Draw Text
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 32px Inter, sans-serif';
  ctx.textAlign = 'center';
  
  if (scene.onScreenText && scene.onScreenText.length > 0) {
    const text = scene.onScreenText.join(' • ');
    ctx.fillText(text, width / 2, height - 60);
  }

  // Draw Progress Bar
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(0, height - 5, width, 5);
  ctx.fillStyle = '#ef4444'; // red-500
  ctx.fillRect(0, height - 5, (elapsed / duration) * width, 5);
};
