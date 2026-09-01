import type { ScaleAdapter, ScaleReading, ScaleStatus } from './types'

/**
 * Waage aus aufgezeichneten Werten — für Tests und für die Entwicklung ohne
 * Hardware.
 *
 * Ohne diesen Adapter wäre das ganze Paket nicht CI-fähig: die echte Waage
 * lässt sich weder im Test noch in dieser Umgebung anschließen.
 */
export class MockScale implements ScaleAdapter {
  readonly id = 'mock'
  readonly name = 'Mock scale'
  readonly serviceUuids: string[] = []
  readonly namePrefixes: string[] = []

  status: ScaleStatus = 'disconnected'
  private listeners = new Set<(r: ScaleReading) => void>()

  constructor(private readonly curve: ScaleReading[] = espressoCurve()) {}

  async connect(): Promise<void> { this.status = 'connected' }
  async disconnect(): Promise<void> { this.status = 'disconnected'; this.listeners.clear() }
  async tare(): Promise<void> { /* im Mock ohne Wirkung */ }

  onWeight(cb: (r: ScaleReading) => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  /** Spielt die Kurve ab — im Test synchron, ohne Timer. */
  replay(): void {
    for (const r of this.curve) for (const cb of this.listeners) cb(r)
  }

  get readings(): ScaleReading[] { return this.curve }
}

/**
 * Typischer Espresso-Bezug: 3 s Preinfusion ohne Fluss, dann stetiger Anstieg
 * auf ~38 g über 26 s, danach Nachtropfen und Stillstand.
 * Enthält bewusst Rauschen — eine glatte Kurve würde die Erkennung zu leicht
 * aussehen lassen.
 */
export function espressoCurve(): ScaleReading[] {
  const out: ScaleReading[] = []
  const noise = (i: number) => Math.sin(i * 1.7) * 0.06

  for (let t = 0; t <= 3000; t += 200) out.push({ grams: noise(t), at: t })
  for (let t = 3200; t <= 29000; t += 200) {
    const p = (t - 3000) / 26000
    out.push({ grams: 38 * p + noise(t), at: t })
  }
  // Nachtropfen: noch 0.4 g in 1.5 s, dann Ruhe.
  for (let t = 29200; t <= 30500; t += 200) {
    out.push({ grams: 38 + 0.4 * ((t - 29000) / 1500) + noise(t), at: t })
  }
  for (let t = 30700; t <= 36000; t += 200) out.push({ grams: 38.4 + noise(t), at: t })
  return out
}
