<template>
  <AlertDialog v-bind:open="props.open">
    <AlertDialogContent>
      <h2>{{ title }}</h2>
      <p>{{ data.message }}</p>
      <Button @click="handleClose">Close</Button>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { OverlayContentProps } from 'overlay-manager-vue'
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
const props = defineProps<OverlayContentProps>()
const title = 'Example Overlay'

const handleClose = () => {
  props.close()
}
</script>
