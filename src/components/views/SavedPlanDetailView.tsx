import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../ui';
import { LessonPlanDisplay } from '../LessonPlanDisplay';
import { LessonPlan, LessonStatus, VideoMode, VideoLength, VoiceGender, VoiceTone, VoicePace, AvatarStyle, AvatarPlacement } from '../../types';

interface SavedPlanDetailViewProps {
  plan: LessonPlan;
  onBack: () => void;
  onUpdateStatus: (id: string, status: LessonStatus) => Promise<void>;
  onGenerateResource?: (plan: LessonPlan, type: string) => Promise<void>;
  onGenerateFullPack?: (plan: LessonPlan) => Promise<void>;
  onUpdatePlan?: (plan: LessonPlan) => Promise<void>;
  onOpenCheckIn?: (lesson: LessonPlan) => void;
  onGenerateReteach?: (lesson: LessonPlan) => void;
  onGenerateIntervention?: (lesson: LessonPlan) => void;
  onGenerateCatchUp?: (lesson: LessonPlan) => void;
  onScheduleReview?: (lesson: LessonPlan) => void;
  onAddToRevisionWeek?: (lesson: LessonPlan) => void;
  onViewProgress?: () => void;
  onGenerateVideo?: (
    plan: LessonPlan, 
    mode: VideoMode, 
    length: VideoLength, 
    voiceSettings: { gender: VoiceGender; tone: VoiceTone; pace: VoicePace },
    avatarSettings: { enabled: boolean; style: AvatarStyle; placement: AvatarPlacement }
  ) => Promise<void>;
  onRenderVideo?: (plan: LessonPlan) => Promise<void>;
  onPrepareForTeaching?: (plan: LessonPlan) => Promise<void>;
  onDuplicate?: (plan: LessonPlan) => Promise<void>;
  isGenerating?: boolean;
  initialTab?: string;
}

export function SavedPlanDetailView({ 
  plan, 
  onBack, 
  onUpdateStatus, 
  onGenerateResource,
  onGenerateFullPack,
  onUpdatePlan,
  onOpenCheckIn,
  onGenerateReteach,
  onGenerateIntervention,
  onGenerateCatchUp,
  onScheduleReview,
  onAddToRevisionWeek,
  onViewProgress,
  onGenerateVideo,
  onRenderVideo,
  onPrepareForTeaching,
  onDuplicate,
  isGenerating,
  initialTab
}: SavedPlanDetailViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          Back to Saved Plans
        </Button>
      </div>
      <LessonPlanDisplay 
        plan={plan} 
        onStatusChange={async (status) => {
          await onUpdateStatus(plan.id!, status);
        }}
        onGenerateResource={onGenerateResource}
        onGenerateFullPack={onGenerateFullPack}
        onUpdatePlan={onUpdatePlan}
        onOpenCheckIn={() => onOpenCheckIn?.(plan)}
        onGenerateReteach={() => onGenerateReteach?.(plan)}
        onGenerateIntervention={() => onGenerateIntervention?.(plan)}
        onGenerateCatchUp={() => onGenerateCatchUp?.(plan)}
        onScheduleReview={() => onScheduleReview?.(plan)}
        onAddToRevisionWeek={() => onAddToRevisionWeek?.(plan)}
        onViewProgress={onViewProgress}
        onGenerateVideo={onGenerateVideo}
        onRenderVideo={onRenderVideo}
        onPrepareForTeaching={onPrepareForTeaching}
        onDuplicate={onDuplicate}
        isGenerating={isGenerating}
        initialTab={initialTab}
      />
    </div>
  );
}
