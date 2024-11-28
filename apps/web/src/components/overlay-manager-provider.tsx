'use client';

import type { ReactNode } from 'react';
import {OverlayContainer} from "overlay-manager-rc";

export function OverlayManagerProvider({ children }: { children?: ReactNode }) {
  return <OverlayContainer>{children}</OverlayContainer>;
}
