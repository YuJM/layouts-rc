# Layouts-rc

Component library for React layouts.

- Typesafe
- with tailwindcss - ok
- with CSS in js - ok
- with css-modules - ok

## install

```shell
$ npm install layouts-rc
```

## style apply

```typescript jsx
// import './globals.css';
import 'layouts-rc/styles.css';
```

## usage

```typescript jsx
import {
  SlotBaseComp,
  Scaffold,
  ScaffoldBody,
  ScaffoldFooter,
  ScaffoldHeader,
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
### Rest Component [demo](https://layouts-rc-web.vercel.app)

## props

### common props

| Prop    | Type    | Default |
| ------- | ------- | ------- |
| as      | string  | "div"   |
| asChild | boolean | -       |



### stack props (Row, Colum)

| Prop    | Type                | Default |
| ------- | ------------------- | ------- |
| gap     | string\|number      | -       |
| justify | css(justifyContent) | -       |
| items   | css(alignItems)     | -       |
