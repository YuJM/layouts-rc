/**
 * 스타일 사이즈에 대한 처리
 * @param size
 */
export const useSize = (
  size?: number | undefined | null | string,
): undefined | string => {
  if (!size) return undefined;
  return /^\d+$/.test(`${size}`) ? `${size}px` : `${size}`;
};
