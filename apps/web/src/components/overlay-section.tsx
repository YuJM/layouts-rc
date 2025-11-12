'use client';

import { useOverlayManager } from 'overlay-manager-rc';
import { TestContent } from '@/overlays/test-content.tsx';
import { useOpenSequential } from '@/hooks/useOpenSequential.ts';
import { Button } from '@components/ui/button.tsx';

export function OverlaySection() {
  const { openOverlay } = useOverlayManager();
  const { openSequential } = useOpenSequential();

  const handleOpenAlert = () => {
    void openOverlay({
      content: TestContent,
      data: 'hello!!!!',
      onClose: (re) => {
        console.log(re);
      },
      onOpen: (id) => {
        console.log(id);
      }
    });
  };

  return (
    <section className="md:h-screen">
      <div className="flex flex-col gap-10">
        {/* 단일 Alert */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">단일 Alert</h3>
          <Button onClick={() => { handleOpenAlert(); }}>
            show alert
          </Button>
        </div>

        {/* 순차적으로 열기 */}
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">순차적으로 열기 (Dialog Chain)</h3>
          <Button onClick={() => openSequential(1, 3)}>
            Open Dialog Chain (1→2→3)
          </Button>
        </div>
      </div>
    </section>
  );
}
