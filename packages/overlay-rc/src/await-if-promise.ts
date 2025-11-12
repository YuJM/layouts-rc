export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export async function awaitIfPromise<T>(value: T | Promise<T>): Promise<T> {
  if (isPromise<T>(value)) {
    const re = await value;
    return re;
  }
  return value;
}

export async function safeAwaitIfPromise<T>(
  value: T | Promise<T>,
  defaultValue: T,
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    return await awaitIfPromise(value);
  } catch (error) {
    onError?.(error);
    return defaultValue;
  }
}
