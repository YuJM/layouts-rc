import { useOverlay } from 'overlay-manager-vue'
import SequentialOverlay from '@/components/overlays/SequentialOverlay.vue'

interface SequentialData {
  step: number
  totalSteps: number
  message: string
}

export function useOpenSequential() {
  const { openOverlay } = useOverlay()

  const openSequential = (step: number = 1, totalSteps: number = 3) => {
    void openOverlay(SequentialOverlay, {
      data: {
        step,
        totalSteps,
        message: `This is dialog ${step} of ${totalSteps}.`,
      } as SequentialData,
    })
  }

  return { openSequential }
}
