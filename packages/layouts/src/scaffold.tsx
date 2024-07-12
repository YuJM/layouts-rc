import { clsx } from 'clsx';
import { createElement, forwardRef } from 'react';
import { SlotBaseComp } from './slot-base-comp.tsx';
import type { CommonProps } from './slot-base-comp.tsx';

const Scaffold = forwardRef<HTMLElement, CommonProps>(function Scaffold(
  { className, children, ...props },
  ref,
) {
  return createElement(
    SlotBaseComp,
    { ...props, className: clsx('lrc-scaffold', className), ref },
    children,
  );
});
const ScaffoldHeader = forwardRef<HTMLElement, CommonProps>(
  function ScaffoldHeader({ className, children, ...props }, ref) {
    return createElement(
      SlotBaseComp,
      { ...props, className: clsx('lrc-scaffold-header', className), ref },
      children,
    );
  },
);
const ScaffoldBody = forwardRef<HTMLElement, CommonProps>(function ScaffoldBody(
  { className, children, ...props },
  ref,
) {
  return createElement(
    SlotBaseComp,
    { ...props, className: clsx('lrc-scaffold-body', className), ref },
    children,
  );
});
const ScaffoldFooter = forwardRef<HTMLElement, CommonProps>(
  function ScaffoldFooter({ className, children, ...props }, ref) {
    return createElement(
      SlotBaseComp,
      { ...props, className: clsx('lrc-scaffold-footer', className), ref },
      children,
    );
  },
);

export { ScaffoldFooter, ScaffoldBody, ScaffoldHeader, Scaffold };
