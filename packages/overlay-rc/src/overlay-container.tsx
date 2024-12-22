import { useSignals } from '@preact/signals-react/runtime';
import type { ReactNode } from "react";
import { useEffect } from 'react';
import { useOverlayManager } from "./use-overlay-manager.tsx";

const CLEANUP_INTERVAL = 30000; // 30초
const CLEANUP_THRESHOLD = 30000; // 30초

export function OverlayContainer({ children }: { children?: ReactNode }) {
    useSignals();
    const { overlays: activeOverlays } = useOverlayManager();

    useEffect(() => {
        // 30초마다 닫힌 오버레이 정리
        const cleanupInterval = setInterval(() => {
            const currentTime = Date.now();
            activeOverlays.value = activeOverlays.value.filter(overlay => {
                // open 상태이거나 closeTimestamp가 없으면 유지
                if (overlay.open || !overlay.closeTimestamp) {
                    return true;
                }
                // closeTimestamp가 있고 30초가 지났으면 제거
                return currentTime - overlay.closeTimestamp < CLEANUP_THRESHOLD;
            });
        }, CLEANUP_INTERVAL);

        return () => {
            clearInterval(cleanupInterval);
        };
    }, []);

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