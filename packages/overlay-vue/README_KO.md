# overlay-manager-vue

Vue 3를 위한 오버레이 컴포넌트 관리 플러그인입니다.

## 설치

npm을 사용하는 경우:

```bash
npm install overlay-manager-vue
```

yarn을 사용하는 경우:

```bash
yarn add overlay-manager-vue
```

## 사용법

### 설정

1. main.ts/js 파일에서 다음과 같이 설정합니다

```typescript
import { createApp } from 'vue';
import App from './App.vue';
import { overlayManagerPlugin } from 'overlay-manager-vue';

const app = createApp(App);
app.use(overlayManagerPlugin());
app.mount('#app');
```

2. App.vue에서 오버레이 렌더링 설정

App.vue 파일에 다음과 같이 오버레이를 렌더링하는 코드를 추가합니다:

```vue
<template>
  <!-- 기존 앱 컨텐츠 -->
  <component
    v-for="overlay in overlays"
    :key="overlay.id"
    :is="overlay.content"
    :open="overlay.state"
    :data="overlay.data"
    :close="overlay.close"
  />
</template>

<script setup lang="ts">
import { useOverlayManager } from 'overlay-manager-vue';

const { overlays } = useOverlayManager();
</script>
```

### 기본 사용법

1. 예제 오버레이 컴포넌트 생성

- radix-vue AlertDialog를 사용

```vue
<template>
  <AlertDialog v-bind:open="props.open">
    <AlertDialogContent>
      <h2>{{ title }}</h2>
      <p>{{ data.message }}</p>
      <Button @click="handleClose">Close</Button>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import type { OverlayContentProps } from 'overlay-manager-vue';
import { AlertDialog, AlertDialogContent } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
const props = defineProps<OverlayContentProps>();
const title = 'Example Overlay';

const handleClose = () => {
  props.close();
};
</script>
```

2. 컴포넌트에서 오버레이 사용:

다른 컴포넌트에서 오버레이를 사용하는 방법:

```vue
<script setup lang="ts">
import { useOverlayManager } from 'overlay-manager-vue';
import ExampleOverlay from './ExampleOverlay.vue';

const { overlayOpen } = useOverlayManager();

const openOverlay = () => {
  overlayOpen({
    content: ExampleOverlay,
    data: { message: '오버레이 매니저로 생성된 오버레이입니다.' },
  });
};
</script>

<template>
  <button @click="openOverlay">오버레이 열기</button>
</template>
```

## API

### overlayManagerPlugin

오버레이 매니저를 설정하는 Vue 플러그인입니다.

### useOverlayManager

오버레이 매니저 기능에 접근할 수 있는 컴포저블입니다.

반환값:

- `overlays`: 활성화된 오버레이 배열
- `overlayOpen`: 새 오버레이를 열기 위한 함수

#### overlayOpen(options)

새 오버레이를 엽니다.

매개변수:

- `options`: 다음 속성을 가진 객체
  - `content`: 렌더링할 오버레이 컴포넌트
  - `data`: (선택사항) 오버레이 컴포넌트에 전달할 데이터

### 오버레이 컴포넌트 Props

오버레이 컴포넌트를 생성할 때 다음 props를 받습니다:

- `open`: 오버레이를 표시해야 하는지 여부를 나타내는 불리언 값
- `data`: 오버레이를 열 때 전달된 데이터
- `close`: 오버레이를 닫는 함수

## 라이선스

[MIT 라이선스](LICENSE)
