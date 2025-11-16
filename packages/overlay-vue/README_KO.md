# overlay-manager-vue

[![npm version](https://img.shields.io/npm/v/overlay-manager-vue?style=flat-square)](https://www.npmjs.com/package/overlay-manager-vue)
[![npm downloads](https://img.shields.io/npm/dm/overlay-manager-vue?style=flat-square)](https://www.npmjs.com/package/overlay-manager-vue)
[![license](https://img.shields.io/npm/l/overlay-manager-vue?style=flat-square)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/overlay-manager-vue?style=flat-square)](https://bundlephobia.com/package/overlay-manager-vue)

overlay-rc에서 영감을 받은 Hook 기반 API를 제공하는 Vue 3 오버레이 관리 라이브러리입니다.

**버전 1.0.0** - 완전한 반응성과 다중 오버레이 스택 지원을 갖춘 프로덕션 준비 완료 버전.

[English Version](README.md) | [마이그레이션 가이드](docs/MIGRATION_KO.md) | [API 레퍼런스](docs/API.md)

## 주요 기능

- ✅ **Hook 기반 API** - `useOverlay()`, `useCurrentOverlay()`, `useOverlayController()`
- ✅ **완전한 반응성** - 모든 컨텍스트 속성이 Vue의 computed로 반응형
- ✅ **타입 안전** - 제네릭을 사용한 완전한 TypeScript 지원
- ✅ **Promise 기반** - 결과 처리를 포함한 비동기 오버레이 제어
- ✅ **다중 스택** - 여러 오버레이를 동시에 열 수 있음
- ✅ **생명주기 콜백** - `onMounted`, `onUnmounted` 지원
- ✅ **프레임워크 독립적** - Radix Vue, reka-ui, Headless UI 또는 커스텀 컴포넌트와 함께 작동
- ✅ **포괄적인 테스트** - Vitest로 97%+ 테스트 커버리지

## 번들 크기

프로덕션에 최적화된 경량 라이브러리:

| 포맷 | 원본 크기 | Gzipped (실제 다운로드) |
|------|----------|------------------------|
| ESM  | 8.4 KB   | **3.17 KB** ⚡         |
| CJS  | 3.8 KB   | **1.67 KB** ⚡         |

- **최신 앱 (ESM)**: 단 3.17 KB gzipped
- **레거시 지원 (CJS)**: 단 1.67 KB gzipped
- **타입 정의**: 25.3 KB (개발 전용)

## 설치

```bash
npm install overlay-manager-vue
# 또는
yarn add overlay-manager-vue
# 또는
pnpm add overlay-manager-vue
```

### 필수 Peer Dependencies

오버레이 스택 지원을 위해서는 **Dialog** 컴포넌트(AlertDialog 아님)를 사용해야 합니다:

```bash
# Dialog 컴포넌트를 위한 reka-ui 설치
pnpm add reka-ui @radix-icons/vue

# 또는 shadcn-vue 사용 (권장)
pnpm dlx shadcn-vue@latest add dialog
```

**중요**: Radix Vue의 `AlertDialog`는 **스택을 지원하지 않습니다** - 한 번에 하나만 열 수 있습니다. 다중 오버레이 지원을 위해서는 reka-ui의 `Dialog`를 사용하세요.

## 빠른 시작

### 1. OverlayHost 설정

루트 컴포넌트(예: `App.vue`)에 `<OverlayHost />`를 추가하세요:

```vue
<script setup lang="ts">
import { OverlayHost } from 'overlay-manager-vue'
</script>

<template>
  <div id="app">
    <YourContent />

    <!-- 루트에 OverlayHost를 한 번 추가 -->
    <OverlayHost />
  </div>
</template>
```

### 2. 오버레이 컴포넌트 생성

**Dialog**를 사용하는 컴포넌트 생성(스택 지원):

```vue
<!-- MyDialog.vue -->
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
        <DialogDescription>
          {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="handleCancel">취소</Button>
        <Button @click="handleConfirm">확인</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DialogProps {
  title: string
  message: string
}

interface DialogResult {
  confirmed: boolean
}

// Vue 경고를 피하기 위해 props 정의
defineProps<DialogProps>()

// TypeScript 제네릭을 사용한 완전한 반응형 컨텍스트
const overlay = useCurrentOverlay<DialogProps, DialogResult>()

const handleConfirm = () => {
  overlay.close({ confirmed: true })
}

const handleCancel = () => {
  overlay.dismiss('user_cancelled')
}
</script>
```

**핵심 포인트**:
- ✅ reka-ui의 `Dialog` 사용 (다중 인스턴스 지원)
- ✅ `:open="overlay.isOpen"` 바인딩 (완전한 반응성)
- ✅ 타입 안전을 위해 TypeScript 제네릭 사용
- ✅ `defineProps<T>()`로 props 정의
- ❌ `AlertDialog` 사용 금지 (하나의 인스턴스만 허용)
- ❌ `<Teleport>` 사용 금지 (OverlayHost가 처리)

### 3. 오버레이 열기

`useOverlay()`를 사용하여 오버레이 컴포넌트를 여세요:

```vue
<script setup lang="ts">
import { useOverlay } from 'overlay-manager-vue'
import MyDialog from './components/MyDialog.vue'

const { openOverlay } = useOverlay()

async function showDialog() {
  try {
    const result = await openOverlay(MyDialog, {
      data: {
        title: '동작 확인',
        message: '계속하시겠습니까?',
      },
    })

    console.log('사용자가 확인함:', result.data.confirmed)
  } catch (error) {
    console.log('사용자가 취소함:', error.reason)
  }
}
</script>

<template>
  <button @click="showDialog">다이얼로그 열기</button>
</template>
```

## API 레퍼런스

### `useOverlay()`

애플리케이션 어디서나 오버레이를 여는 Hook입니다.

```typescript
const { openOverlay } = useOverlay()

const result = await openOverlay(Component, options)
```

#### Options

```typescript
interface OverlayOptions<TData> {
  // 오버레이 컴포넌트에 전달할 데이터
  data?: Record<string, unknown>

  // 닫기 전에 호출되는 가드 함수
  beforeClose?: () => boolean | Promise<boolean>

  // 컴포넌트가 마운트된 후 콜백
  onMounted?: () => void

  // 컴포넌트가 언마운트된 후 콜백
  onUnmounted?: () => void
}
```

#### 반환 값

`close()`를 통해 오버레이가 닫힐 때 resolve되는 `Promise`를 반환:

```typescript
interface OverlayResult<T> {
  type: 'close' | 'dismiss'
  data?: T
}
```

또는 `dismiss()`를 통해 닫힐 때 reject:

```typescript
interface OverlayError {
  type: 'dismiss' | 'error'
  reason?: unknown
}
```

### `useCurrentOverlay()`

오버레이 컴포넌트 **내부**에서 오버레이 컨텍스트에 접근하는 Hook입니다.

```typescript
const overlay = useCurrentOverlay<TData, TResult>()

overlay.id        // 고유한 오버레이 ID
overlay.isOpen    // 반응형 열림 상태 (computed)
overlay.data      // 오버레이에 전달된 데이터 (반응형)
overlay.close(result)   // 결과와 함께 닫기 (promise resolve)
overlay.dismiss(reason) // 취소 (promise reject)
```

**⚠️ 중요**:
- `OverlayHost`에서 렌더링된 컴포넌트 내부에서만 사용 가능
- 모든 속성이 **완전히 반응형** (Vue의 `computed` 사용)
- 타입 안전을 위해 TypeScript 제네릭 사용: `useCurrentOverlay<TData, TResult>()`

### `useOverlayController()`

컨트롤러 객체를 사용한 명령형 오버레이 제어를 위한 Hook입니다.

```typescript
const controller = useOverlayController(Component, options)

controller.id      // 오버레이 ID
controller.result  // Promise<OverlayResult>
controller.close(result)   // 오버레이 닫기
controller.dismiss(reason) // 오버레이 취소
```

예제:

```typescript
const controller = useOverlayController(MyDialog, {
  data: { title: '안녕하세요' }
})

// 3초 후 닫기
setTimeout(() => {
  controller.close({ confirmed: true })
}, 3000)

const result = await controller.result
```

### `<OverlayHost />`

모든 활성 오버레이를 렌더링하는 컴포넌트입니다. 앱 루트에 한 번 배치해야 합니다.

```vue
<template>
  <div id="app">
    <YourContent />
    <OverlayHost />
  </div>
</template>
```

## 고급 예제

### 다중 스택 오버레이

여러 오버레이를 동시에 열 수 있습니다 (Dialog 필요, AlertDialog 안됨):

```typescript
// 첫 번째 오버레이 열기
const promise1 = openOverlay(Dialog1, { data: { id: 1 } })

// 두 번째 오버레이 열기 (위에 스택)
const promise2 = openOverlay(Dialog2, { data: { id: 2 } })

// 세 번째 오버레이 열기 (위에 스택)
const promise3 = openOverlay(Dialog3, { data: { id: 3 } })

// 세 개의 오버레이가 모두 보이고 스택됨
await Promise.all([promise1, promise2, promise3])
```

### 순차적 오버레이 체인

각 오버레이가 다음 오버레이를 열 수 있는 순차적 방식:

```vue
<script setup lang="ts">
import { useCurrentOverlay, useOverlay } from 'overlay-manager-vue'

interface SequentialData {
  step: number
  totalSteps: number
  message: string
}

defineProps<SequentialData>()

const overlay = useCurrentOverlay<SequentialData, string>()
const { openOverlay } = useOverlay()

const handleNext = async () => {
  if (overlay.data.step < overlay.data.totalSteps) {
    // 다음 다이얼로그 열기 (현재 다이얼로그는 열린 상태 유지 - 스택)
    await openOverlay(SequentialDialog, {
      data: {
        step: overlay.data.step + 1,
        totalSteps: overlay.data.totalSteps,
        message: `단계 ${overlay.data.step + 1}`,
      },
    })
  }

  overlay.close('finished')
}
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          다이얼로그 {{ overlay.data.step }} / {{ overlay.data.totalSteps }}
        </DialogTitle>
        <DialogDescription>
          {{ overlay.data.message }}
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button @click="handleNext">
          {{ overlay.data.step === overlay.data.totalSteps ? '완료' : '다음' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
```

### 반응형 컨텍스트 예제

모든 오버레이 컨텍스트 속성이 완전히 반응형입니다:

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useCurrentOverlay } from 'overlay-manager-vue'

interface CounterData {
  count: number
}

defineProps<CounterData>()

const overlay = useCurrentOverlay<CounterData, void>()

// 반응형 속성 감시
watch(() => overlay.isOpen, (isOpen) => {
  console.log('오버레이 열림 상태 변경:', isOpen)
})

watch(() => overlay.data.count, (count) => {
  console.log('카운트 변경:', count)
})
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- overlay.data가 변경되면 자동으로 다시 렌더링 -->
      <DialogTitle>카운트: {{ overlay.data.count }}</DialogTitle>
    </DialogContent>
  </Dialog>
</template>
```

### BeforeClose 가드

가드 함수를 사용하여 오버레이가 닫히는 것을 방지:

```typescript
const result = await openOverlay(MyDialog, {
  beforeClose: async () => {
    // 닫기 전에 사용자에게 확인
    return window.confirm('정말 닫으시겠습니까?')
  },
})
```

`beforeClose`가 `false`를 반환하면 오버레이가 열린 상태로 유지됩니다. `dismiss()`를 사용하여 강제로 닫기:

```typescript
// 오버레이 컴포넌트 내부
overlay.dismiss('force_close') // beforeClose 가드를 우회
```

### 생명주기 콜백

오버레이가 마운트/언마운트될 때 코드 실행:

```typescript
const result = await openOverlay(MyDialog, {
  onMounted: () => {
    console.log('오버레이 마운트됨')
  },
  onUnmounted: () => {
    console.log('오버레이 언마운트됨 - 여기서 정리 작업')
  },
})
```

### 타입 안전 Props와 결과

완전한 타입 안전을 위해 제네릭 사용:

```typescript
interface FormData {
  name: string
  email: string
}

interface FormResult {
  submitted: boolean
  data?: FormData
}

// 오버레이 컴포넌트에서
const overlay = useCurrentOverlay<FormData, FormResult>()

// TypeScript가 overlay.data에 name과 email이 있다는 것을 알고 있음
const name = overlay.data.name

// TypeScript가 올바른 결과 타입을 강제함
overlay.close({ submitted: true, data: formData })

// 오버레이를 열 때
const result = await openOverlay<FormData, FormResult>(FormDialog, {
  data: { name: 'John', email: 'john@example.com' }
})

// TypeScript가 result.data에 submitted와 data 속성이 있다는 것을 알고 있음
if (result.data.submitted) {
  console.log(result.data.data)
}
```

## UI 라이브러리와의 통합

### reka-ui (권장)

**✅ 다중 스택 오버레이 지원**

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogContent } from 'reka-ui'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- 컨텐츠 -->
    </DialogContent>
  </Dialog>
</template>
```

### shadcn-vue (권장)

**✅ 다중 스택 오버레이 지원**

```bash
# shadcn-vue 초기화
pnpm dlx shadcn-vue@latest init

# dialog 컴포넌트 추가
pnpm dlx shadcn-vue@latest add dialog
```

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
        <DialogDescription>{{ overlay.data.message }}</DialogDescription>
      </DialogHeader>
      <!-- 컨텐츠 -->
    </DialogContent>
  </Dialog>
</template>
```

### Radix Vue (제한적)

**⚠️ AlertDialog는 스택을 지원하지 않습니다** - Dialog만 사용하세요

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogContent } from 'radix-vue'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- 컨텐츠 -->
    </DialogContent>
  </Dialog>
</template>
```

### Headless UI

```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import { Dialog, DialogPanel } from '@headlessui/vue'

const overlay = useCurrentOverlay()
</script>

<template>
  <Dialog :open="overlay.isOpen" @close="overlay.dismiss()">
    <DialogPanel>
      <!-- 컨텐츠 -->
    </DialogPanel>
  </Dialog>
</template>
```

## Beta에서 마이그레이션

베타 버전(0.3.x)에서 업그레이드하는 경우 [마이그레이션 가이드](docs/MIGRATION_KO.md)를 참조하세요.

### 1.0.0의 주요 변경사항

1. **Dialog 요구사항**: 스택 지원을 위해 `Dialog`(AlertDialog 아님)를 사용해야 함
2. **Dependencies**: `reka-ui`와 `@radix-icons/vue` 필요
3. **완전한 반응성**: 모든 컨텍스트 속성이 이제 반응형 (computed refs)
4. **TypeScript 제네릭**: `useOverlayContext<TData, TResult>()`로 더 나은 타입 추론

## overlay-rc (React)와 비교

| 기능 | overlay-vue | overlay-rc |
|------|-------------|------------|
| 프레임워크 | Vue 3 | React |
| API 스타일 | Hooks (Composables) | Hooks |
| 컨텍스트 접근 | `useCurrentOverlay()` | 오버레이 내부의 `useOverlay()` |
| 반응성 | Vue Computed Refs | React State |
| Portal | 내부 (Teleport 불필요) | React Portal |
| 타입 안전 | ✅ 완전한 TypeScript | ✅ 완전한 TypeScript |
| Promise 기반 | ✅ | ✅ |
| 스택 오버레이 | ✅ (Dialog 사용) | ✅ |
| 생명주기 콜백 | ✅ | ✅ |

## 테스트

커버리지와 함께 테스트 실행:

```bash
npm test
# 또는
npm run test:coverage
```

현재 커버리지: **97%+**

## 라이선스

MIT

## 기여

기여를 환영합니다! PR을 제출하기 전에 기여 가이드라인을 읽어주세요.

## 관련 프로젝트

- [overlay-rc](https://github.com/YuJM/layouts-rc/tree/main/packages/overlay-rc) - React 버전

## 변경 로그

버전 히스토리는 [CHANGELOG.md](CHANGELOG.md)를 참조하세요.
