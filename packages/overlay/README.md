# Overlay-manager-rc

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

make file `OverlayManagerProvider.tsx`;

```typescript jsx
'use client';

import { useOverlayRegister } from 'overlay-manager-rc';
import type { ReactNode } from 'react';

export function OverlayManagerProvider({ children }: { children: ReactNode }) {
  const { OverlayProvider, overlays } = useOverlayRegister();

    return (
        <OverlayProvider>
            {children}
             {/* ---step2 ---*/}
        </OverlayProvider>
    );
}

```

### Step2

```typescript jsx
   {overlays.map((contentRender) => {
                const { close, content: ContentComponent, data } = contentRender;

                if (typeof ContentComponent !== 'function') {
                    return null;
                }
               /*----case 1----*/
  
                return <ContentComponent
                        close={contentRender.close}
                        data={contentRender.data}
                        id={contentRender.id}
                        key={contentRender.id}
                        open={contentRender.state}
                />
                
               /*----case 2----*/

/*
                return (
                    <AlertDialog
                        key={contentRender.id}
                        onOpenChange={(v) => {
                            !v && close();
                        }}
                        open={contentRender.state}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{contentRender.title}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <ContentComponent
                                      close={contentRender.close}
                                      data={contentRender.data}
                                      id={contentRender.id}
                                      open={contentRender.state}
                                    />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
*/

               
            })}
```

### Step3

set provider in `Rootlayout`component

```typescript jsx
  export default function RootLayout({ children }: { children: ReactNode }) {
  return (
          <html lang="en" suppressHydrationWarning>
            <body className={'min-h-screen font-sans antialiased dark'}>
                <OverlayManagerProvider>{children}</OverlayManagerProvider>
            </body>
          </html>
  );
}

```

## Usage

### Create overlay component

```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function OverlayContentComponent({ data, close, open }: OverlayContentProps<string>) {
    /*case1*/
    return (<AlertDialog
                    open={open}
                    onOpenChange={(v) => {
                      !v && close();
                    }}
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
    
    /*----*case2-----*/
   /*
    return (<div>Get Data: {data}</div>)
    */
}
```
you can arrow function component
```typescript jsx
import type { OverlayContentComponent } from 'overlay-manager-rc';

export const OverlayContentComponent:OverlayContentComponent<string> = ({ data, close })  => {
  /* ----- ------------------*/
} 
```

### Open overlay

```typescript jsx
'use client';

import { useOverlayManager } from 'overlay-manager-rc';

export function OverlaySection() {
  const { overlayOpen } = useOverlayManager();


  const handleOpenAlert = () => {
    overlayOpen?.({
      content: OverlayContentComponent,
      data: 'Input Data',
      close: () => {
          // close logic
      }
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
export function OverlayContentComponent({data, close}: OverlayContentProps<string, boolean>) {

  return (<div>Get Data: {data}
    <button onClick={() => {close(false);}}>close</button>
  </div>)
}

/* open handler*/
const handleOpenAlert = () => {
  overlayOpen?.({
    content: OverlayContentComponent,
    data: 'Input Data',
    close: (result) => {
      console.log(result);
    }
  });
}
```
## API

`OverlayContentProps<T,R>`

| Prop  | Type                 | Default | Required |
| ----- | -------------------- | ------- |----------|
| data  | T                    | -       | Yes      |
| close | OverlayCloseType<R>  | -       | Yes      |
| id    | OverlayId            | -       | -        |
| open  | boolean              | -       | Yes      |



`OverlayOpenOption` option

| Prop           | Type                       | Default | Required |
| -------------- | -------------------------- | ------- |----------|
| title          | ReactNode                  | -       |          |
| content        | OverlayContentComponent<T, R> | -       | Yes      |
| data           | T                          | -       |          |
| close          | OverlayCloseType<R>        | -       |          |
| width          | CSSProperties['width']     | -       |          |
| height         | CSSProperties['height']    | -       |          |
| style          | CSSProperties              | -       |          |
| className      | string                     | -       |          |
| position       | OverlayPositionType        | -       |          |
| overlayHidden  | boolean                    | false   |          |
| kind           | 'overlay' \| 'sheet' \| 'modal' \| 'confirm' | -       |          |


