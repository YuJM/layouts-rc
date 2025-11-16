# API Reference

Complete API documentation for overlay-manager-vue v1.0.0.

## Core Composables

### `useOverlay()`

Hook for opening overlays from anywhere in your application.

**Import:**
```typescript
import { useOverlay } from 'overlay-manager-vue'
```

**Signature:**
```typescript
function useOverlay(): {
  open: <TData = any, TResult = any>(
    component: Component,
    options?: OverlayOptions<TData>
  ) => Promise<OverlayResult<TResult>>
}
```

**Returns:**

Object with `open` method that accepts:
- `component`: Vue component to render as overlay
- `options`: Configuration options (optional)

**Example:**
```typescript
const { open } = useOverlay()

const result = await open(MyDialog, {
  props: { title: 'Hello', message: 'World' },
  onMounted: () => console.log('Dialog mounted'),
})
```

---

### `useOverlayContext()`

Hook for accessing overlay context **inside** an overlay component.

**Import:**
```typescript
import { useOverlayContext } from 'overlay-manager-vue'
```

**Signature:**
```typescript
function useOverlayContext<TData = any, TResult = any>(): OverlayContext<TData, TResult>
```

**Returns:**

Fully reactive context object with:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique overlay identifier |
| `isOpen` | `boolean` | Reactive open state (computed) |
| `data` | `TData` | Props passed to overlay (reactive) |
| `close(result?: TResult)` | `Promise<void>` | Close overlay with result |
| `dismiss(reason?: unknown)` | `void` | Dismiss overlay (reject promise) |

**Important:**
- ⚠️ Can only be used inside components rendered by `OverlayHost`
- All properties are fully reactive using Vue's `computed`
- Use TypeScript generics for type safety

**Example:**
```typescript
interface MyData {
  title: string
  message: string
}

interface MyResult {
  confirmed: boolean
}

const overlay = useOverlayContext<MyData, MyResult>()

// Access reactive data
console.log(overlay.data.title) // TypeScript knows this is a string

// Close with typed result
overlay.close({ confirmed: true })

// Watch reactive properties
watch(() => overlay.isOpen, (isOpen) => {
  console.log('Open state:', isOpen)
})
```

---

### `useOverlayController()`

Hook for imperative overlay control with a controller object.

**Import:**
```typescript
import { useOverlayController } from 'overlay-manager-vue'
```

**Signature:**
```typescript
function useOverlayController<TData = any, TResult = any>(
  component: Component,
  options?: OverlayOptions<TData>
): OverlayController<TResult>
```

**Returns:**

Controller object with:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique overlay identifier |
| `result` | `Promise<OverlayResult<TResult>>` | Promise that resolves on close |
| `close(result?: TResult)` | `Promise<void>` | Close overlay externally |
| `dismiss(reason?: unknown)` | `void` | Dismiss overlay externally |

**Example:**
```typescript
const controller = useOverlayController(MyDialog, {
  props: { title: 'Loading' }
})

// Access overlay ID
console.log(controller.id)

// Close after 3 seconds
setTimeout(() => {
  controller.close({ success: true })
}, 3000)

// Wait for result
const result = await controller.result
console.log('Dialog closed with:', result.data)
```

---

## Components

### `<OverlayHost />`

Component that renders all active overlays. Must be placed once in your app root.

**Import:**
```typescript
import { OverlayHost } from 'overlay-manager-vue'
```

**Usage:**
```vue
<template>
  <div id="app">
    <YourContent />
    <OverlayHost />
  </div>
</template>
```

**Props:** None

**Features:**
- Automatically manages all overlay lifecycle
- Handles mounting/unmounting callbacks
- Provides reactive context to each overlay
- Supports multiple stacked overlays

---

## Types

### `OverlayOptions<TData>`

Configuration options when opening an overlay.

