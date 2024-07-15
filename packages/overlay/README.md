# Overlay-manger-rc

> React overlay component manager
## Feature
* (alert-dialog, dialog, sheet...) open, close state **no more management**.
* It's okay to have multiple overlay.
* Delivering data to Overlay component Props.
* Detect when an overlay component is closed.
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
* alert-dialog
* dialog
* sheet

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
## Usage
