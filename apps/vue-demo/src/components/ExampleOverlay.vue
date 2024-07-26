<template>
  <div v-if="open" class="overlay">
    <h2>{{ title }}</h2>
    <p>{{ data.message }}</p>
    <button @click="handleClose">Close</button>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import type { OverlayContentProps } from 'overlay-manager-vue'
const props = defineProps<OverlayContentProps>()
const title = 'Example Overlay'

const handleClose = () => {
  props.close()
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
</style>
