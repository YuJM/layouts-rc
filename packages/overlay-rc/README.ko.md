# Overlay-manager-rc

[English](./README.md) | 한국어

[![React](https://img.shields.io/badge/React-18%2B%20%7C%2019%2B-61dafb?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 [라이브 데모](https://layouts-rc-web.vercel.app/overlay)

[angular cdk overlay](https://material.angular.io/cdk/overlay/overview)에서 영감을 받았습니다.

> 경량(2KB), zero-dependency React 오버레이 매니저, Hook 기반 API 제공

> **📢 v0.9.x에서 업그레이드하시나요?** [마이그레이션 가이드](./docs/MIGRATION.ko.md)를 참조하세요

## 목차

- [개요](#개요)
- [무엇이 다른가요?](#무엇이-다른가요)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [사용법](#사용법)
  - [오버레이 컴포넌트 생성](#오버레이-컴포넌트-생성)
  - [오버레이 열기](#오버레이-열기)
  - [수동 ID 관리](#수동-id-관리)
- [API 레퍼런스](#api-레퍼런스)
  - [useOverlayManager](#useoverlaymanager)
  - [useOverlay](#useoverlay)
  - [useBeforeClose](#usebeforeclose)
- [브라우저 지원](#브라우저-지원)
- [라이선스](#라이선스)

## 개요

React 애플리케이션에서 많은 dialog, alert, sheet 등 overlay component 코드들은 유지보수에 어려움을 야기할 수 있습니다:
- ❌ 부모 컴포넌트에서 수동으로 열기/닫기 상태 관리
- ❌ 여러 컴포넌트를 거쳐 Props 전달
- ❌ 복잡한 상태 관리 설정 필요 (Redux, Zustand 등)
- ❌ SSR hydration 시 ID 불일치 문제
- ❌ 정리되지 않은 오버레이로 인한 메모리 누수

**overlay-manager-rc가 모든 문제를 해결합니다:**

- 📦 **Zero Dependencies** - 외부 의존성 없음, React peer dependency만 존재
- 🪶 **경량** - 이미지 하나보다 작은 ~2KB (minified + gzipped)
- 🎯 **Hook 기반 API** - `useOverlay()` 훅으로 깔끔하고 직관적인 API
- 🔄 **상태 관리 불필요** - 열기/닫기 상태 자동 처리
- 🆔 **SSR 안전** - Next.js, Remix 등 SSR 프레임워크와 완벽 호환
- 🎁 **타입 안전** - 제네릭을 활용한 완벽한 TypeScript 지원
- 🔁 **Promise 기반** - 자연스러운 async/await API로 오버레이 결과 처리
- 🎭 **생명주기 콜백** - `onOpen`, `onClose`, `beforeClose`로 세밀한 제어
- 🔒 **스마트 ID 관리** - 동일 ID로 열 때 기존 오버레이 자동 종료
- ⚡ **자동 정리** - 애니메이션 종료 후 닫힌 오버레이 자동 제거
- ⚛️ **React 18+ & 19** - 최신 React 버전과 호환

### 이런 경우 완벽합니다

- **Radix UI / shadcn/ui 사용자** - headless UI 라이브러리와 완벽 호환
- **Next.js 프로젝트** - SSR 안전, hydration 문제 없음
- **TypeScript 프로젝트** - 오버레이 데이터에 대한 완전한 타입 추론
- **성능 중시 앱** - 최소한의 번들 영향 (~2KB)
- **복잡한 오버레이 플로우** - 순차 다이얼로그, 확인 체인, 다단계 폼

## 무엇이 다른가요?

**문제점:** 오버레이를 관리하려면 보통 부모 컴포넌트에서 상태를 관리하고, props를 전달하고, 많은 보일러플레이트 코드가 필요합니다.

**해결책:** 함수 기반 오버레이 관리 - 상태도 props도 필요 없이, 단순한 함수 호출만으로.

<details>
<summary><strong>📊 Before/After 비교 보기</strong></summary>

### 기존 방식 (overlay-manager-rc 없이)

```tsx
// ❌ 부모 컴포넌트가 상태 관리
function ParentComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  const handleOpen = () => {
    setDialogData({ userId: 123 });
    setIsOpen(true);
  };

  const handleClose = (result) => {
    setIsOpen(false);
    // 결과 처리...
  };

  return (
    <>
      <Button onClick={handleOpen}>열기</Button>
      <MyDialog
        isOpen={isOpen}
        onClose={handleClose}
        data={dialogData}
      />
    </>
  );
}

// Dialog 컴포넌트는 props drilling 필요
function MyDialog({ isOpen, onClose, data }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 여기서 data 사용 */}
    </Dialog>
  );
}
```

### overlay-manager-rc 사용 시

```tsx
// ✅ 부모 컴포넌트가 깔끔하게 유지됨
function ParentComponent() {
  const { openOverlay } = useOverlayManager();

  const handleOpen = async () => {
    const result = await openOverlay({
      content: MyDialog,
      data: { userId: 123 }
    });
    // 결과를 바로 처리!
  };

  return <Button onClick={handleOpen}>열기</Button>;
}

// Dialog 컴포넌트가 hook으로 데이터 접근
function MyDialog() {
  const { isOpen, overlayData, closeOverlay } = useOverlay();

  return (
    <Dialog open={isOpen} onOpenChange={() => closeOverlay()}>
      {/* overlayData를 직접 사용 */}
    </Dialog>
  );
}
```

### 주요 이점

**1. 부모 컴포넌트의 상태 관리 불필요**
```tsx
// ❌ 이전: 수동 상태 관리
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [isAlertOpen, setIsAlertOpen] = useState(false);
const [isSheetOpen, setIsSheetOpen] = useState(false);

// ✅ 이후: 필요할 때 바로 열기
openOverlay({ content: Dialog });
openOverlay({ content: Alert });
openOverlay({ content: Sheet });
```

**2. Promise 기반 결과 처리**
```tsx
// ✅ 결과를 바로 받기
const result = await openOverlay({
  content: ConfirmDialog,
  data: { message: '삭제하시겠습니까?' }
});

if (result === 'confirmed') {
  await deleteItem();
}
```

**3. 순차적 플로우가 쉬워짐**
```tsx
// ✅ 오버레이를 자연스럽게 체이닝
async function checkoutFlow() {
  const address = await openOverlay({ content: AddressForm });
  const payment = await openOverlay({ content: PaymentForm, data: address });
  const confirmed = await openOverlay({ content: ConfirmOrder, data: payment });

  if (confirmed) {
    await processOrder();
  }
}
```

**4. 타입 안전한 데이터 전달**
```tsx
// ✅ 완전한 타입 추론
interface FormData { name: string; email: string; }

const result = await openOverlay<FormData, boolean>({
  content: MyForm,
  data: { name: '', email: '' }
});
// result는 boolean | undefined로 타입 지정됨
```

**5. Props Drilling 제거**
```tsx
// ❌ 이전: 여러 레벨을 거쳐 props 전달
<Dialog>
  <DialogContent userId={userId}>
    <UserProfile userId={userId}>
      <UserActions userId={userId} />
    </UserProfile>
  </DialogContent>
</Dialog>

// ✅ 이후: 어디서든 데이터 접근
function UserActions() {
  const { overlayData } = useOverlay<{ userId: number }>();
  // overlayData.userId를 직접 사용
}
```

**6. 자동 정리**
```tsx
// ❌ 이전: 수동 정리 필요
useEffect(() => {
  return () => {
    // 정리를 잊지 말아야 함!
  };
}, []);

// ✅ 이후: 자동 정리
// 오버레이를 닫기만 하면 - 정리가 자동으로 발생
closeOverlay();
```

**7. 함수 기반 관리 = 재사용성 향상**
```tsx
// ❌ 이전: JSX 선언 - 재사용 어려움
function UserList() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>삭제</Button>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        message="사용자를 삭제하시겠습니까?"
      />
    </>
  );
}
// 모든 컴포넌트에 이 다이얼로그를 복사 붙여넣기 해야 함! 😱

// ✅ 이후: 재사용 가능한 함수 - 어디서든 호출
// utils/overlays.ts
export async function confirmDelete(itemName: string) {
  return await openOverlay({
    content: ConfirmDialog,
    data: {
      title: '삭제 확인',
      message: `${itemName}을(를) 삭제하시겠습니까?`
    }
  });
}

// 어떤 컴포넌트에서든 사용 가능!
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

**8. 쉬운 리팩토링**
```tsx
// ✅ 비즈니스 로직과 UI 분리
// services/user-service.ts
export async function deleteUserWithConfirm(userId: number) {
  const user = await fetchUser(userId);

  // 1단계: 확인
  const confirmed = await openOverlay({
    content: ConfirmDialog,
    data: { message: `${user.name}을(를) 삭제하시겠습니까?` }
  });

  if (!confirmed) return false;

  // 2단계: 로딩 표시
  const loadingOverlay = openOverlay({
    content: LoadingDialog,
    data: { message: '삭제 중...' }
  });

  // 3단계: 삭제
  await api.delete(`/users/${userId}`);
  closeOverlay(loadingOverlay);

  // 4단계: 성공 메시지
  await openOverlay({
    content: SuccessDialog,
    data: { message: '사용자가 삭제되었습니다!' }
  });

  return true;
}

// 컴포넌트는 깔끔하게 유지!
function UserActions({ userId }) {
  return (
    <Button onClick={() => deleteUserWithConfirm(userId)}>
      삭제
    </Button>
  );
}
```

</details>

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

## 빠른 시작

### Step 1: OverlayContainer 추가

Next.js (App Router) + shadcn/ui (Radix UI) 예시

`overlay-container-provider.tsx` 파일 생성:

```typescript jsx
'use client';

import type { ReactNode } from 'react';
import { OverlayContainer } from "overlay-manager-rc";

export function OverlayContainerNext({ children }: { children?: ReactNode }) {
  return <OverlayContainer/>;
}
```

### Step 2: Layout에 추가

`layout.tsx`에 container 추가:

```typescript jsx
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
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

`useOverlay()` hook으로 오버레이 컨텍스트에 접근:

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function DemoAlertDialog() {
  // Hook을 통해 오버레이 컨텍스트 접근
  const { overlayId, isOpen, overlayData, closeOverlay, dismiss } = useOverlay<string>();

  return (
    <AlertDialog
      onOpenChange={(v) => {
        !v && dismiss(); // 또는 closeOverlay() - 둘 다 동일하게 작동
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
          <AlertDialogCancel onClick={dismiss}>취소</AlertDialogCancel>
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
      content: DemoAlertDialog,
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
      content: DemoAlertDialog,
      data: 'first alert!',
    });
  };

  const handleOpenAnotherAlert = async () => {
    // 'custom-alert'가 이미 열려있다면 먼저 닫힙니다
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

## API 레퍼런스

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
| dismiss | () => void | 결과값 없이 오버레이를 닫는(취소) 함수. `closeOverlay()`와 동일 |

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

## 브라우저 지원

- ES2020+ 지원 최신 브라우저
- Server-side rendering 프레임워크 (Next.js, Remix, Gatsby 등)
- React 18.0.0+ 또는 React 19.0.0+

## 라이선스

MIT
