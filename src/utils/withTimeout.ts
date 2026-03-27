// ─── withTimeout ──────────────────────────────────────────────────────────────
// Envuelve cualquier Promise con un límite de tiempo.
// Si Firestore no responde en `ms` milisegundos lanza un error claro
// en lugar de esperar indefinidamente (comportamiento por defecto de Firestore).

const DEFAULT_TIMEOUT_MS = 8_000;

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("Sin conexión. Verifica tu internet e inténtalo de nuevo.")),
      ms
    )
  );
  return Promise.race([promise, timeout]);
}
