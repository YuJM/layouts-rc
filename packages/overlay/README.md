# Overlay-manger-rc

> React overlay component manager

## Install

```shell
npm install overlay-manager-rc
```

## Usage

```typescript jsx
import {
  SlotBaseComp,
  Scaffold,
  ScaffoldHeader,
  ScaffoldBody,
  ScaffoldFooter,
  Row,
  Column,
  Center,
} from 'layouts-rc';
```

### SlotBaseComp

slot: [DOCS](https://www.radix-ui.com/primitives/docs/utilities/slot)

```typescript jsx
<SlotBaseComp asChild>
    <button>button</button>
</SlotBaseComp>

// or

<SlotBaseComp as={"button"}>button</SlotBaseComp>
```

### Rest Component (Scaffold, Column, Row, Center)

[Demo](https://layouts-rc-web.vercel.app)

## Props