```typescript
interface OverlayOptions<TData = any> {
  /**
   * Props to pass to the overlay component
   */
  props?: TData

  /**
   * Guard function called before closing
   * Return false to prevent closing
   */
  beforeClose?: () => boolean | Promise<boolean>

  /**
   * Callback after component is mounted
   */
  onMounted?: () => void

  /**
   * Callback after component is unmounted
   * Use for cleanup operations
   */
  onUnmounted?: () => void
}
```

**Example:**
```typescript
await open(MyDialog, {
  props: { userId: 123 },
  beforeClose: async () => {
    return window.confirm('Close without saving?')
  },
  onMounted: () => {
    console.log('Dialog mounted')
  },
  onUnmounted: () => {
    console.log('Dialog unmounted - cleanup here')
  },
})
```

---

### `OverlayResult<T>`

Result object when overlay is closed successfully.

```typescript
interface OverlayResult<T = any> {
  /**
   * Result type - always 'close' for successful closure
   */
  type: 'close'

  /**
   * Data returned from overlay.close(data)
   */
  data?: T
}
```

**Example:**
```typescript
const result = await open<any, { confirmed: boolean }>(MyDialog, {...})

if (result.type === 'close') {
  console.log('User confirmed:', result.data?.confirmed)
}
```

---

### `OverlayError`

Error object when overlay is dismissed.

```typescript
interface OverlayError {
  /**
   * Error type - 'dismiss' or 'error'
   */
  type: 'dismiss' | 'error'

  /**
   * Reason for dismissal passed to overlay.dismiss(reason)
   */
  reason?: unknown
}
```

**Example:**
```typescript
try {
  const result = await open(MyDialog, {...})
} catch (error: OverlayError) {
  if (error.type === 'dismiss') {
    console.log('User dismissed:', error.reason)
  }
}
```

---

### `OverlayContext<TData, TResult>`

Context object available inside overlay components.

```typescript
interface OverlayContext<TData = any, TResult = any> {
  /**
   * Unique overlay identifier
   */
  id: string

  /**
   * Reactive open state (computed ref)
   * Automatically updates when overlay opens/closes
   */
  isOpen: boolean

  /**
   * Props passed to the overlay (reactive)
   * Automatically updates when props change
   */
  data: TData

  /**
   * Close overlay with result (resolves promise)
   */
  close: (result?: TResult) => Promise<void>

  /**
   * Dismiss overlay (rejects promise, bypasses beforeClose)
   */
  dismiss: (reason?: unknown) => void
}
```

**Reactivity Notes:**
- All properties are fully reactive using Vue's `computed`
- `isOpen` automatically reflects the current state
- `data` automatically updates when props change
- Can be watched with Vue's `watch` or `watchEffect`

**Example:**
```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useOverlayContext } from 'overlay-manager-vue'

interface UserData {
  name: string
  age: number
}

const overlay = useOverlayContext<UserData, boolean>()

// Watch reactive properties
watch(() => overlay.isOpen, (isOpen) => {
  console.log('Overlay is now:', isOpen ? 'open' : 'closed')
})

watch(() => overlay.data.name, (name) => {
  console.log('User name changed to:', name)
})

// Use in template - automatically reactive
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogTitle>Hello {{ overlay.data.name }}</DialogTitle>
    <DialogDescription>Age: {{ overlay.data.age }}</DialogDescription>
  </Dialog>
</template>
```

---

### `OverlayController<TResult>`

Controller object for imperative overlay control.

```typescript
interface OverlayController<TResult = any> {
  /**
   * Unique overlay identifier
   */
  id: string

  /**
   * Promise that resolves when overlay is closed
   * Rejects when overlay is dismissed
   */
  result: Promise<OverlayResult<TResult>>

  /**
   * Close overlay externally with result
   */
  close: (result?: TResult) => Promise<void>

  /**
   * Dismiss overlay externally
   */
  dismiss: (reason?: unknown) => void
}
```

