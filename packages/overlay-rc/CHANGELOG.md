# overlay-manager-rc

## 1.0.0

### Major Changes

- **BREAKING**: Migrated from props-based to hook-based API
  - Replace `OverlayContentProps` with `useOverlay()` hook
  - Property names changed: `open` → `isOpen`, `data` → `overlayData`, `close` → `closeOverlay`, `id` → `overlayId`
  - ID generation changed from nanoid to React `useId` (format: `:R19utj6:-overlay-0`)
  - See [Migration Guide](./docs/MIGRATION.md) for details

### Benefits

- 🎯 Cleaner, more React-idiomatic API
- 🔄 Better TypeScript type inference
- 📦 Smaller bundle size
- ⚛️ Follows modern React patterns with hooks

### Migration

**Before (v0.9.x):**
```tsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function MyOverlay({ open, data, close }: OverlayContentProps<string>) {
  return <Dialog open={open}>{data}</Dialog>;
}
```

**After (v1.0.0):**
```tsx
import { useOverlay } from 'overlay-manager-rc';

export function MyOverlay() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<string>();
  return <Dialog open={isOpen}>{overlayData}</Dialog>;
}
```

## 0.10.0

### Minor Changes

- Migrated from `@preact/signals-react` to React's `useSyncExternalStore`
- Bundle size reduced by 28%
- Better React 18+ compatibility
- No breaking changes for users

## 0.9.1

- Adjust cleanup timing and fixes

## 0.9.0

- Add auto cleanup for closed overlays

## 0.8.x

- Documentation improvements
- Korean documentation added

## 0.7.x - 0.8.0

- React 19 support
- Custom ID feature
- Bug fixes

## 0.6.0

- Render optimization

## 0.5.0

- Initial stable release
