# Overlay-manager-rc

English | [한국어](./README.ko.md)

Inspired by [angular cdk overlay](https://material.angular.io/cdk/overlay/overview)

> React overlay component manager

## Feature

- (alert-dialog, dialog, sheet...) open, close state **no more management**.
- **You don't need to worry about declaring overlay component**. It's okay to have multiple overlays.
- Delivering data to overlay component props.
- Detect when an overlay component is closed; the resulting data is received on close.
- **Prevent closing with beforeClose logic.** **Asynchronous result handling with await.**
- **Simplified API with automatic ID management.**
- **No unnecessary renders when opening or closing overlay components.**
- **React 19 support**

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

```typescript jsx
import type {OverlayContentProps} from 'overlay-manager-rc';
import {useBeforeClose} from 'overlay-manager-rc'; // Import useBeforeClose

export function TestContent({
  open,
  data,
  close,
  id // add id prop
}: OverlayContentProps<string>) {

  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && close();
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert title</AlertDialogTitle>
          <AlertDialogDescription>Get Data: {data}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
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
      data: 'old alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // If 'custom-alert' is already open, it will close first
    await openOverlay({ 
      id: 'custom-alert',
      content: TestContent,
      data: 'new alert!',
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

**returns**

| name | description | parameter |
| --- | --- | --- |
| openOverlay | Opens an overlay component. Returns a Promise. | OverlayOptions |
| closeAllOverlays | Closes all overlay components. | - |
| closeOverlayById | Closes an overlay component by ID. | id: string |

#### OverlayOptions<TData, TResult>

| Prop | Type | Default | Required |
| --- | --- | --- | --- |
| id | string | - | No |
| content | OverlayContent<TData, TResult> | - | Yes |
| data | TData | - | No |
| onClose | (result?: TResult) => void \| Promise<void> | - | No |
| onOpen | (id: string) => void \| Promise<void> | - | No |
| beforeClose | () => boolean \| Promise<boolean> | - | No |

#### OverlayContentProps<TData, TResult>

| Prop | Type | Default | Required |
| --- | --- | --- | --- |
| data | TData | - | Yes |
| close | (result?: TResult) => void | - | Yes |
| open | boolean | - | Yes |
| id | string | - | Yes |

#### useBeforeClose

When the manager tries to run an overlay with the same id
function that executes before closing the overlay


```typescript jsx
import { useBeforeClose } from 'overlay-manager-rc/useBeforeClose';

// ... inside your overlay component
useBeforeClose(async () => {
  // Your logic to determine whether to prevent closing.
  // For example, check if a form is dirty.
  const canClose = window.confirm('Are you sure you want to close?');
  return canClose; // Return true to allow closing, false to prevent it.
}, id); // Pass the overlay's ID
```
