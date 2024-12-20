# Overlay-manager-rc

[English](./README.md) | 한국어

[angular cdk overlay](https://material.angular.io/cdk/overlay/overview)에서 영감을 받았습니다.

> React 오버레이 컴포넌트 관리자

## 특징

- (alert-dialog, dialog, sheet 등) 열기, 닫기 상태 **더 이상 관리할 필요 없음**.
- **오버레이 컴포넌트 선언에 대해 걱정할 필요가 없습니다**. 여러 개의 오버레이가 있어도 괜찮습니다.
- 오버레이 컴포넌트 props로 데이터 전달.
- 오버레이 컴포넌트가 닫힐 때 감지; 닫힐 때 결과 데이터를 받습니다.
- **beforeClose 로직으로 닫기 방지.** **await를 통한 비동기 결과 처리.**
- **자동 ID 관리로 단순화된 API.**
- **오버레이 컴포넌트 열기 또는 닫을 때 불필요한 렌더링 없음.**
- **React 19 지원**

## 설치

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

## 설정

예시) nextjs(app router) + shadcn-ui(radix-ui)

이미 설치되어 있어야 함

- alert-dialog

### Step1

`overlay-manager-provider.tsx` 파일 생성;

```typescript jsx
'use client';

import type { ReactNode } from 'react';
import { OverlayContainer } from "overlay-manager-rc";

export function OverlayContainerNext({ children }: { children?: ReactNode }) {
  return <OverlayContainer/>;
}
```

### Step2

`layout.tsx` 컴포넌트에 provider 설정

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

## 사용법

### 오버레이 컴포넌트 생성

```typescript jsx
import type {OverlayContentProps} from 'overlay-manager-rc';
import {useBeforeClose} from 'overlay-manager-rc'; // useBeforeClose 임포트

export function TestContent({
  open,
  data,
  close,
  id // id prop 추가
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

### 오버레이 열기

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
    console.log('Result from openOverlay:', result); // onClose result와 동일한 값
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

### 수동 ID 관리

수동 ID를 지정하고 동일한 ID를 가진 오버레이가 이미 열려있는 경우, 새 오버레이를 열기 전에 기존 오버레이가 자동으로 닫힙니다.

```typescript jsx
'use client';

import { useOverlayManager } from 'overlay-manager-rc';

export function AlertSection() {
  const { openOverlay } = useOverlayManager();
  
  const handleOpenAlert = async () => {
    // ID가 'custom-alert'인 기존 오버레이를 닫고 
    // 새로운 오버레이를 엽니다
    await openOverlay({ 
      id: 'custom-alert',
      content: TestContent,
      data: 'old alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // 'custom-alert'가 이미 열려있다면 먼저 닫힙니다
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

**반환값**

| 이름 | 설명 | 매개변수 |
| --- | --- | --- |
| openOverlay | 오버레이 컴포넌트를 엽니다. Promise를 반환합니다. | OverlayOptions |
| closeAllOverlays | 모든 오버레이 컴포넌트를 닫습니다. | - |
| closeOverlayById | ID로 오버레이 컴포넌트를 닫습니다. | id: string |

#### OverlayOptions<TData, TResult>

| Prop | 타입 | 기본값 | 필수 여부 |
| --- | --- | --- | --- |
| id | string | - | 아니오 |
| content | OverlayContent<TData, TResult> | - | 예 |
| data | TData | - | 아니오 |
| onClose | (result?: TResult) => void \| Promise<void> | - | 아니오 |
| onOpen | (id: string) => void \| Promise<void> | - | 아니오 |
| beforeClose | () => boolean \| Promise<boolean> | - | 아니오 |

#### OverlayContentProps<TData, TResult>

| Prop | 타입 | 기본값 | 필수 여부 |
| --- | --- | --- | --- |
| data | TData | - | 예 |
| close | (result?: TResult) => void | - | 예 |
| open | boolean | - | 예 |
| id | string | - | 예 |

#### useBeforeClose

매니저가 동일한 id를 가진 오버레이를 실행하려고 할 때
오버레이를 닫기 전에 실행되는 함수

```typescript jsx
import { useBeforeClose } from 'overlay-manager-rc/useBeforeClose';

// ... 오버레이 컴포넌트 내부에서
useBeforeClose(async () => {
  // 닫기를 방지할지 결정하는 로직.
  // 예를 들어, 폼이 더티 상태인지 확인.
  const canClose = window.confirm('정말로 닫으시겠습니까?');
  return canClose; // true를 반환하면 닫기 허용, false를 반환하면 방지
}, id); // 오버레이의 ID 전달