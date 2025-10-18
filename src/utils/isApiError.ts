interface ApiError<T> {
  response?: {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
  };
  message?: string;
  config?: object;
  isAxiosError?: boolean;
}

export function isApiError<T>(error: unknown): error is ApiError<T> {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;

  return (
    err.isAxiosError === true &&
    typeof err.response === 'object' &&
    err.response !== null &&
    'data' in err.response
  );
}