# 마이그레이션 가이드

## Beta (0.3.x)에서 1.0.0으로 마이그레이션

버전 1.0.0은 반응성, 타입 안전성, 전반적인 API 일관성에 대한 중요한 개선 사항을 도입합니다. 이 가이드는 베타 버전에서 안정적인 1.0.0 릴리스로 마이그레이션하는 데 도움이 됩니다.

### 주요 변경사항

#### 1. 컨텍스트 API 변경

**이전 (Beta):**
```vue
<script setup>
import { useCurrentOverlay } from 'overlay-manager-vue'

const overlay = useCurrentOverlay()
// 컨텍스트가 완전히 반응형이 아니었음
</script>
```

**이후 (1.0.0):**
```vue
<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'

const overlay = useCurrentOverlay<DataType, ResultType>()
// 컨텍스트가 이제 적절한 TypeScript 제네릭과 함께 완전히 반응형
</script>
```

**변경된 내용:**
- `useCurrentOverlay`가 이제 Vue의 `computed`를 사용하여 완전히 반응형 컨텍스트를 반환
- 데이터와 결과를 위한 제네릭 타입 매개변수로 더 나은 TypeScript 지원
- `overlay.isOpen`이 이제 적절히 반응형이며 자동으로 업데이트됨

#### 2. 컴포넌트 Dialog 요구사항

**이전 (Beta):**
```vue
<!-- AlertDialog (Radix Vue)를 사용할 수 있었음 -->
<template>
  <AlertDialog :open="overlay.isOpen">
    <AlertDialogContent>
      <!-- ... -->
    </AlertDialogContent>
  </AlertDialog>
</template>
```

**이후 (1.0.0):**
```vue
<!-- 스택 지원을 위해 Dialog (AlertDialog 아님)를 사용해야 함 -->
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <!-- ... -->
    </DialogContent>
  </Dialog>
</template>
```

**변경된 내용:**
- **AlertDialog는 스택을 지원하지 않습니다** - 한 번에 하나만 열 수 있음
- **Dialog (reka-ui/Radix Vue)는 스택을 지원합니다** - 여러 오버레이를 동시에 열 수 있음
- 이것은 React의 overlay-rc 동작과 일치함

**필요한 조치:**
1. 모든 `AlertDialog` import를 `Dialog` import로 교체
2. 필요한 dependencies 설치:
   ```bash
   pnpm add reka-ui @radix-icons/vue
   ```
3. shadcn-vue를 최신 버전으로 업데이트:
   ```bash
   pnpm dlx shadcn-vue@latest add dialog
   ```

#### 3. OverlayHost 내부 변경

**이전 (Beta):**
```typescript
// OverlayHost가 Map을 직접 사용
const overlays = computed(() => manager.getStates())
```

**이후 (1.0.0):**
```typescript
// OverlayHost가 Map을 Array로 변환
const overlays = computed(() => Array.from(manager.getStates().entries()))
```

**변경된 내용:**
- 내부 구현이 이제 Map을 Array로 적절히 변환
- Vue의 `v-for`는 Map 객체를 직접 반복할 수 없음
- API 변경 없음 - 이것은 내부 변경사항일 뿐

**필요한 조치:** 없음 - 자동으로 처리됨

### 1.0.0의 새로운 기능

#### 1. 완전한 반응성 지원

모든 오버레이 컨텍스트 속성이 이제 적절히 반응형입니다:

```vue
<script setup lang="ts">
const overlay = useCurrentOverlay<{ count: number }, void>()

// overlay.isOpen, overlay.data, overlay.id가 모두 반응형
watch(() => overlay.isOpen, (isOpen) => {
  console.log('오버레이 열림 상태 변경:', isOpen)
})
</script>

<template>
  <Dialog :open="overlay.isOpen">
    <!-- overlay.data가 변경되면 자동으로 다시 렌더링 -->
    <DialogTitle>카운트: {{ overlay.data.count }}</DialogTitle>
  </Dialog>
</template>
```

