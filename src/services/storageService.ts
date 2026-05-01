import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export const uploadVideo = async (blob: Blob, lessonId: string): Promise<string> => {
  const fileName = `lessons/${lessonId}/video_${Date.now()}.webm`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob, { contentType: 'video/webm' });
  return await getDownloadURL(storageRef);
};

export const uploadThumbnail = async (dataUrl: string, lessonId: string): Promise<string> => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const fileName = `lessons/${lessonId}/thumbnail_${Date.now()}.png`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob, { contentType: 'image/png' });
  return await getDownloadURL(storageRef);
};

export const uploadAudio = async (base64: string, lessonId: string, sceneId: string): Promise<string> => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const fileName = `lessons/${lessonId}/audio_${sceneId}_${Date.now()}.mp3`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, blob, { contentType: 'audio/mpeg' });
  return await getDownloadURL(storageRef);
};
