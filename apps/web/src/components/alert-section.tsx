'use client';

import { useOverlayManager } from 'overlay-manager-rc';
import { useEffect } from 'react';
import { TestContent } from '@/overlays/test-content.tsx';
import { Button } from '@components/ui/button.tsx';

export function AlertSection() {
  const { openOverlay } = useOverlayManager();
  const handleOpenAlert = () => {
    openOverlay({
      content: TestContent,
      data: 'hello!!!!',
    });
  };

  useEffect(() => {
    console.log('render');
  }, []);

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