**Example:**
```typescript
// Create controller
const controller = useOverlayController(LoadingDialog, {
  props: { message: 'Loading...' }
})

// Start async operation
fetchData()
  .then(data => {
    // Close on success
    controller.close({ success: true, data })
  })
  .catch(error => {
    // Dismiss on error
    controller.dismiss({ error: error.message })
  })

// Wait for result
try {
  const result = await controller.result
  console.log('Success:', result.data)
} catch (error) {
  console.log('Failed:', error.reason)
}
```

---

## Advanced Usage

### Type Safety with Generics

Use TypeScript generics for full type safety:

```typescript
// Define your data and result types
interface FormData {
  name: string
  email: string
  age: number
}

interface FormResult {
  submitted: boolean
  values?: FormData
}

// In overlay component
const overlay = useOverlayContext<FormData, FormResult>()

// TypeScript knows overlay.data has these properties
const name: string = overlay.data.name
const email: string = overlay.data.email
const age: number = overlay.data.age

// TypeScript enforces correct result type
overlay.close({
  submitted: true,
  values: { name, email, age }
})

// When opening
const result = await open<FormData, FormResult>(FormDialog, {
  props: {
    name: 'John',
    email: 'john@example.com',
    age: 30
  }
})

// TypeScript knows result.data structure
if (result.data.submitted) {
  console.log('Form values:', result.data.values)
}
```

---

### Reactivity Patterns

All context properties are reactive and can be watched:

```vue
<script setup lang="ts">
import { watch, watchEffect } from 'vue'
import { useOverlayContext } from 'overlay-manager-vue'

const overlay = useOverlayContext<{ count: number }, void>()

// Watch specific property
watch(() => overlay.isOpen, (isOpen) => {
  if (isOpen) {
    console.log('Overlay opened')
  } else {
    console.log('Overlay closed')
  }
})

// Watch data changes
watch(() => overlay.data.count, (count) => {
  console.log('Count changed to:', count)
})

// Watch multiple properties
watch(
  () => [overlay.isOpen, overlay.data.count],
  ([isOpen, count]) => {
    console.log('State:', { isOpen, count })
  }
)

// Immediate effect
watchEffect(() => {
  console.log('Current state:', {
    id: overlay.id,
    isOpen: overlay.isOpen,
    count: overlay.data.count
  })
})
</script>
```

---

### BeforeClose Guard

Prevent overlay from closing with a guard function:

```typescript
const result = await open(FormDialog, {
  beforeClose: async () => {
    // Check if form has unsaved changes
    if (hasUnsavedChanges()) {
      return window.confirm('You have unsaved changes. Close anyway?')
    }
    return true
  },
})
```

**Guard Behavior:**
- Called before `overlay.close()` completes
- If returns `false`, overlay stays open
- If returns `true` or `undefined`, overlay closes
- Can be async (return `Promise<boolean>`)
- NOT called for `overlay.dismiss()` (force close)

**Force Close:**
```typescript
// Inside overlay component
overlay.dismiss('force_close') // Bypasses beforeClose guard
```

---

### Lifecycle Callbacks

Execute code when overlay mounts or unmounts:

```typescript
const result = await open(MyDialog, {
  onMounted: () => {
    console.log('Overlay mounted')
    // Initialize resources
    setupEventListeners()
    startAnimation()
  },
  onUnmounted: () => {
    console.log('Overlay unmounted')
    // Cleanup resources
    removeEventListeners()
    clearTimers()
  },
})
```

**Callback Timing:**
- `onMounted`: Called after component is mounted to DOM
- `onUnmounted`: Called after component is removed from DOM
- Both callbacks are optional
- Callbacks run ONCE per overlay instance

---

### Multiple Stacked Overlays

Open multiple overlays simultaneously:

```typescript
// Open first overlay
const promise1 = open(Dialog1, { props: { step: 1 } })

// Open second overlay (stacked on top)
const promise2 = open(Dialog2, { props: { step: 2 } })

// Open third overlay (stacked on top)
const promise3 = open(Dialog3, { props: { step: 3 } })

// All three overlays are visible and interactive
// Each has independent state and context

// Wait for all to close
const results = await Promise.all([promise1, promise2, promise3])
```

