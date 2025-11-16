<template>
  <Teleport to="body">
    <AlertDialog :open="true">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ title }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ overlay.data.message }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="handleDismiss">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleClose">Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Teleport>
</template>

<script lang="ts" setup>
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface OverlayProps {
  message: string
}

interface OverlayResult {
  confirmed: boolean
}

// useCurrentOverlay를 사용하여 overlay 내부에서 컨텍스트에 접근
const overlay = useCurrentOverlay<OverlayProps, OverlayResult>()
const title = 'Example Overlay'

const handleClose = () => {
  overlay.close({ confirmed: true })
}

const handleDismiss = () => {
  overlay.dismiss('user_cancelled')
}
</script>
