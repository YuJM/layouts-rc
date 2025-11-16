<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Alert title</DialogTitle>
        <DialogDescription>
          Get Data: {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button @click="handleContinue">Continue</Button>
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

interface TestOverlayProps {
  message: string
}

// Define props to avoid Vue warning
defineProps<TestOverlayProps>()

const overlay = useCurrentOverlay<TestOverlayProps, boolean>()

const handleCancel = () => {
  overlay.dismiss('user_cancelled')
}

const handleContinue = () => {
  overlay.close(true)
}
</script>
