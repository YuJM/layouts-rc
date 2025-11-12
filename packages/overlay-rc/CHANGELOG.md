# overlay-manager-rc

## 0.10.0

### Minor Changes

- **BREAKING INTERNAL CHANGE**: Migrated from `@preact/signals-react` to React's native `useSyncExternalStore`
  - ✅ Zero breaking changes for users - all APIs remain identical
  - ✅ Bundle size reduced by 28% (3.1 KB smaller)
  - ✅ Removed external dependency on `@preact/signals-react`
  - ✅ Better React 18+ compatibility with official Concurrent Features
  - ✅ Improved type safety with React's built-in types
  - ✅ SSR support with `getServerSnapshot`

### Implementation Details

- Added new `overlay-store.ts` for state management
- Refactored `use-overlay-manager.tsx` to use `useSyncExternalStore`
- Updated `overlay-container.tsx` to remove `useSignals()`
- Updated `use-before-close.tsx` to use new store
- Removed `@preact/signals-react` dependency from package.json
- Updated tsconfig.json to remove signals types

### Migration Guide

No migration needed! Simply update the package:

```bash
pnpm update overlay-manager-rc
# or
npm update overlay-manager-rc
# or
yarn upgrade overlay-manager-rc
```

All existing code will work without any changes.

## 0.9.1

### Patch Changes

- adjust time and fix

## 0.9.0

### Minor Changes

- add auto cleanup for closed overlays after 30 seconds

## 0.8.4

### Patch Changes

- fix document

## 0.8.3

### Patch Changes

- fix and update document

## 0.8.2

### Patch Changes

- add ko document

## 0.8.1

### Patch Changes

- little fix

## 0.8.0

### Minor Changes

- fix and react 19 available

## 0.7.5

### Patch Changes

- fix package.json

## 0.7.1

### Patch Changes

- fix: onClose bugFix

## 0.7.0

### Minor Changes

- update(overlay): id 기능 추가

## 0.6.0

### Minor Changes

- refactor render optimization

## 0.5.0

### Minor Changes

- update document and file fix
