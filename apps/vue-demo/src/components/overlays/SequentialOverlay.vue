<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>
          Dialog {{ overlay.data.step }} / {{ overlay.data.totalSteps }}
        </DialogTitle>
        <DialogDescription>
          {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-8">
        <p class="text-sm text-muted-foreground">
          This is a sequential dialog demonstration.
          Click "Next" to open the next dialog in the chain.
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button @click="handleNext">
          {{ overlay.data.step === overlay.data.totalSteps ? 'Finish' : 'Next' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useOpenSequential } from '@/composables/useOpenSequential'

interface SequentialData {
  step: number
  totalSteps: number
  message: string
}

// Define props to avoid Vue warning
defineProps<SequentialData>()

const overlay = useCurrentOverlay<SequentialData, string>()
const { openSequential } = useOpenSequential()

const handleCancel = () => {
  overlay.dismiss('cancelled')
}

const handleNext = () => {
  const currentStep = overlay.data.step
  const totalSteps = overlay.data.totalSteps

  if (currentStep < totalSteps) {
    // Open next dialog (keep current dialog open - stacked)
    openSequential(currentStep + 1, totalSteps)
  } else {
    // Close on last dialog
    overlay.close('finish')
  }
}
</script>
