import { EventEmitter } from 'events'

declare class WebSocketClient extends EventEmitter {
  static readonly CONNECTING: 0
  static readonly OPEN: 1
  static readonly CLOSING: 2
  static readonly CLOSED: 3
  constructor(url: string)
  readonly readyState: number
  readonly OPEN: number
  send(data: string): void
  close(): void
  terminate(): void
  on(event: 'open', fn: () => void): this
  on(event: 'message', fn: (data: string | Buffer) => void): this
  on(event: 'close', fn: (code: number, reason: string) => void): this
  on(event: 'error', fn: (err: Error) => void): this
}
export default WebSocketClient
export { WebSocketClient as WebSocket }
