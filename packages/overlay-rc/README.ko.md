# Overlay-manager-rc

[English](./README.md) | 한국어

[angular cdk overlay](https://material.angular.io/cdk/overlay/overview)에서 영감을 받았습니다.

> React 오버레이 컴포넌트 매니저

## 특징

- (alert-dialog, dialog, sheet...) 열기, 닫기 상태 **관리가 더 이상 필요 없습니다**.
- **오버레이 컴포넌트 선언에 대해 걱정할 필요가 없습니다**. 여러 개의 오버레이가 있어도 괜찮습니다.
- 오버레이 컴포넌트 props로 데이터 전달.
- 오버레이 컴포넌트가 닫힐 때 감지; 닫힐 때 결과 데이터를 받을 수 있습니다.
- **beforeClose 로직으로 닫기 방지.** **await를 통한 비동기 결과 처리.**
- **자동 ID 관리로 단순화된 API.**
- **오버레이 컴포넌트 열기 또는 닫을 때 불필요한 렌더링이 없습니다.**
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

사전 설치된 것 

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
  // useBeforeClose 훅 사용 예시
  useBeforeClose(async () => {
    const confirmed = window.confirm('정말 닫으시겠습니까?');
    return confirmed; // true를 반환하면 닫기, false를 반환하면 닫기 방지
  }, id); // useBeforeClose에 id 전달

  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && close();
      }}
      open={open}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>알림 제목</AlertDialogTitle>
          <AlertDialogDescription>받은 데이터: {data}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction>계속</AlertDialogAction>
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
      data: '안녕하세요!!!!',
      onClose: (result) => {
        console.log('다이얼로그가 닫혔습니다. 결과:', result);
      },
      onOpen: (id) => {
        console.log('오버레이가 열렸습니다. ID:', id);
      },
    });
    console.log('openOverlay 결과:', result); // onClose 결과와 동일한 값
  };

  return (
    <section className="md:h-screen">
      <div className="flex flex-col gap-10">
        <Button onClick={handleOpenAlert}>
          알림 보기
        </Button>
      </div>
    </section>
  );
}
```

#### 닫을 때 결과 데이터 받기

```typescript jsx
export function TestContent({data, close}: OverlayContentProps<string, boolean>) {
  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>알림 제목</AlertDialogTitle>
          <AlertDialogDescription>받은 데이터: {data}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => close(false)}>취소</AlertDialogCancel>
          <AlertDialogAction onClick={() => close(true)}>계속</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* 열기 핸들러 */
const handleOpenAlert = () => {
  openOverlay({
    content: TestContent,
    data: '안녕하세요!!!!',
    onClose: (result) => {
      console.log('다이얼로그가 닫혔습니다. 결과:', result);
    }
  });
};
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

```typescript jsx
import { useBeforeClose } from 'overlay-manager-rc/useBeforeClose';

// ... 오버레이 컴포넌트 내부
useBeforeClose(async () => {
  // 닫기를 방지할지 결정하는 로직.
  // 예를 들어, 폼이 수정되었는지 확인.
  const canClose = window.confirm('정말 닫으시겠습니까?');
  return canClose; // true를 반환하면 닫기 허용, false를 반환하면 방지
}, id); // 오버레이의 ID 전달