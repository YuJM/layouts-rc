# Overlay-manager-rc
Inspired by [angular cdk overlay](https://material.angular.io/cdk/overlay/overview)
> React overlay component manager

## Feature

- (alert-dialog, dialog, sheet...) open, close state **no more management**.
- **You don't need to worry about declaring overlay component**.
- It's okay to have multiple overlay.
- Delivering data to overlay component Props.
- Detect when an overlay component is closed.
  - The resulting data is received on close.

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
- dialog
- sheet

### Step1

make file `overlay-manager-provider.tsx`;

```typescript jsx
'use client';

import type { ReactNode } from 'react';
import { OverlayContainer } from "overlay-manager-rc";

export function OverlayManagerProvider({ children }: { children?: ReactNode }) {
  return <OverlayContainer>{children}</OverlayContainer>;
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
        <OverlayManagerProvider />
      </body>
    </html>
  );
}
```

## Usage

### Create overlay component

```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function TestContent({
  open,
  data,
  close,
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
  
  const handleOpenAlert = () => {
    openOverlay({
      content: TestContent,
      data: 'hello!!!!'
    });
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

#### Receive resulting data when closing

```typescript jsx
export function TestContent({data, close}: OverlayContentProps<string, boolean>) {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Alert title</AlertDialogTitle>
          <AlertDialogDescription>Get Data: {data}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* open handler */
const handleOpenAlert = () => {
  openOverlay({
    content: TestContent,
    data: 'hello!!!!',
    onClose: (result) => {
      console.log('Dialog closed with result:', result);
    }
  });
};
```

## API
### useOverlayManager
**returns**

| name            | description                   | parameter         |
|-----------------|-------------------------------|-------------------|
| openOverlay     | open overlay component        | OverlayOptions    |
| closeAllOverlays| close all overlay components  | -                 |

#### OverlayOptions<TData, TResult>

| Prop           | Type                                         | Default | Required   |
|----------------|----------------------------------------------|---------|------------|
| id             | string                                       | -       | No         |
| content        | OverlayContent<TData, TResult>               | -       | Yes        |
| data           | TData                                        | -       | No         |
| onClose        | (result?: TResult) => void                   | -       | No         |

#### OverlayContentProps<TData, TResult>

| Prop  | Type                                | Default | Required |
| ----- | ----------------------------------- | ------- |----------|
| data  | TData                               | -       | Yes      |
| close | (result?: TResult) => void          | -       | Yes      |
| open  | boolean                             | -       | Yes      |





