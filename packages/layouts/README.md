# Layouts-rc
Component library for React layouts.
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
    Center
} from 'layouts-rc';
```
## props
### common props
| Prop    | Type    | Default |
|---------|---------|---------|
| as      | string  | "div"   |
| asChild | boolean | -       |
### stack props (Row, Colum)
| Prop    | Type                | Default |
|---------|---------------------|---------|
| gap     | string\|number      | -       |
| justify | css(justifyContent) | -       |
| items   | css(alignItems)     | -       |