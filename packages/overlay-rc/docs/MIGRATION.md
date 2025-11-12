# Migration Guide

[한국어](MIGRATION.ko.md)

## Migrating from v0.9.x to v1.0.0

v1.0.0 introduces a **breaking change** from props-based to hook-based API.

### Overview of Changes

v1.0.0 replaces the props-based API with a cleaner, more React-idiomatic hook-based approach using `useOverlay()`.

### Key Benefits

- 🎯 **Cleaner API** - No need to destructure props, use hooks instead
- 🔄 **Better Type Inference** - TypeScript types are easier to work with
- 📦 **Smaller Bundle** - Reduced overhead from prop passing
- ⚛️ **React Patterns** - Follows modern React conventions with hooks
- 🔧 **Standard Components** - Use any React component, not just specific typed components

### Before (v0.9.x - Props-based)

```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function TestContent({ open, data, close, id }: OverlayContentProps<string>) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && close()}>
      <AlertDialogContent>
        <AlertDialogDescription>{data}</AlertDialogDescription>
        <AlertDialogAction onClick={() => close('confirmed')}>OK</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### After (v1.0.0 - Hook-based)

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TestContent() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<string>();

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !v && closeOverlay()}>
      <AlertDialogContent>
        <AlertDialogDescription>{overlayData}</AlertDialogDescription>
        <AlertDialogAction onClick={() => closeOverlay('confirmed')}>OK</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### API Mapping Table

| v0.9.x (Props) | v1.0.0 (Hook) | Notes |
| --- | --- | --- |
| `open` prop | `isOpen` from `useOverlay()` | Boolean naming convention |
| `data` prop | `overlayData` from `useOverlay()` | More descriptive name |
| `close` prop | `closeOverlay` from `useOverlay()` | More descriptive name |
| `id` prop | `overlayId` from `useOverlay()` | More descriptive name |
| `OverlayContentProps<TData, TResult>` | `useOverlay<TData>()` | Hook-based instead of props |
| Manual ID with nanoid | Auto-generated with React `useId` | SSR-safe built-in IDs |

### Step-by-Step Migration

#### Step 1: Update Package Version

```bash
npm install overlay-manager-rc@latest
# or
yarn add overlay-manager-rc@latest
# or
pnpm add overlay-manager-rc@latest
```

#### Step 2: Replace Props with Hook

**Before:**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function MyOverlay({ open, data, close, id }: OverlayContentProps<MyData>) {
  // ...
}
```

**After:**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function MyOverlay() {
  const { isOpen, overlayData, closeOverlay, overlayId } = useOverlay<MyData>();
  // ...
}
```

#### Step 3: Update Property References

Replace all prop references with destructured hook values:

- `open` → `isOpen`
- `data` → `overlayData`
- `close()` → `closeOverlay()`
- `id` → `overlayId`

#### Step 4: Remove Type Imports

Remove `OverlayContentProps` import as it's no longer needed:

```diff
- import type { OverlayContentProps } from 'overlay-manager-rc';
+ import { useOverlay } from 'overlay-manager-rc';
```

### Common Migration Scenarios

#### Scenario 1: Simple Alert Dialog

**Before (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';
import { AlertDialog, AlertDialogContent, AlertDialogDescription } from '@/components/ui/alert-dialog';

export function SimpleAlert({ open, data, close }: OverlayContentProps<string>) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && close()}>
      <AlertDialogContent>
        <AlertDialogDescription>{data}</AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**After (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';
import { AlertDialog, AlertDialogContent, AlertDialogDescription } from '@/components/ui/alert-dialog';

export function SimpleAlert() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<string>();

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !v && closeOverlay()}>
      <AlertDialogContent>
        <AlertDialogDescription>{overlayData}</AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### Scenario 2: Form with Close Result

**Before (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

interface FormData { name: string; email: string; }
type FormResult = { submitted: boolean; data?: FormData };

export function FormOverlay({ open, data, close }: OverlayContentProps<FormData, FormResult>) {
  const handleSubmit = (formData: FormData) => {
    close({ submitted: true, data: formData });
  };

  const handleCancel = () => {
    close({ submitted: false });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      {/* form content */}
    </Dialog>
  );
}
```

**After (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

interface FormData { name: string; email: string; }
type FormResult = { submitted: boolean; data?: FormData };

export function FormOverlay() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<FormData>();

  const handleSubmit = (formData: FormData) => {
    closeOverlay({ submitted: true, data: formData });
  };

  const handleCancel = () => {
    closeOverlay({ submitted: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleCancel()}>
      {/* form content */}
    </Dialog>
  );
}
```

#### Scenario 3: Using Overlay ID

**Before (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function TrackedOverlay({ open, data, close, id }: OverlayContentProps<string>) {
  useEffect(() => {
    console.log('Overlay opened with ID:', id);
  }, [id]);

  return (
    <Dialog open={open}>
      <p>Overlay ID: {id}</p>
    </Dialog>
  );
}
```

**After (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TrackedOverlay() {
  const { isOpen, overlayData, closeOverlay, overlayId } = useOverlay<string>();

  useEffect(() => {
    console.log('Overlay opened with ID:', overlayId);
  }, [overlayId]);

  return (
    <Dialog open={isOpen}>
      <p>Overlay ID: {overlayId}</p>
    </Dialog>
  );
}
```

### Breaking Changes Summary

1. **Props removed**: `OverlayContentProps` is no longer available
2. **Hook required**: Must use `useOverlay()` hook inside overlay components
3. **Property names changed**: `open` → `isOpen`, `data` → `overlayData`, `close` → `closeOverlay`, `id` → `overlayId`
4. **Component type**: Content now accepts standard `ComponentType` instead of typed props components

### Non-Breaking Changes

The following APIs remain **unchanged**:

- `useOverlayManager()` hook
- `openOverlay()` function
- `closeOverlay()` function
- `closeAllOverlays()` function
- `OverlayContainer` component
- `useBeforeClose()` hook
- `OverlayOptions` interface
- All callback behaviors (`onOpen`, `onClose`, `beforeClose`)

### Troubleshooting

#### Error: "useOverlay must be used within an OverlayContainer"

**Cause**: Calling `useOverlay()` outside of an overlay component rendered by `OverlayContainer`.

**Solution**: Only use `useOverlay()` inside components passed to `openOverlay({ content: YourComponent })`.

#### TypeScript Error: "Property 'open' does not exist"

**Cause**: Still using old props-based API.

**Solution**: Replace props destructuring with `useOverlay()` hook.

### Need Help?

- [GitHub Issues](https://github.com/yujongmyeong/layouts-rc/issues)
- [Documentation](../README.md)

## License

MIT
