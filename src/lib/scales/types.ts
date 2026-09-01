/** Ein Gewichtswert von der Waage. */
export interface ScaleReading {
  /** Gramm. Negative Werte sind möglich (nach Tara mit abgehobenem Gefäß). */
  grams: number
  /** Zeitstempel in ms, aus `performance.now()` oder der Uhr des Geräts. */
  at: number
}

export type ScaleStatus = 'disconnected' | 'connecting' | 'connected'

/**
 * Was jede Waage können muss — und mehr nicht.
 *
 * Die App-Seite (`BrewTimer`, `NewShot`) kennt **nur** dieses Interface, nie
 * einen Hersteller. Ein zweiter Hersteller ist damit eine neue Datei, kein
 * Umbau. Das ist der Grund, warum die Architektur schon steht, obwohl vorerst
 * nur Bookoo unterstützt wird.
 */
export interface ScaleAdapter {
  /** Stabile Kennung, z. B. 'bookoo'. Landet in Logs und Einstellungen. */
  readonly id: string
  /** Anzeigename für die UI. */
  readonly name: string
  /** GATT-Service-UUIDs, nach denen der Browser-Dialog filtert. */
  readonly serviceUuids: string[]
  /** Namenspräfixe, unter denen sich Geräte dieses Herstellers melden. */
  readonly namePrefixes: string[]

  connect(): Promise<void>
  disconnect(): Promise<void>
  /** Meldet jeden Messwert. Rückgabe hebt das Abo wieder auf. */
  onWeight(cb: (r: ScaleReading) => void): () => void
  /** Auf Null setzen. Nicht jede Waage kann das — dann eine Ablehnung. */
  tare(): Promise<void>
  readonly status: ScaleStatus
}

/** Web Bluetooth ist nicht überall da: Safari (iOS **und** macOS) und Firefox
 *  können es nicht, und Apple lässt keine fremde Browser-Engine zu, mit der
 *  sich das umgehen ließe. Auf dem iPhone führt daher kein Weg an der nativen
 *  App vorbei (Paket G). Die UI muss das sagen können, statt einen
 *  Verbinden-Knopf anzubieten, der nie funktioniert. */
export function webBluetoothAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator
}
