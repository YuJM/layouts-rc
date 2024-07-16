# Overlay-manger-rc

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

export function OverlayManagerProvider<T = never, R = never>({
                                                                 children,
                                                             }: {
    children: ReactNode;
}) {
    const { OverlayProvider, overlays } = useOverlayRegister<T, R>();

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

                return (
                    <AlertDialog
                        key={contentRender.id}
                        onOpenChange={(v) => {
                            !v && close();
                        }}
                        open={contentRender.status}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <ContentComponent
                                        close={close}
                                        data={data}
                                        id={contentRender.id}
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
                /* if (kind === 'sheet') {
                          return (
                            <Sheet.Root
                              key={contentRender.id}
                              modal={overlay}
                              onOpenChange={(v) => !v && close()}
                              open={contentRender.status}
                            >
                              <Sheet.Panel
                                css={providerSheetPanelStyle}
                                height={contentRender.height}
                                onInteractOutside={(e) => e.preventDefault()}
                                overlay={overlay}
                                position={position}
                                style={style}
                                width={width}
                              >
                                {!customHeader && (
                                  <Sheet.Header side={position}>
                                    <Sheet.HeaderTitle>{title}</Sheet.HeaderTitle>
                                  </Sheet.Header>
                                )}
                                <ContentComponent
                                  close={close}
                                  data={cloneData}
                                  id={`${contentRender.id}:${index}`}
                                />
                              </Sheet.Panel>
                            </Sheet.Root>
                          );
                        }

                        if (kind === 'confirm') {
                          return (
                            <Dialog.Root
                              key={contentRender.id}
                              onOpenChange={(v) => !v && close()}
                              open={contentRender.status}
                            >
                              <ContentComponent close={close} data={cloneData} id={contentRender.id} />
                            </Dialog.Root>
                          );
                        }

                        return (
                          <Dialog.Root
                            key={contentRender.id}
                            modal={overlay}
                            onOpenChange={(v) => !v && close()}
                            open={contentRender.status}
                          >
                            <ContentComponent close={close} data={cloneData} id={contentRender.id} />
                          </Dialog.Root>
                        );*/
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

export function OverlayContentComponent({ data, close }: OverlayContentProps<string>) {
    return (<div>Get Data: {data}</div>)
}
/* or */
import type { OverlayContentComponent } from 'overlay-manager-rc';

export const OverlayContentComponent2:OverlayContentComponent<string> = ({ data, close })  => {
  return (<div>Get Data: {data}</div>)
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
              <Button
                      onClick={() => {
                        handleOpenAlert();
                      }}
              >
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

`OverlayOpenOption` option

| Prop           | Type                       | Default | Required |
| -------------- | -------------------------- | ------- |----------|
| title          | ReactNode                  | -       |          |
| content        | OverlayContentComponent<T, R> | -       | True     |
| data           | T                          | -       |          |
| close          | OverlayCloseType<R>        | -       |          |
| width          | CSSProperties['width']     | -       |          |
| height         | CSSProperties['height']    | -       |          |
| style          | CSSProperties              | -       |          |
| className      | string                     | -       |          |
| position       | OverlayPositionType        | -       |          |
| overlayHidden  | boolean                    | false   |          |
| kind           | 'overlay' \| 'sheet' \| 'modal' \| 'confirm' | -       |          |


