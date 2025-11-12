# 마이그레이션 가이드

[English](MIGRATION.md)

## v0.9.x에서 v1.0.0으로 마이그레이션

v1.0.0은 props 기반에서 hook 기반 API로의 **중대한 변경**을 도입합니다.

### 변경 사항 개요

v1.0.0은 props 기반 API를 보다 깔끔하고 React 관용적인 hook 기반 접근 방식인 `useOverlay()`로 대체합니다.

### 주요 이점

- 🎯 **깔끔한 API** - props를 구조 분해할 필요 없이 hook 사용
- 🔄 **향상된 타입 추론** - TypeScript 타입 작업이 더 쉬워짐
- 📦 **작은 번들 크기** - props 전달 오버헤드 감소
- ⚛️ **React 패턴** - hook을 사용한 최신 React 관례 준수
- 🔧 **표준 컴포넌트** - 특정 타입 컴포넌트가 아닌 모든 React 컴포넌트 사용 가능

### 이전 (v0.9.x - Props 기반)

```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function TestContent({ open, data, close, id }: OverlayContentProps<string>) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && close()}>
      <AlertDialogContent>
        <AlertDialogDescription>{data}</AlertDialogDescription>
        <AlertDialogAction onClick={() => close('confirmed')}>확인</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### 이후 (v1.0.0 - Hook 기반)

```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TestContent() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<string>();

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !v && closeOverlay()}>
      <AlertDialogContent>
        <AlertDialogDescription>{overlayData}</AlertDialogDescription>
        <AlertDialogAction onClick={() => closeOverlay('confirmed')}>확인</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### API 매핑 테이블

| v0.9.x (Props) | v1.0.0 (Hook) | 비고 |
| --- | --- | --- |
| `open` prop | `useOverlay()`의 `isOpen` | Boolean 네이밍 컨벤션 |
| `data` prop | `useOverlay()`의 `overlayData` | 더 설명적인 이름 |
| `close` prop | `useOverlay()`의 `closeOverlay` | 더 설명적인 이름 |
| `id` prop | `useOverlay()`의 `overlayId` | 더 설명적인 이름 |
| `OverlayContentProps<TData, TResult>` | `useOverlay<TData>()` | Props 대신 Hook 기반 |
| nanoid로 수동 ID | React `useId`로 자동 생성 | SSR 안전한 내장 ID |

### 단계별 마이그레이션

#### Step 1: 패키지 버전 업데이트

```bash
npm install overlay-manager-rc@latest
# 또는
yarn add overlay-manager-rc@latest
# 또는
pnpm add overlay-manager-rc@latest
```

#### Step 2: Props를 Hook으로 교체

**이전:**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function MyOverlay({ open, data, close, id }: OverlayContentProps<MyData>) {
  // ...
}
```

**이후:**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function MyOverlay() {
  const { isOpen, overlayData, closeOverlay, overlayId } = useOverlay<MyData>();
  // ...
}
```

#### Step 3: 속성 참조 업데이트

모든 prop 참조를 구조 분해된 hook 값으로 교체:

- `open` → `isOpen`
- `data` → `overlayData`
- `close()` → `closeOverlay()`
- `id` → `overlayId`

#### Step 4: 타입 Import 제거

더 이상 필요하지 않은 `OverlayContentProps` import 제거:

```diff
- import type { OverlayContentProps } from 'overlay-manager-rc';
+ import { useOverlay } from 'overlay-manager-rc';
```

### 일반적인 마이그레이션 시나리오

#### 시나리오 1: 간단한 Alert Dialog

