import { useOverlayManager } from 'overlay-manager-rc';
import { SequentialContent } from '@/overlays/sequential-content.tsx';

interface SequentialData {
  step: number;
  totalSteps: number;
  message: string;
}

export function useOpenSequential() {
  const { openOverlay } = useOverlayManager();

  const openSequential = (step: number = 1, totalSteps: number = 3) => {
    void openOverlay({
      content: SequentialContent,
      data: {
        step,
        totalSteps,
        message: `This is dialog ${step} of ${totalSteps}.`,
      } as SequentialData,
    });
  };

  return { openSequential };
}
