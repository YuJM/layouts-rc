# overlay-manager-vue

A plugin for managing overlay components in Vue 3.

[Korean Version (한글 버전)](README_KO.md)

## Installation

Using npm:

```bash
npm install overlay-manager-vue
```

Using yarn:

```bash
yarn add overlay-manager-vue
```

## Usage

### Setup

1. Configure in your main.ts/js file:

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { overlayManagerPlugin } from 'overlay-manager-vue';

const app = createApp(App);
app.use(overlayManagerPlugin());
app.mount('#app');
```

2. Set up overlay rendering in App.vue

Add the following code to render overlays in your App.vue file:

```vue
<template>
  <!-- Existing app content -->
  <component
    v-for="overlay in overlays"
    :key="overlay.id"
    :is="overlay.content"
    :open="overlay.state"
    :data="overlay.data"
    :close="overlay.close"
  />
</template>

<script setup lang="ts">
import { useOverlayManager } from 'overlay-manager-vue';

const { overlays } = useOverlayManager();
</script>
```

### Basic Usage

1. Create an example overlay component

- Using radix-vue AlertDialog:

```vue
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
import { defineProps } from 'vue';
import type { OverlayContentProps } from 'overlay-manager-vue';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
const props = defineProps<OverlayContentProps>();
const title = 'Example Overlay';

const handleClose = () => {
  props.close();
};
</script>
```

2. Use the overlay in a component:

Here's how to use the overlay in other components:

```vue
<script setup lang="ts">
import { useOverlayManager } from 'overlay-manager-vue';
import ExampleOverlay from './ExampleOverlay.vue';

const { overlayOpen } = useOverlayManager();

const openOverlay = () => {
  overlayOpen({
    content: ExampleOverlay,
    data: { message: 'This is an overlay created by overlay manager.' },
  });
};
</script>

<template>
  <button @click="openOverlay">Open Overlay</button>
</template>
```

## API

### overlayManagerPlugin

A Vue plugin that sets up the overlay manager.

### useOverlayManager

A composable that provides access to overlay manager functionality.

Returns:

- `overlays`: Array of active overlays
- `overlayOpen`: Function to open a new overlay

#### overlayOpen(options)

Opens a new overlay.

Parameters:

- `options`: An object with the following properties:
  - `content`: The overlay component to render
  - `data`: (optional) Data to pass to the overlay component

### Overlay Component Props

When creating an overlay component, it will receive the following props:

- `open`: Boolean indicating if the overlay should be displayed
- `data`: Any data passed when opening the overlay
- `close`: Function to close the overlay

## License

[MIT License](LICENSE)
