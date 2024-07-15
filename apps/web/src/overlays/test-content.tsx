import type { OverlayContentProps } from 'overlay-manager-rc';
import { Button } from '@components/ui/button.tsx';

export function TestContent({ data, close }: OverlayContentProps<string>) {
  return (
    <div>
      test {data}
      <Button
        onClick={() => {
          close();
        }}
      >
        close
      </Button>
    </div>
  );
}
