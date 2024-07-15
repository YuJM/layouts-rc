'use client';

import { useOverlayManager } from 'overlay-manager-rc';
import { TestContent } from '@/overlays/test-content.tsx';
import { Button } from '@components/ui/button.tsx';

export function AlertSection() {
  const { overlayOpen } = useOverlayManager();
  const handleOpenAlert = () => {
    overlayOpen?.({
      content: TestContent,
      data: '바람',
    });
  };
  return (
    <section className="md:h-screen">
      <div className="flex flex-col gap-10">
        <Button
          onClick={() => {
            handleOpenAlert();
          }}
        >
          show alert
        </Button>
      </div>
    </section>
  );
}
