import { useEffect } from 'react';
import { overlays } from './use-overlay-manager';

export const useBeforeClose = (
    beforeClose: () => Promise<boolean> | boolean,
    id: string,
) => {
    useEffect(() => {
        // id가 없으면 그냥 무시
        if (!id) return;

        // 해당 id를 가진 Overlay의 beforeClose를 설정
        overlays.value = overlays.value.map((o) =>
            o.id === id ? { ...o, beforeClose } : o,
        );

        // unmount시
        return () => {
            // id가 없으면 그냥 무시
            if (!id) return;

            // 해당 id를 가진 Overlay의 beforeClose를 제거
            overlays.value = overlays.value.map((o) =>
                o.id === id ? { ...o, beforeClose: undefined } : o,
            );
        };
    }, [beforeClose, id]);
};