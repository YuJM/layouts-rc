# Overlay-manager-rc

English | [한국어](./README.ko.md)

[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 [Live Demo](https://layouts-rc-web.vercel.app/overlay)

Inspired by [angular cdk overlay](https://material.angular.io/cdk/overlay/overview)

> Lightweight (2KB), zero-dependency React overlay manager with hook-based API

> **📢 Upgrading from v0.9.x?** See the [Migration Guide](./docs/MIGRATION.md)

## Table of Contents

- [Overview](#overview)
- [What Makes It Different?](#what-makes-it-different)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [Create Overlay Component](#create-overlay-component)
  - [Open Overlay](#open-overlay)
  - [Manual ID Management](#manual-id-management)
- [API Reference](#api-reference)
  - [useOverlayManager](#useoverlaymanager)
  - [useOverlay](#useoverlay)
  - [useBeforeClose](#usebeforeclose)
- [Browser Support](#browser-support)
- [License](#license)

## Overview

In React applications, many overlay component codes such as dialogs, alerts, and sheets can cause maintenance difficulties:
- ❌ Manually managing open/close state in parent components
- ❌ Props drilling through multiple components
- ❌ Complex state management setup (Redux, Zustand, etc.)
- ❌ SSR hydration issues with IDs
- ❌ Memory leaks from forgotten cleanup

**overlay-manager-rc solves all of this with:**

- 📦 **Zero Dependencies** - No external dependencies, only peer deps on React
- 🪶 **Lightweight** - ~2KB minified + gzipped, smaller than a single image
- 🎯 **Hook-based API** - Clean and intuitive API with `useOverlay()` hook
- 🔄 **No state management** - Open/close state handled automatically
- 🆔 **SSR-safe** - Works seamlessly with Next.js, Remix, and other SSR frameworks
- 🎁 **Type-safe** - Full TypeScript support with generics
- 🔁 **Promise-based** - Natural async/await API for overlay results
- 🎭 **Lifecycle callbacks** - `onOpen`, `onClose`, `beforeClose` for fine-grained control
- 🔒 **Smart ID management** - Auto-closes existing overlay when opening with same ID
- ⚡ **Automatic cleanup** - Closed overlays removed after animations
- ⚛️ **React 18+ & 19** - Compatible with latest React versions

### Perfect For

- **Radix UI / shadcn/ui users** - Works seamlessly with headless UI libraries
- **Next.js projects** - SSR-safe with no hydration issues
- **TypeScript projects** - Full type inference for overlay data
- **Performance-conscious apps** - Minimal bundle impact (~2KB)
- **Complex overlay flows** - Sequential dialogs, confirmation chains, multi-step forms

## What Makes It Different?

**The Problem:** Managing overlays typically requires managing state in parent components, passing props, and writing lots of boilerplate code.

**The Solution:** Function-based overlay management - no state, no props, just simple function calls.

<details>
<summary><strong>📊 See Before/After Comparison</strong></summary>

### Traditional Way (Without overlay-manager-rc)

```tsx
// ❌ Parent component manages state
function ParentComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  const handleOpen = () => {
    setDialogData({ userId: 123 });
    setIsOpen(true);
  };

  const handleClose = (result) => {
    setIsOpen(false);
    // Handle result...
  };

  return (
    <>
      <Button onClick={handleOpen}>Open</Button>
      <MyDialog
        isOpen={isOpen}
        onClose={handleClose}
        data={dialogData}
      />
    </>
  );
}

// Dialog component needs props drilling
function MyDialog({ isOpen, onClose, data }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Use data here */}
    </Dialog>
  );
}
```

### With overlay-manager-rc

```tsx
// ✅ Parent component stays clean
function ParentComponent() {
  const { openOverlay } = useOverlayManager();

  const handleOpen = async () => {
    const result = await openOverlay({
      content: MyDialog,
      data: { userId: 123 }
    });
    // Handle result directly!
  };

  return <Button onClick={handleOpen}>Open</Button>;
}

// Dialog component accesses data via hook
function MyDialog() {
  const { isOpen, overlayData, closeOverlay } = useOverlay();

  return (
    <Dialog open={isOpen} onOpenChange={() => closeOverlay()}>
      {/* Use overlayData directly */}
    </Dialog>
  );
}
```

### Key Benefits

**1. No State in Parent Components**
```tsx
// ❌ Before: Manual state management
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isAlertOpen, setIsAlertOpen] = useState(false);
const [isSheetOpen, setIsSheetOpen] = useState(false);

// ✅ After: Just open when needed
openOverlay({ content: Dialog });
openOverlay({ content: Alert });
openOverlay({ content: Sheet });
```

**2. Promise-based Results**
```tsx
// ✅ Get results directly
const result = await openOverlay({
  content: ConfirmDialog,
  data: { message: 'Delete this?' }
});

if (result === 'confirmed') {
  await deleteItem();
}
```

**3. Sequential Flows Made Easy**
```tsx
// ✅ Chain overlays naturally
async function checkoutFlow() {
  const address = await openOverlay({ content: AddressForm });
  const payment = await openOverlay({ content: PaymentForm, data: address });
  const confirmed = await openOverlay({ content: ConfirmOrder, data: payment });

  if (confirmed) {
    await processOrder();
  }
}
```

**4. Type-Safe Data Passing**
```tsx
// ✅ Full type inference
interface FormData { name: string; email: string; }

const result = await openOverlay<FormData, boolean>({
  content: MyForm,
  data: { name: '', email: '' }
});
// result is typed as boolean | undefined
```

**5. No Props Drilling**
```tsx
// ❌ Before: Props through multiple levels
<Dialog>
  <DialogContent userId={userId}>
    <UserProfile userId={userId}>
      <UserActions userId={userId} />
    </UserProfile>
  </DialogContent>
</Dialog>

// ✅ After: Access data anywhere
function UserActions() {
  const { overlayData } = useOverlay<{ userId: number }>();
  // Use overlayData.userId directly
}
```

**6. Automatic Cleanup**
```tsx
// ❌ Before: Manual cleanup needed
useEffect(() => {
  return () => {
    // Remember to clean up!
  };
}, []);

// ✅ After: Automatic cleanup
// Just close the overlay - cleanup happens automatically
closeOverlay();
```

**7. Function-Based Management = Better Reusability**
```tsx
// ❌ Before: JSX declaration - hard to reuse
function UserList() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Delete</Button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="Delete this user?"
      />
    </>
  );
}
// Need to copy-paste this dialog in every component! 😱

// ✅ After: Reusable function - call anywhere
// utils/overlays.ts
export async function confirmDelete(itemName: string) {
  return await openOverlay({
    content: ConfirmDialog,
    data: {
      title: 'Confirm Delete',
      message: `Delete ${itemName}?`
    }
  });
}

// Use in any component!
function UserList() {
  const handleDelete = async (user) => {
    const confirmed = await confirmDelete(user.name);
    if (confirmed) await deleteUser(user.id);
  };
}

function ProductList() {
  const handleDelete = async (product) => {
    const confirmed = await confirmDelete(product.name);
    if (confirmed) await deleteProduct(product.id);
  };
}
```

**8. Easy Refactoring**
```tsx
// ✅ Business logic separated from UI
// services/user-service.ts
export async function deleteUserWithConfirm(userId: number) {
  const user = await fetchUser(userId);

  // Step 1: Confirm
  const confirmed = await openOverlay({
    content: ConfirmDialog,
    data: { message: `Delete ${user.name}?` }
  });

  if (!confirmed) return false;

  // Step 2: Show loading
  const loadingOverlay = openOverlay({
    content: LoadingDialog,
    data: { message: 'Deleting...' }
  });

  // Step 3: Delete
  await api.delete(`/users/${userId}`);
  closeOverlay(loadingOverlay);

  // Step 4: Success message
  await openOverlay({
    content: SuccessDialog,
    data: { message: 'User deleted!' }
  });

  return true;
}

// Component stays clean!
function UserActions({ userId }) {
  return (
    <Button onClick={() => deleteUserWithConfirm(userId)}>
      Delete
    </Button>
  );
}
```

</details>

## Installation

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

## Quick Start

### Step 1: Add OverlayContainer

Example with Next.js (App Router) + shadcn/ui (Radix UI)

Create `overlay-container-provider.tsx`:

```typescript jsx
'use client';

import type { ReactNode } from 'react';
import { OverlayContainer } from "overlay-manager-rc";

export function OverlayContainerNext({ children }: { children?: ReactNode }) {
  return <OverlayContainer/>;
}
```

### Step 2: Add to Layout

Add the container to your `layout.tsx`:

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

### Create Overlay Component

Access overlay context using the `useOverlay()` hook:

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function DemoAlertDialog() {
  // Access overlay context via hook
  const { overlayId, isOpen, overlayData, closeOverlay, dismiss } = useOverlay<string>();

  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && dismiss(); // Or use closeOverlay() - both work the same
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
          <AlertDialogCancel onClick={dismiss}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => closeOverlay('confirmed')}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### Open Overlay

```typescript jsx
'use client';

import { useOverlayManager } from 'overlay-manager-rc';

export function AlertSection() {
  const { openOverlay } = useOverlayManager();
  
  const handleOpenAlert = async () => {
    const result = await openOverlay({
      content: DemoAlertDialog,
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
      content: DemoAlertDialog,
      data: 'first alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // If 'custom-alert' is already open, it will close first
    await openOverlay({
      id: 'custom-alert',
      content: DemoAlertDialog,
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


## API Reference

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
| dismiss | () => void | Function to dismiss (cancel) the overlay without returning a result. Same as `closeOverlay()` |

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

## Browser Support

- Modern browsers with ES2020+ support
- Server-side rendering frameworks (Next.js, Remix, Gatsby, etc.)
- React 18.0.0+ or React 19.0.0+

## License

MIT
