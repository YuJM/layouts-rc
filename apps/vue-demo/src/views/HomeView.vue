<script setup lang="ts">
import { useOverlay } from 'overlay-manager-vue'
import { Button } from '@/components/ui/button'
import TestOverlay from '@/components/overlays/TestOverlay.vue'
import { useOpenSequential } from '@/composables/useOpenSequential'

const { openOverlay } = useOverlay()
const { openSequential } = useOpenSequential()

const handleOpenAlert = async () => {
  try {
    const result = await openOverlay(TestOverlay, {
      data: {
        message: 'hello!!!!',
      },
      onMounted: () => {
        console.log('Overlay mounted')
      },
    })
    console.log('Overlay closed with result:', result)
  } catch (error) {
    console.log('Overlay dismissed:', error)
  }
}
</script>

<template>
  <main class="container mx-auto p-8">
    <section class="md:min-h-screen">
      <div class="flex flex-col gap-10 max-w-2xl">
        <!-- Header -->
        <div class="flex flex-col gap-2">
          <h1 class="text-3xl font-bold">Overlay Vue Demo</h1>
          <p class="text-muted-foreground">
            Demonstration of overlay-vue features with Radix Vue components
          </p>
        </div>

        <!-- Single Alert -->
        <div class="flex flex-col gap-3 p-6 border rounded-lg">
          <h3 class="text-lg font-semibold">Single Alert Dialog</h3>
          <p class="text-sm text-muted-foreground">
            Opens a single alert dialog with custom message
          </p>
          <Button @click="handleOpenAlert" class="w-fit">
            Show Alert
          </Button>
        </div>

        <!-- Sequential Dialog Chain -->
        <div class="flex flex-col gap-3 p-6 border rounded-lg">
          <h3 class="text-lg font-semibold">Sequential Dialog Chain</h3>
          <p class="text-sm text-muted-foreground">
            Opens a chain of dialogs where each dialog can open the next one (stacked overlays)
          </p>
          <Button @click="() => openSequential(1, 3)" class="w-fit">
            Open Dialog Chain (1→2→3)
          </Button>
        </div>

        <!-- Features -->
        <div class="flex flex-col gap-3 p-6 border rounded-lg bg-muted/50">
          <h3 class="text-lg font-semibold">Features</h3>
          <ul class="space-y-2 text-sm">
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Hook-based API</strong> - useOverlay(), useCurrentOverlay()</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Type-safe</strong> - Full TypeScript support with generics</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Promise-based</strong> - Async/await overlay control</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Stacked overlays</strong> - Multiple overlays can be open simultaneously</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Lifecycle callbacks</strong> - onMounted, onUnmounted support</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-green-600">✓</span>
              <span><strong>Vue 3 Teleport</strong> - Portal-like behavior with native Vue</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>
