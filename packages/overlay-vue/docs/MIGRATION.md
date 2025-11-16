# Migration Guide

## Migrating from Beta (0.3.x) to 1.0.0

Version 1.0.0 introduces significant improvements to reactivity, type safety, and overall API consistency. This guide will help you migrate from the beta versions to the stable 1.0.0 release.

### Breaking Changes

#### 1. Context API Changes

**Before (Beta):**
```vue
<script setup>
import { useCurrentOverlay } from 'overlay-manager-vue'

const overlay = useCurrentOverlay()
// Context was not fully reactive
</script>
```

**After (1.0.0):**
```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'

const overlay = useCurrentOverlay<DataType, ResultType>()
// Context is now fully reactive with proper TypeScript generics
</script>
```

**What changed:**
- `useCurrentOverlay` now returns a fully reactive context using Vue's `computed`
- Better TypeScript support with generic type parameters for data and result
- `overlay.isOpen` is now properly reactive and updates automatically

#### 2. Component Dialog Requirements

**Before (Beta):**
```vue
<!-- Could use AlertDialog (Radix Vue) -->
<template>
  <AlertDialog :open="overlay.isOpen">
    <AlertDialogContent>
      <!-- ... -->
    </AlertDialogContent>
  </AlertDialog>
</template>
```

**After (1.0.0):**
```vue
<!-- Must use Dialog (not AlertDialog) for stacking support -->
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- ... -->
    </DialogContent>
  </Dialog>
</template>
```

**What changed:**
- **AlertDialog does NOT support stacking** - only one can be open at a time
- **Dialog (from reka-ui/Radix Vue) supports stacking** - multiple overlays can be open simultaneously
- This aligns with React's overlay-rc behavior

**Action required:**
1. Replace all `AlertDialog` imports with `Dialog` imports
2. Install required dependencies:
   ```bash
   pnpm add reka-ui @radix-icons/vue
   ```
3. Update shadcn-vue to latest version:
   ```bash
   pnpm dlx shadcn-vue@latest add dialog
   ```

#### 3. OverlayHost Internal Changes

**Before (Beta):**
```typescript
// OverlayHost used Map directly
const overlays = computed(() => manager.getStates())
```

**After (1.0.0):**
```typescript
// OverlayHost converts Map to Array for v-for compatibility
const overlays = computed(() => Array.from(manager.getStates().entries()))
```

**What changed:**
- Internal implementation now properly converts Map to Array
- Vue's `v-for` cannot directly iterate over Map objects
- No API changes - this is internal only

**Action required:** None - this is handled automatically

### New Features in 1.0.0

#### 1. Full Reactivity Support

All overlay context properties are now properly reactive:

```vue
<script setup lang="ts">
const overlay = useCurrentOverlay<{ count: number }, void>()

// overlay.isOpen, overlay.data, overlay.id are all reactive
watch(() => overlay.isOpen, (isOpen) => {
  console.log('Overlay open state changed:', isOpen)
})
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <!-- Automatically re-renders when overlay.data changes -->
    <DialogTitle>Count: {{ overlay.data.count }}</DialogTitle>
  </Dialog>
</template>
```

#### 2. Multiple Overlay Stacking

You can now open multiple overlays simultaneously, just like React's overlay-rc:

```typescript
// Open multiple overlays at once
const result1 = openOverlay(DialogComponent1, { data: { step: 1 } })
const result2 = openOverlay(DialogComponent2, { data: { step: 2 } })
const result3 = openOverlay(DialogComponent3, { data: { step: 3 } })

// All three dialogs will be visible and stacked
```

#### 3. Improved TypeScript Support

```vue
<script setup lang="ts">
interface MyData {
  message: string
  count: number
}

interface MyResult {
  confirmed: boolean
  value?: string
}

// Full type safety
const overlay = useCurrentOverlay<MyData, MyResult>()

// TypeScript knows overlay.data is MyData
const message: string = overlay.data.message

// TypeScript knows close() expects MyResult
overlay.close({ confirmed: true, value: 'test' })
</script>
```

### Migration Checklist

- [ ] Update `package.json`: `"overlay-manager-vue": "^1.0.0"`
- [ ] Install required peer dependencies:
  ```bash
  pnpm add reka-ui @radix-icons/vue
  ```
- [ ] Replace all `AlertDialog` with `Dialog` in overlay components
- [ ] Update shadcn-vue components:
  ```bash
  pnpm dlx shadcn-vue@latest add dialog
  ```
- [ ] Add TypeScript generics to `useCurrentOverlay` calls
- [ ] Test overlay stacking functionality
- [ ] Remove any workarounds for reactivity issues
- [ ] Update component imports from `@/components/ui/alert-dialog` to `@/components/ui/dialog`

### Example: Complete Migration

**Before (Beta):**
```vue
<template>
  <AlertDialog :open="overlay.isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ overlay.data.title }}</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="overlay.dismiss()">Cancel</AlertDialogCancel>
        <AlertDialogAction @click="overlay.close(true)">Confirm</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

defineProps()
const overlay = useCurrentOverlay()
</script>
```

**After (1.0.0):**
```vue
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="overlay.dismiss()">Cancel</Button>
        <Button @click="overlay.close(true)">Confirm</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MyData {
  title: string
}

defineProps<MyData>()

const overlay = useCurrentOverlay<MyData, boolean>()
</script>
```

### Common Issues

#### Issue: "Multiple overlays not stacking"

**Cause:** Using `AlertDialog` instead of `Dialog`

**Solution:** Replace `AlertDialog` with `Dialog` from shadcn-vue

#### Issue: "Context not reactive"

**Cause:** Using beta version with old context implementation

**Solution:** Upgrade to 1.0.0 - reactivity is built-in

#### Issue: "TypeScript errors on overlay.data"

**Cause:** Missing type parameters on `useCurrentOverlay`

**Solution:**
```typescript
// ❌ Wrong
const overlay = useCurrentOverlay()

// ✅ Correct
const overlay = useCurrentOverlay<MyDataType, MyResultType>()
```

### Getting Help

If you encounter issues during migration:

1. Check the [Examples](../../../apps/vue-demo) for reference implementations
2. Review the [API Documentation](./API.md)
3. Open an issue on [GitHub](https://github.com/YuJM/layouts-rc/issues)

### Changelog

For a complete list of changes, see the [CHANGELOG.md](../CHANGELOG.md).
