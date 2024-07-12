import { createElement, forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import type { HTMLAttributes } from 'react';

export interface CommonProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  as?: string;
}

export const SlotBaseComp = forwardRef<HTMLElement, CommonProps>(
  function scaffoldCommon(
    { asChild, as = 'div', children, ...props }: CommonProps,
    ref,
  ) {
    const Comp = asChild ? Slot : as;
    return createElement(Comp, { ...props, ref }, children);
  },
);
