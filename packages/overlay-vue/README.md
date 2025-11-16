# overlay-manager-vue

[![npm version](https://img.shields.io/npm/v/overlay-manager-vue?style=flat-square)](https://www.npmjs.com/package/overlay-manager-vue)
[![npm downloads](https://img.shields.io/npm/dm/overlay-manager-vue?style=flat-square)](https://www.npmjs.com/package/overlay-manager-vue)
[![license](https://img.shields.io/npm/l/overlay-manager-vue?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/overlay-manager-vue?style=flat-square)](https://bundlephobia.com/package/overlay-manager-vue)

A Vue 3 overlay management library with hook-based API, inspired by overlay-rc.

**Version 1.0.0** - Production-ready with full reactivity and multiple overlay stacking support.

[Korean Version (한글 버전)](README_KO.md) | [Migration Guide](docs/MIGRATION.md) | [API Reference](docs/API.md)

## Features

- ✅ **Hook-based API** - `useOverlay()`, `useCurrentOverlay()`, `useOverlayController()`
- ✅ **Fully Reactive** - All context properties are reactive with Vue's computed
- ✅ **Type-safe** - Full TypeScript support with generics
- ✅ **Promise-based** - Async/await overlay control with result handling
- ✅ **Multiple Stacking** - Multiple overlays can be open simultaneously
- ✅ **Lifecycle callbacks** - `onMounted`, `onUnmounted` support
- ✅ **Framework agnostic** - Works with Radix Vue, reka-ui, Headless UI, or custom components
- ✅ **Comprehensive Tests** - 97%+ test coverage with Vitest

## Bundle Size

Lightweight and optimized for production:

| Format | Raw Size | Gzipped (Actual Download) |
|--------|----------|---------------------------|
| ESM    | 8.4 KB   | **3.17 KB** ⚡             |
| CJS    | 3.8 KB   | **1.67 KB** ⚡             |

- **Modern apps (ESM)**: Only 3.17 KB gzipped
- **Legacy support (CJS)**: Only 1.67 KB gzipped
- **Type definitions**: 25.3 KB (development only)

## Installation

```bash
npm install overlay-manager-vue
# or
yarn add overlay-manager-vue
# or
pnpm add overlay-manager-vue
```

### Required Peer Dependencies

For overlay stacking support, you need to use **Dialog** components (not AlertDialog):

```bash
# Install reka-ui for Dialog components
pnpm add reka-ui @radix-icons/vue

# Or use shadcn-vue (recommended)
pnpm dlx shadcn-vue@latest add dialog
```

**Important**: `AlertDialog` from Radix Vue **does NOT support stacking** - only one can be open at a time. Use `Dialog` from reka-ui for multiple overlay support.

## Quick Start

### 1. Setup OverlayHost

Add `<OverlayHost />` to your root component (e.g., `App.vue`):

```vue
<script setup lang="ts">
import { OverlayHost } from 'overlay-manager-vue'
</script>

<template>
  <div id="app">
    <YourContent />

    <!-- Add OverlayHost once at the root -->
    <OverlayHost />
  </div>
</template>
```

### 2. Create an Overlay Component

Create a component using **Dialog** (supports stacking):

```vue
<!-- MyDialog.vue -->
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
        <DialogDescription>
          {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">Cancel</Button>
        <Button @click="handleConfirm">Confirm</Button>
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

interface DialogProps {
  title: string
  message: string
}

interface DialogResult {
  confirmed: boolean
}

// Define props to avoid Vue warning
defineProps<DialogProps>()

// Fully reactive context with TypeScript generics
const overlay = useCurrentOverlay<DialogProps, DialogResult>()

const handleConfirm = () => {
  overlay.close({ confirmed: true })
}

const handleCancel = () => {
  overlay.dismiss('user_cancelled')
}
</script>
```

**Key Points**:
- ✅ Use `Dialog` from reka-ui (supports multiple instances)
- ✅ Bind `:open="overlay.isOpen"` (fully reactive)
- ✅ Use TypeScript generics for type safety
- ✅ Define props with `defineProps<T>()`
- ❌ Don't use `AlertDialog` (only allows one instance)
- ❌ Don't use `<Teleport>` (handled by OverlayHost)

### 3. Open the Overlay

Use `useOverlay()` to open your overlay component:

```vue
<script setup lang="ts">
import { useOverlay } from 'overlay-manager-vue'
import MyDialog from './components/MyDialog.vue'

const { openOverlay } = useOverlay()

async function showDialog() {
  try {
    const result = await openOverlay(MyDialog, {
      data: {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
      },
    })

    console.log('User confirmed:', result.data.confirmed)
  } catch (error) {
    console.log('User cancelled:', error.reason)
  }
}
</script>

<template>
  <button @click="showDialog">Open Dialog</button>
</template>
```

## API Reference

### `useOverlay()`

Hook for opening overlays from anywhere in your application.

```typescript
const { openOverlay } = useOverlay()

const result = await openOverlay(Component, options)
```

#### Options

```typescript
interface OverlayOptions<TData> {
  // Data to pass to the overlay component
  data?: Record<string, unknown>

  // Guard function called before closing
  beforeClose?: () => boolean | Promise<boolean>

  // Callback after component is mounted
  onMounted?: () => void

  // Callback after component is unmounted
  onUnmounted?: () => void
}
```

#### Return Value

Returns a `Promise` that resolves when the overlay is closed via `close()`:

```typescript
interface OverlayResult<T> {
  type: 'close' | 'dismiss'
  data?: T
}
```

Or rejects when dismissed via `dismiss()`:

```typescript
interface OverlayError {
  type: 'dismiss' | 'error'
  reason?: unknown
}
```

### `useCurrentOverlay()`

Hook for accessing overlay context **inside** an overlay component.

```typescript
const overlay = useCurrentOverlay<TData, TResult>()

overlay.id        // Unique overlay ID
overlay.isOpen    // Reactive open state (computed)
overlay.data      // Data passed to the overlay (reactive)
overlay.close(result)   // Close with result (resolves promise)
overlay.dismiss(reason) // Dismiss (rejects promise)
```

**⚠️ Important**:
- Can only be used inside components rendered by `OverlayHost`
- All properties are **fully reactive** (using Vue's `computed`)
- Use TypeScript generics for type safety: `useCurrentOverlay<TData, TResult>()`

### `useOverlayController()`

Hook for imperative overlay control with a controller object.

```typescript
const controller = useOverlayController(Component, options)

controller.id      // Overlay ID
controller.result  // Promise<OverlayResult>
controller.close(result)   // Close the overlay
controller.dismiss(reason) // Dismiss the overlay
```

Example:

```typescript
const controller = useOverlayController(MyDialog, {
  data: { title: 'Hello' }
})

// Close after 3 seconds
setTimeout(() => {
  controller.close({ confirmed: true })
}, 3000)

const result = await controller.result
```

### `<OverlayHost />`

Component that renders all active overlays. Must be placed once in your app root.

```vue
<template>
  <div id="app">
    <YourContent />
    <OverlayHost />
  </div>
</template>
```

## Advanced Examples

### Multiple Stacked Overlays

Multiple overlays can be open at the same time (requires Dialog, not AlertDialog):

```typescript
// Open first overlay
const promise1 = openOverlay(Dialog1, { data: { id: 1 } })

// Open second overlay (stacked on top)
const promise2 = openOverlay(Dialog2, { data: { id: 2 } })

// Open third overlay (stacked on top)
const promise3 = openOverlay(Dialog3, { data: { id: 3 } })

// All three overlays are visible and stacked
await Promise.all([promise1, promise2, promise3])
```

### Sequential Overlay Chain

Open overlays in sequence, where each overlay can open the next one:

```vue
<script setup lang="ts">
import { useCurrentOverlay, useOverlay } from 'overlay-manager-vue'

interface SequentialData {
  step: number
  totalSteps: number
  message: string
}

defineProps<SequentialData>()

const overlay = useCurrentOverlay<SequentialData, string>()
const { openOverlay } = useOverlay()

const handleNext = async () => {
  if (overlay.data.step < overlay.data.totalSteps) {
    // Open next dialog (keeps current dialog open - stacked)
    await openOverlay(SequentialDialog, {
      data: {
        step: overlay.data.step + 1,
        totalSteps: overlay.data.totalSteps,
        message: `Step ${overlay.data.step + 1}`,
      },
    })
  }

  overlay.close('finished')
}
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          Dialog {{ overlay.data.step }} / {{ overlay.data.totalSteps }}
        </DialogTitle>
        <DialogDescription>
          {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="handleNext">
          {{ overlay.data.step === overlay.data.totalSteps ? 'Finish' : 'Next' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### Reactive Context Example

All overlay context properties are fully reactive:

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useCurrentOverlay } from 'overlay-manager-vue'

interface CounterData {
  count: number
}

defineProps<CounterData>()

const overlay = useCurrentOverlay<CounterData, void>()

// Watch reactive properties
watch(() => overlay.isOpen, (isOpen) => {
  console.log('Overlay open state changed:', isOpen)
})

watch(() => overlay.data.count, (count) => {
  console.log('Count changed:', count)
})
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- Automatically re-renders when overlay.data changes -->
      <DialogTitle>Count: {{ overlay.data.count }}</DialogTitle>
    </DialogContent>
  </Dialog>
</template>
```

### BeforeClose Guard

Prevent overlay from closing with a guard function:

```typescript
const result = await openOverlay(MyDialog, {
  beforeClose: async () => {
    // Confirm with user before closing
    return window.confirm('Are you sure you want to close?')
  },
})
```

If `beforeClose` returns `false`, the overlay stays open. Use `dismiss()` to force close:

```typescript
// Inside overlay component
overlay.dismiss('force_close') // Bypasses beforeClose guard
```

### Lifecycle Callbacks

Execute code when overlay mounts/unmounts:

```typescript
const result = await openOverlay(MyDialog, {
  onMounted: () => {
    console.log('Overlay mounted')
  },
  onUnmounted: () => {
    console.log('Overlay unmounted - cleanup here')
  },
})
```

### Type-Safe Props and Results

Use generics for full type safety:

```typescript
interface FormData {
  name: string
  email: string
}

interface FormResult {
  submitted: boolean
  data?: FormData
}

// In overlay component
const overlay = useCurrentOverlay<FormData, FormResult>()

// TypeScript knows overlay.data has name and email
const name = overlay.data.name

// TypeScript enforces correct result type
overlay.close({ submitted: true, data: formData })

// When opening
const result = await openOverlay<FormData, FormResult>(FormDialog, {
  data: { name: 'John', email: 'john@example.com' }
})

// TypeScript knows result.data has submitted and data properties
if (result.data.submitted) {
  console.log(result.data.data)
}
```

## Integration with UI Libraries

### reka-ui (Recommended)

**✅ Supports multiple stacked overlays**

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogContent } from 'reka-ui'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- Your content -->
    </DialogContent>
  </Dialog>
</template>
```

### shadcn-vue (Recommended)

**✅ Supports multiple stacked overlays**

```bash
# Initialize shadcn-vue
pnpm dlx shadcn-vue@latest init

# Add dialog component
pnpm dlx shadcn-vue@latest add dialog
```

```vue
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

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
        <DialogDescription>{{ overlay.data.message }}</DialogDescription>
      </DialogHeader>
      <!-- Your content -->
    </DialogContent>
  </Dialog>
</template>
```

### Radix Vue (Limited)

**⚠️ AlertDialog does NOT support stacking** - Only use Dialog

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogContent } from 'radix-vue'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- Your content -->
    </DialogContent>
  </Dialog>
</template>
```

### Headless UI

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogPanel } from '@headlessui/vue'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen" @close="overlay.dismiss()">
    <DialogPanel>
      <!-- Your content -->
    </DialogPanel>
  </Dialog>
</template>
```

## Migration from Beta

If you're upgrading from beta versions (0.3.x), please see the [Migration Guide](docs/MIGRATION.md).

### Key Breaking Changes in 1.0.0

1. **Dialog Requirement**: Must use `Dialog` (not `AlertDialog`) for stacking support
2. **Dependencies**: Requires `reka-ui` and `@radix-icons/vue`
3. **Full Reactivity**: All context properties are now reactive (computed refs)
4. **TypeScript Generics**: Better type inference with `useOverlayContext<TData, TResult>()`

## Comparison with overlay-rc (React)

| Feature | overlay-vue | overlay-rc |
|---------|-------------|------------|
| Framework | Vue 3 | React |
| API Style | Hooks (Composables) | Hooks |
| Context Access | `useCurrentOverlay()` | `useOverlay()` inside overlay |
| Reactivity | Vue Computed Refs | React State |
| Portal | Internal (no Teleport needed) | React Portal |
| Type Safety | ✅ Full TypeScript | ✅ Full TypeScript |
| Promise-based | ✅ | ✅ |
| Stacked Overlays | ✅ (with Dialog) | ✅ |
| Lifecycle Callbacks | ✅ | ✅ |

## Testing

Run tests with coverage:

```bash
npm test
# or
npm run test:coverage
```

Current coverage: **97%+**

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Related Projects

- [overlay-rc](https://github.com/YuJM/layouts-rc/tree/main/packages/overlay-rc) - React version

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.