#### 2. 다중 오버레이 스택

React의 overlay-rc처럼 여러 오버레이를 동시에 열 수 있습니다:

```typescript
// 여러 오버레이를 한 번에 열기
const result1 = openOverlay(DialogComponent1, { data: { step: 1 } })
const result2 = openOverlay(DialogComponent2, { data: { step: 2 } })
const result3 = openOverlay(DialogComponent3, { data: { step: 3 } })

// 세 개의 다이얼로그가 모두 보이고 스택됨
```

#### 3. 향상된 TypeScript 지원

```vue
<script setup lang="ts">
interface MyData {
  message: string
  count: number
}

interface MyResult {
  confirmed: boolean
  value?: string
}

// 완전한 타입 안전성
const overlay = useCurrentOverlay<MyData, MyResult>()

// TypeScript가 overlay.data가 MyData라는 것을 알고 있음
const message: string = overlay.data.message

// TypeScript가 close()가 MyResult를 기대한다는 것을 알고 있음
overlay.close({ confirmed: true, value: 'test' })
</script>
```

### 마이그레이션 체크리스트

- [ ] `package.json` 업데이트: `"overlay-manager-vue": "^1.0.0"`
- [ ] 필수 peer dependencies 설치:
  ```bash
  pnpm add reka-ui @radix-icons/vue
  ```
- [ ] 오버레이 컴포넌트에서 모든 `AlertDialog`를 `Dialog`로 교체
- [ ] shadcn-vue 컴포넌트 업데이트:
  ```bash
  pnpm dlx shadcn-vue@latest add dialog
  ```
- [ ] `useCurrentOverlay` 호출에 TypeScript 제네릭 추가
- [ ] 오버레이 스택 기능 테스트
- [ ] 반응성 문제에 대한 임시 해결책 제거
- [ ] `@/components/ui/alert-dialog`에서 `@/components/ui/dialog`로 컴포넌트 import 업데이트

### 예제: 완전한 마이그레이션

**이전 (Beta):**
```vue
<template>
  <AlertDialog :open="overlay.isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ overlay.data.title }}</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="overlay.dismiss()">취소</AlertDialogCancel>
        <AlertDialogAction @click="overlay.close(true)">확인</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

defineProps()
const overlay = useCurrentOverlay()
</script>
```

**이후 (1.0.0):**
```vue
<template>
  <Dialog :open="overlay.isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{{ overlay.data.title }}</DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="overlay.dismiss()">취소</Button>
        <Button @click="overlay.close(true)">확인</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { useCurrentOverlay } from 'overlay-manager-vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface MyData {
  title: string
}

defineProps<MyData>()

const overlay = useCurrentOverlay<MyData, boolean>()
</script>
```

### 일반적인 문제

#### 문제: "여러 오버레이가 스택되지 않음"

**원인:** `Dialog` 대신 `AlertDialog` 사용

**해결책:** shadcn-vue의 `Dialog`로 `AlertDialog`를 교체

#### 문제: "컨텍스트가 반응형이 아님"

**원인:** 이전 컨텍스트 구현을 사용하는 베타 버전 사용

**해결책:** 1.0.0으로 업그레이드 - 반응성이 기본 제공됨

#### 문제: "overlay.data에 TypeScript 오류"

**원인:** `useCurrentOverlay`에 타입 매개변수 누락

**해결책:**
```typescript
// ❌ 잘못됨
const overlay = useCurrentOverlay()

// ✅ 올바름
const overlay = useCurrentOverlay<MyDataType, MyResultType>()
```

### 도움말

마이그레이션 중 문제가 발생하면:

1. 참조 구현을 위해 [예제](../../../apps/vue-demo)를 확인하세요
2. [API 문서](./API.md)를 검토하세요
3. [GitHub](https://github.com/YuJM/layouts-rc/issues)에 이슈를 여세요

### 변경 로그

전체 변경 사항 목록은 [CHANGELOG.md](../CHANGELOG.md)를 참조하세요.
