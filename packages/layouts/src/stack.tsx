import { clsx } from 'clsx';
import type { CSSProperties } from 'react';
import { Children, createElement, forwardRef } from 'react';
import type { CommonProps } from './slot-base-comp.tsx';
import { SlotBaseComp } from './slot-base-comp.tsx';
import { PREFIX } from './common.ts';
import { useSize } from './utils.tsx';

/*row column center*/
interface StackProps extends CommonProps {
  gap?: CSSProperties['gap'] | number;
  justify?: CSSProperties['justifyContent'];
  items?: CSSProperties['alignItems'];
}

function genStack(compClass: string, onlyOne = false) {
  // eslint-disable-next-line react/display-name
  return forwardRef<HTMLElement, StackProps>(
    (
      {
        className,
        children,
        justify = undefined,
        items = undefined,
        gap,
        style,
        ...props
      },
      ref,
    ) => {
      const size = useSize(gap);
      return createElement(
        SlotBaseComp,
        {
          ...props,
          className: clsx(compClass, className),
          style: {
            gap: onlyOne ? undefined : size,
            justifyContent: justify,
            alignItems: items,
            ...style,
          },
          ref,
        },
        onlyOne ? Children.only(children) : children,
      );
    },
  );
}

const Row = genStack(`${PREFIX}-row`);
Row.displayName = 'Row';

const Column = genStack(`${PREFIX}-column`);
Column.displayName = 'Column';

const Center = genStack(`${PREFIX}-center`, true);
Center.displayName = 'Center';

export { Center, Row, Column };
