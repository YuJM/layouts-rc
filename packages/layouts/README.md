# Layouts-rc

> React component library for layouts.

Inspired by flutter layout widgets.[(link)](https://docs.flutter.dev/ui/widgets/layout)

- Typesafe
- with tailwindcss - 👌
- with CSS in js - 👌
- with css-modules - 👌

## Install

```shell
$ npm install layouts-rc
```

## Style apply

```typescript jsx
import 'layouts-rc/styles.css'; // top
import './globals.css';
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

### Common props

| Prop    | Type    | Default |
| ------- | ------- | ------- |
| as      | string  | "div"   |
| asChild | boolean | -       |

### Row & Column Component props

| Prop    | Type                | Default |
| ------- | ------------------- | ------- |
| gap     | string\|number      | -       |
| justify | css(justifyContent) | -       |
| items   | css(alignItems)     | -       |
