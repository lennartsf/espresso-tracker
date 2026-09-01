import type { ScaleAdapter, ScaleReading, ScaleStatus } from './types'
import { webBluetoothAvailable } from './types'

/**
 * Bookoo Themis.
 *
 * ⚠️ **Die UUIDs und das Byte-Layout sind noch NICHT am Gerät verifiziert.**
 * Sie stammen aus der öffentlichen Protokollbeschreibung. Vor der ersten
 * echten Nutzung mit Chrome auf Android gegenprüfen
 * (`chrome://bluetooth-internals` → Devices → Inspect), und zwar:
 *   - meldet sich das Gerät unter dem erwarteten Namenspräfix?
 *   - existiert der Service, und liefert die Characteristic Notifications?
 *   - passt das Frame-Layout (Vorzeichen, Skalierung, Endianness)?
 * Bis dahin ist dieser Adapter ungetestet gegen Hardware; die Frame-Zerlegung
 * selbst ist über `parseBookooFrame` aber testbar und getestet.
 */
const SERVICE_UUID = '00000ffe-0000-1000-8000-00805f9b34fb'
const WEIGHT_CHAR_UUID = '0000ff11-0000-1000-8000-00805f9b34fb'
const COMMAND_CHAR_UUID = '0000ff12-0000-1000-8000-00805f9b34fb'

/** Tara-Kommando laut Protokollbeschreibung. Ebenfalls unverifiziert. */
const CMD_TARE = new Uint8Array([0x03, 0x0a, 0x01, 0x00, 0x00, 0x08])

/**
 * Zerlegt ein Gewichts-Frame.
 *
 * Layout (20 Byte): Header `0x03 0x0b`, danach Zeit, ab Byte 6 das Gewicht als
 * 3 Byte big-endian in Zehntelgramm, Byte 6 trägt das Vorzeichen.
 *
 * Gibt `null` für alles, was nicht passt — ein falsch interpretiertes Frame
 * wäre ein Gewichtssprung mitten im Bezug und würde den Auto-Stopp auslösen.
 */
export function parseBookooFrame(data: DataView): number | null {
  if (data.byteLength < 10) return null
  if (data.getUint8(0) !== 0x03 || data.getUint8(1) !== 0x0b) return null

  const sign = data.getUint8(6) === 0x2d ? -1 : 1
  const raw = (data.getUint8(7) << 16) | (data.getUint8(8) << 8) | data.getUint8(9)
  const grams = (sign * raw) / 100

  // Plausibilitätsgrenze: eine Espressowaage wiegt keine 5 kg. Ein Wert
  // darüber heißt, das Layout stimmt nicht — dann lieber nichts melden.
  if (!Number.isFinite(grams) || Math.abs(grams) > 5000) return null
  return grams
}

export class BookooScale implements ScaleAdapter {
  readonly id = 'bookoo'
  readonly name = 'Bookoo Themis'
  readonly serviceUuids = [SERVICE_UUID]
  readonly namePrefixes = ['BOOKOO', 'BOOKOO_SC']

  status: ScaleStatus = 'disconnected'

  private device: BluetoothDevice | null = null
  private commandChar: BluetoothRemoteGATTCharacteristic | null = null
  private listeners = new Set<(r: ScaleReading) => void>()

  async connect(): Promise<void> {
    if (!webBluetoothAvailable()) {
      throw new Error(
        'This browser cannot talk to Bluetooth scales. Safari and Firefox have no Web Bluetooth — on iPhone the native app is needed.',
      )
    }
    this.status = 'connecting'
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: this.namePrefixes.map(namePrefix => ({ namePrefix })),
        optionalServices: this.serviceUuids,
      })
      const server = await this.device.gatt!.connect()
      const service = await server.getPrimaryService(SERVICE_UUID)

      const weightChar = await service.getCharacteristic(WEIGHT_CHAR_UUID)
      await weightChar.startNotifications()
      weightChar.addEventListener('characteristicvaluechanged', this.handleValue)

      // Tara ist optional: manche Firmware kennt die Command-Characteristic
      // nicht. Das darf die Verbindung nicht scheitern lassen.
      this.commandChar = await service.getCharacteristic(COMMAND_CHAR_UUID).catch(() => null)

      this.device.addEventListener('gattserverdisconnected', this.handleDisconnect)
      this.status = 'connected'
    } catch (err) {
      this.status = 'disconnected'
      throw err
    }
  }

  private handleValue = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value
    if (!value) return
    const grams = parseBookooFrame(value)
    if (grams === null) return
    const reading: ScaleReading = { grams, at: performance.now() }
    for (const cb of this.listeners) cb(reading)
  }

  private handleDisconnect = () => { this.status = 'disconnected' }

  async disconnect(): Promise<void> {
    this.device?.gatt?.disconnect()
    this.device = null
    this.commandChar = null
    this.listeners.clear()
    this.status = 'disconnected'
  }

  onWeight(cb: (r: ScaleReading) => void): () => void {
    this.listeners.add(cb)
    return () => this.listeners.delete(cb)
  }

  async tare(): Promise<void> {
    if (!this.commandChar) throw new Error('This scale does not accept a tare command.')
    await this.commandChar.writeValue(CMD_TARE)
  }
}
