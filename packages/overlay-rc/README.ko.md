# Overlay-manager-rc

[English](./README.md) | 한국어

[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[angular cdk overlay](https://material.angular.io/cdk/overlay/overview)에서 영감을 받았습니다.

> Hook 기반 API를 제공하는 React 오버레이 컴포넌트 관리자

## 특징

- 🎯 **Hook 기반 API** - `useOverlay()` hook으로 오버레이 데이터 접근 (v1.0.0+)
- 🔄 **상태 관리 불필요** - 열기/닫기 상태 자동 관리
- 🆔 **SSR 안전한 ID** - 고유 ID 자동 생성
- 📦 **다중 오버레이** - 충돌 없이 여러 오버레이 지원
- 🎁 **타입 안전 데이터** - 타입이 지정된 데이터를 오버레이에 전달
- ✅ **닫기 방지** - 비동기 지원 `beforeClose` 로직
- 🚫 **렌더링 최적화** - 불필요한 재렌더링 방지
- ⚛️ **React 18+ & 19** - 최신 React 버전 완벽 지원

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

**v1.0.0+**는 `useOverlay()` hook 기반 API를 사용합니다:

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TestContent() {
  // Hook을 통해 오버레이 컨텍스트 접근
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
          <AlertDialogTitle>Alert 제목</AlertDialogTitle>
          <AlertDialogDescription>
            받은 데이터: {overlayData}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => closeOverlay('confirmed')}>
            계속
          </AlertDialogAction>
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
      data: 'first alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // 'custom-alert'가 이미 열려있다면 먼저 닫힙니다
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

오버레이 관리 함수들을 포함한 객체를 반환합니다.

| 이름 | 설명 | 매개변수 |
| --- | --- | --- |
| openOverlay | 오버레이 컴포넌트를 엽니다. 닫기 결과로 resolve되는 Promise를 반환합니다. | OverlayOptions |
| closeOverlay | ID로 오버레이 컴포넌트를 닫습니다. | id: string |
| closeAllOverlays | 모든 오버레이 컴포넌트를 닫습니다. | - |
| overlays | 모든 현재 오버레이 상태의 배열. | - |

#### OverlayOptions<TData, TResult>

| Prop | 타입 | 기본값 | 필수 |
| --- | --- | --- | --- |
| id | string | 자동 생성 | 아니오 |
| content | ComponentType (React 컴포넌트) | - | 예 |
| data | TData | - | 아니오 |
| onClose | (result?: TResult) => void \| Promise<void> | - | 아니오 |
| onOpen | (id: string) => void \| Promise<void> | - | 아니오 |
| beforeClose | () => boolean \| Promise<boolean> | - | 아니오 |

### useOverlay<TData>()

오버레이 컴포넌트 내부에서 오버레이 컨텍스트에 접근하는 Hook입니다. **OverlayContainer에 의해 렌더링된 오버레이 컴포넌트 내에서만 사용해야 합니다.**

**반환값:**

| 속성 | 타입 | 설명 |
| --- | --- | --- |
| overlayId | string | 오버레이의 고유 ID |
| isOpen | boolean | 오버레이가 현재 열려있는지 여부 |
| overlayData | TData | `openOverlay()`를 통해 오버레이에 전달된 데이터 |
| closeOverlay | (result?: TResult) => void | 선택적 결과와 함께 오버레이를 닫는 함수 |

### useBeforeClose

오버레이를 닫기 전에 로직을 실행하는 Hook입니다. 조건에 따라 닫기를 방지하는데 사용됩니다 (예: 저장되지 않은 변경사항).

**사용법:**

```typescript jsx
import { useOverlay, useBeforeClose } from 'overlay-manager-rc';

export function FormOverlay() {
  const { overlayId, overlayData, closeOverlay } = useOverlay();
  const [isDirty, setIsDirty] = useState(false);

  useBeforeClose(async () => {
    if (isDirty) {
      const canClose = window.confirm('저장되지 않은 변경사항이 있습니다. 정말 닫으시겠습니까?');
      return canClose; // true = 닫기 허용, false = 닫기 방지
    }
    return true;
  }, overlayId);

  // ... 나머지 컴포넌트
}
```
## 마이그레이션 가이드

v0.9.x에서 업그레이드하시나요? v1.0.0으로 마이그레이션하는 자세한 방법은 [**마이그레이션 가이드**](./docs/MIGRATION.ko.md)를 참조하세요.

## 라이선스

MIT
