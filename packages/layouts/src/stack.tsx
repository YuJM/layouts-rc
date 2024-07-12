import { clsx } from 'clsx';
import { createElement, forwardRef } from 'react';
import { SlotBaseComp } from './slot-base-comp.tsx';
import type { CommonProps } from './slot-base-comp.tsx';

/*row column center*/

const Row = forwardRef<HTMLElement, CommonProps>(function StackRow(
  { className, children, ...props },
  ref,
) {
  return createElement(
    SlotBaseComp,
    { ...props, className: clsx('lrc-row', className), ref },
    children,
  );
});

const Column = forwardRef<HTMLElement, CommonProps>(function StackColumn(
  { className, children, ...props },
  ref,
) {
  return createElement(
    SlotBaseComp,
    { ...props, className: clsx('lrc-column', className), ref },
    children,
  );
});

const Center = forwardRef<HTMLElement, CommonProps>(function Stack(
  { className, children, ...props },
  ref,
) {
  return createElement(
    SlotBaseComp,
    { ...props, className: clsx('lrc-center', className), ref },
    children,
  );
});

export { Center, Row, Column };