**Important:**
- Requires `Dialog` component (not `AlertDialog`)
- Each overlay has independent context
- Last opened overlay is on top (highest z-index)
- Can close in any order

---

### Sequential Overlay Chain

Open overlays in sequence, where each can open the next:

```vue
<script setup lang="ts">
import { useOverlayContext, useOverlay } from 'overlay-manager-vue'

interface StepData {
  step: number
  totalSteps: number
}

const overlay = useOverlayContext<StepData, void>()
const { open } = useOverlay()

const handleNext = async () => {
  if (overlay.data.step < overlay.data.totalSteps) {
    // Open next step (keeps current open - stacked)
    await open(SequentialDialog, {
      props: {
        step: overlay.data.step + 1,
        totalSteps: overlay.data.totalSteps,
      },
    })
  }

  // Close current step
  overlay.close()
}
</script>
```

---

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const result = await open(MyDialog, { props: {...} })

  // Handle success
  console.log('Dialog closed with:', result.data)

} catch (error: OverlayError) {
  // Handle dismissal
  if (error.type === 'dismiss') {
    console.log('User dismissed dialog:', error.reason)
  } else if (error.type === 'error') {
    console.error('Overlay error:', error.reason)
  }
}
```

### Promise-Based Pattern

```typescript
open(MyDialog, { props: {...} })
  .then(result => {
    console.log('Success:', result.data)
  })
  .catch(error => {
    console.log('Dismissed:', error.reason)
  })
```

### Controller Pattern

```typescript
const controller = useOverlayController(MyDialog, { props: {...} })

controller.result
  .then(result => console.log('Closed:', result.data))
  .catch(error => console.log('Dismissed:', error.reason))

// Control externally
setTimeout(() => {
  controller.close({ timeout: true })
}, 5000)
```

---

## Best Practices

### 1. Always Use TypeScript Generics

```typescript
// ✅ Good - Type safe
const overlay = useOverlayContext<UserData, UserResult>()

// ❌ Bad - No type safety
const overlay = useOverlayContext()
```

### 2. Define Props with defineProps

```typescript
// ✅ Good - Avoids Vue warnings
interface MyProps {
  title: string
}

defineProps<MyProps>()

const overlay = useOverlayContext<MyProps, void>()

// ❌ Bad - Vue warning about props
const overlay = useOverlayContext<MyProps, void>()
```

### 3. Use Dialog, Not AlertDialog

```vue
<!-- ✅ Good - Supports stacking -->
<Dialog :open="overlay.isOpen">
  <DialogContent>...</DialogContent>
</Dialog>

<!-- ❌ Bad - Only one can be open -->
<AlertDialog :open="overlay.isOpen">
  <AlertDialogContent>...</AlertDialogContent>
</AlertDialog>
```

### 4. Don't Use Teleport

```vue
<!-- ✅ Good - OverlayHost handles rendering -->
<Dialog :open="overlay.isOpen">
  <DialogContent>...</DialogContent>
</Dialog>

<!-- ❌ Bad - Unnecessary, may cause issues -->
<Teleport to="body">
  <Dialog :open="overlay.isOpen">
    <DialogContent>...</DialogContent>
  </Dialog>
</Teleport>
```

### 5. Cleanup in onUnmounted

```typescript
// ✅ Good - Proper cleanup
await open(MyDialog, {
  onMounted: () => {
    const interval = setInterval(() => {...}, 1000)
  },
  onUnmounted: () => {
    clearInterval(interval)
  },
})

// ❌ Bad - Memory leak
await open(MyDialog, {
  onMounted: () => {
    setInterval(() => {...}, 1000)
  },
})
```

---

## Migration Notes

If upgrading from beta versions, see [Migration Guide](MIGRATION.md).

Key changes in v1.0.0:
- All context properties are now fully reactive
- Must use `Dialog` (not `AlertDialog`) for stacking
- TypeScript generics provide better type inference
- Dependencies: `reka-ui` and `@radix-icons/vue` required
