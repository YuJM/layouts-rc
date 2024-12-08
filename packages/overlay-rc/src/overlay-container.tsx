import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from "react";
import { useOverlayManager } from "./use-overlay-manager.tsx";

export function OverlayContainer({ children }: { children?: ReactNode }) {
    useSignals();
    const {overlays: activeOverlays} = useOverlayManager();

    return (
        <>
            {children}
            {activeOverlays.value.map((overlay) => (
                <overlay.content
                    close={(result) => overlay.onClose?.(result)}
                    data={overlay.data}
                    key={overlay.id}
                    id={overlay.id}
                    open={overlay.open}
                />
            ))}
        </>
    );
}