**이전 (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';
import { AlertDialog, AlertDialogContent, AlertDialogDescription } from '@/components/ui/alert-dialog';

export function SimpleAlert({ open, data, close }: OverlayContentProps<string>) {
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && close()}>
      <AlertDialogContent>
        <AlertDialogDescription>{data}</AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

**이후 (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';
import { AlertDialog, AlertDialogContent, AlertDialogDescription } from '@/components/ui/alert-dialog';

export function SimpleAlert() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<string>();

  return (
    <AlertDialog open={isOpen} onOpenChange={(v) => !v && closeOverlay()}>
      <AlertDialogContent>
        <AlertDialogDescription>{overlayData}</AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

#### 시나리오 2: 닫기 결과가 있는 폼

**이전 (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

interface FormData { name: string; email: string; }
type FormResult = { submitted: boolean; data?: FormData };

export function FormOverlay({ open, data, close }: OverlayContentProps<FormData, FormResult>) {
  const handleSubmit = (formData: FormData) => {
    close({ submitted: true, data: formData });
  };

  const handleCancel = () => {
    close({ submitted: false });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      {/* form content */}
    </Dialog>
  );
}
```

**이후 (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

interface FormData { name: string; email: string; }
type FormResult = { submitted: boolean; data?: FormData };

export function FormOverlay() {
  const { isOpen, overlayData, closeOverlay } = useOverlay<FormData>();

  const handleSubmit = (formData: FormData) => {
    closeOverlay({ submitted: true, data: formData });
  };

  const handleCancel = () => {
    closeOverlay({ submitted: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && handleCancel()}>
      {/* form content */}
    </Dialog>
  );
}
```

#### 시나리오 3: Overlay ID 사용

**이전 (v0.9.x):**
```typescript jsx
import type { OverlayContentProps } from 'overlay-manager-rc';

export function TrackedOverlay({ open, data, close, id }: OverlayContentProps<string>) {
  useEffect(() => {
    console.log('Overlay opened with ID:', id);
  }, [id]);

  return (
    <Dialog open={open}>
      <p>Overlay ID: {id}</p>
    </Dialog>
  );
}
```

**이후 (v1.0.0):**
```typescript jsx
import { useOverlay } from 'overlay-manager-rc';

export function TrackedOverlay() {
  const { isOpen, overlayData, closeOverlay, overlayId } = useOverlay<string>();

  useEffect(() => {
    console.log('Overlay opened with ID:', overlayId);
  }, [overlayId]);

  return (
    <Dialog open={isOpen}>
      <p>Overlay ID: {overlayId}</p>
    </Dialog>
  );
}
```

### 중대한 변경 사항 요약

1. **Props 제거**: `OverlayContentProps`를 더 이상 사용할 수 없음
2. **Hook 필수**: 오버레이 컴포넌트 내에서 `useOverlay()` hook 사용 필수
3. **속성 이름 변경**: `open` → `isOpen`, `data` → `overlayData`, `close` → `closeOverlay`, `id` → `overlayId`
4. **컴포넌트 타입**: content가 이제 타입이 지정된 props 컴포넌트 대신 표준 `ComponentType`을 받음

### 변경되지 않은 사항

다음 API는 **변경 없이** 유지됩니다:

- `useOverlayManager()` hook
- `openOverlay()` 함수
- `closeOverlay()` 함수
- `closeAllOverlays()` 함수
- `OverlayContainer` 컴포넌트
- `useBeforeClose()` hook
- `OverlayOptions` 인터페이스
- 모든 콜백 동작 (`onOpen`, `onClose`, `beforeClose`)

### 문제 해결

#### 오류: "useOverlay must be used within an OverlayContainer"

**원인**: `OverlayContainer`에 의해 렌더링되지 않은 오버레이 컴포넌트 외부에서 `useOverlay()` 호출.

**해결**: `openOverlay({ content: YourComponent })`에 전달된 컴포넌트 내에서만 `useOverlay()`를 사용하세요.

#### TypeScript 오류: "Property 'open' does not exist"

**원인**: 여전히 이전 props 기반 API 사용 중.

**해결**: props 구조 분해를 `useOverlay()` hook으로 교체하세요.

### 도움이 필요하신가요?

- [GitHub Issues](https://github.com/yujongmyeong/layouts-rc/issues)
- [문서](../README.ko.md)

## 라이선스

MIT
