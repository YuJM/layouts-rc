'use client';

import type { ReactNode } from 'react';
import { useOverlayRegister } from 'overlay-manager-rc';

export function OverlayManagerProvider({ children }: { children: ReactNode }) {
  const { OverlayProvider, overlays } = useOverlayRegister();

  return (
    <OverlayProvider>
      {children}
      {overlays.map((contentRender) => {
        const { content: ContentComponent } = contentRender;
        if (typeof ContentComponent !== 'function') {
          return null;
        }

        return (
          <ContentComponent
            close={contentRender.close}
            data={contentRender.data}
            id={contentRender.id}
            key={contentRender.id}
            open={contentRender.state}
          />
        );
      })}
    </OverlayProvider>
  );
}
