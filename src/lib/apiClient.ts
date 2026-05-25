export async function apiRequest<T>(input: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Erro ao comunicar com a API.');
  }

  return payload as T;
}
