export const OVERLAY_POSITION = {
    TOP: 'top',
    BOTTOM: 'bottom',
    LEFT: 'left',
    RIGHT: 'right',
    CENTER: 'center',
} as const;
export const OVERLAY_EVENTS = {
  CLOSE: 'overlay:close',
  BEFORE_CLOSE: 'overlay:before-close',
} as const;