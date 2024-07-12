import { clsx } from 'clsx';
import { createElement, forwardRef } from 'react';
import type { CommonProps } from './slot-base-comp.tsx';
import { SlotBaseComp } from './slot-base-comp.tsx';
import { PREFIX } from './common.ts';

function genScaffold(compClass: string) {
  return forwardRef<HTMLElement, CommonProps>(function (
    { className, children, ...props },
    ref,
  ) {
    return createElement(
      SlotBaseComp,
      { ...props, className: clsx(compClass, className), ref },
      children,
    );
  });
}

const Scaffold = genScaffold(`${PREFIX}-scaffold`);
Scaffold.displayName = 'Scaffold';
const ScaffoldHeader = genScaffold(`${PREFIX}-scaffold-header`);
ScaffoldHeader.displayName = 'ScaffoldHeader';
const ScaffoldBody = genScaffold(`${PREFIX}-scaffold-body`);
ScaffoldBody.displayName = 'ScaffoldBody';
const ScaffoldFooter = genScaffold(`${PREFIX}-scaffold-footer`);
ScaffoldFooter.displayName = 'ScaffoldFooter';

export { ScaffoldFooter, ScaffoldBody, ScaffoldHeader, Scaffold };
