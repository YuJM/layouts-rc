# Overlay-manager-rc

English | [한국어](./README.ko.md)

[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Inspired by [angular cdk overlay](https://material.angular.io/cdk/overlay/overview)

> React overlay component manager with hook-based API

## Features

- 🎯 **Hook-based API** - Access overlay data via `useOverlay()` hook (v1.0.0+)
- 🔄 **No state management** - Open/close state handled automatically
- 🆔 **SSR-safe IDs** - Automatic unique ID generation
- 📦 **Multiple overlays** - Support multiple overlays without conflicts
- 🎁 **Type-safe data** - Pass typed data to overlay components
- ✅ **Close prevention** - `beforeClose` logic with async support
- 🚫 **Optimized rendering** - No unnecessary re-renders
- ⚛️ **React 18+ & 19** - Full support for modern React versions

## Install

npm

```shell
npm install overlay-manager-rc
```

yarn

```shell
yarn add overlay-manager-rc
```

pnpm

```shell
pnpm add overlay-manager-rc
```

## Setting

ex) nextjs(app router) + shadcn-ui(radix-ui)

already install

- alert-dialog

### Step1

make file `overlay-manager-provider.tsx`;

```typescript jsx
'use client';

import type { ReactNode } from 'react';
import { OverlayContainer } from "overlay-manager-rc";

export function OverlayContainerNext({ children }: { children?: ReactNode }) {
  return <OverlayContainer/>;
}
```

### Step2

set provider in `layout.tsx` component

```typescript jsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen font-sans antialiased dark')}>
        {children}
        <OverlayContainerNext />
      </body>
    </html>
  );
}
```

## Usage

### Create overlay component

**v1.0.0+** uses hook-based API with `useOverlay()`:

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TestContent() {
  // Access overlay context via hook
  const { overlayId, isOpen, overlayData, closeOverlay } = useOverlay<string>();

  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && closeOverlay();
      }}
      open={isOpen}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert title</AlertDialogTitle>
          <AlertDialogDescription>
            Get Data: {overlayData}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => closeOverlay('confirmed')}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Open overlay

```typescript jsx
'use client';

import { useOverlayManager } from 'overlay-manager-rc';

export function AlertSection() {
  const { openOverlay } = useOverlayManager();
  
  const handleOpenAlert = async () => {
    const result = await openOverlay({ 
      content: TestContent,
      data: 'hello!!!!',
      onClose: (result) => {
        console.log('Dialog closed with result:', result);
      },
      onOpen: (id) => {
        console.log('Overlay opened with id:', id);
      },
    });
    console.log('Result from openOverlay:', result); // Same value as onClose result
  };

  return (
    <section className="md:h-screen">
      <div className="flex flex-col gap-10">
        <Button onClick={handleOpenAlert}>
          show alert
        </Button>
      </div>
    </section>
  );
}
```
### Manual ID Management

When you specify a manual ID and an overlay with the same ID is already open, the existing overlay will automatically close before opening the new one.

```typescript jsx
'use client';

import { useOverlayManager } from 'overlay-manager-rc';

export function AlertSection() {
  const { openOverlay } = useOverlayManager();
  
  const handleOpenAlert = async () => {
    // This will close any existing overlay with ID 'custom-alert' 
    // before opening the new one
    await openOverlay({ 
      id: 'custom-alert',
      content: TestContent,
      data: 'first alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // If 'custom-alert' is already open, it will close first
    await openOverlay({ 
      id: 'custom-alert',
      content: TestContent,
      data: 'second alert!',
    });
  };

  return (
    <section className="md:h-screen">
      <div className="flex flex-col gap-10">
        <Button onClick={handleOpenAlert}>First Alert</Button>
        <Button onClick={handleOpenAnotherAlert}>Second Alert</Button>
      </div>
    </section>
  );
}
```


## API

### useOverlayManager

Returns an object with overlay management functions.

| Name | Description | Parameter |
| --- | --- | --- |
| openOverlay | Opens an overlay component. Returns a Promise that resolves with the close result. | OverlayOptions |
| closeOverlay | Closes an overlay component by ID. | id: string |
| closeAllOverlays | Closes all overlay components. | - |
| overlays | Array of all current overlay states. | - |

#### OverlayOptions<TData, TResult>

| Prop | Type | Default | Required |
| --- | --- | --- | --- |
| id | string | Auto-generated | No |
| content | ComponentType (React Component) | - | Yes |
| data | TData | - | No |
| onClose | (result?: TResult) => void \| Promise<void> | - | No |
| onOpen | (id: string) => void \| Promise<void> | - | No |
| beforeClose | () => boolean \| Promise<boolean> | - | No |

### useOverlay<TData>()

Hook for accessing overlay context inside overlay components. **Must be used within an overlay component rendered by OverlayContainer.**

**Returns:**

| Property | Type | Description |
| --- | --- | --- |
| overlayId | string | Unique ID of the overlay |
| isOpen | boolean | Whether the overlay is currently open |
| overlayData | TData | Data passed to the overlay via `openOverlay()` |
| closeOverlay | (result?: TResult) => void | Function to close the overlay with optional result |

### useBeforeClose

Hook that executes logic before closing the overlay. Used to prevent closing based on conditions (e.g., unsaved changes).

**Usage:**

```typescript jsx
import { useOverlay, useBeforeClose } from 'overlay-manager-rc';

export function FormOverlay() {
  const { overlayId, overlayData, closeOverlay } = useOverlay();
  const [isDirty, setIsDirty] = useState(false);

  useBeforeClose(async () => {
    if (isDirty) {
      const canClose = window.confirm('You have unsaved changes. Are you sure?');
      return canClose; // true = allow close, false = prevent close
    }
    return true;
  }, overlayId);

  // ... rest of component
}
```

## Migration Guide

Upgrading from v0.9.x? See the [**Migration Guide**](./docs/MIGRATION.md) for detailed instructions on migrating to v1.0.0.

## License

MIT
