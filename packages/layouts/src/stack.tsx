import { clsx } from 'clsx';
import { createElement, CSSProperties, forwardRef } from 'react';
import type { CommonProps } from './slot-base-comp.tsx';
import { SlotBaseComp } from './slot-base-comp.tsx';
import { PREFIX } from './common.ts';
import { useSize } from './utils.tsx';

/*row column center*/
interface StackProps extends CommonProps {
  gap?: CSSProperties['gap'] | number;
}

function genStack(compClass: string) {
  return forwardRef<HTMLElement, StackProps>(function (
    { className, children, gap, style, ...props },
    ref,
  ) {
    const size = useSize(gap);
    return createElement(
      SlotBaseComp,
      {
        ...props,
        className: clsx(compClass, className),
        style: { gap: size, ...style },
        ref,
      },
      children,
    );
  });
}

const Row = genStack(`${PREFIX}-row`);
Row.displayName = 'Row';

const Column = genStack(`${PREFIX}-column`);
Column.displayName = 'Column';

const Center = genStack(`${PREFIX}-center`);
Center.displayName = 'Center';

export { Center, Row, Column };
