import { EventEmitter } from 'events'
import type { Server, IncomingMessage } from 'http'

export class CompatSocket extends EventEmitter {
  readonly readyState: number
  readonly OPEN: number
  isAlive: boolean
  req: IncomingMessage
  send(data: string, cb?: () => void): void
  ping(): void
  close(): void
  terminate(): void
  on(event: 'message', fn: (data: string) => void): this
  on(event: 'close', fn: (code: number, reason: string) => void): this
  on(event: 'pong', fn: () => void): this
  on(event: 'error', fn: (err: Error) => void): this
}
/** 與 npm ws 的 WebSocket 型別同名，讓遊戲程式只需換 import 路徑 */
export type WebSocket = CompatSocket

export class WebSocketServer extends EventEmitter {
  clients: Set<CompatSocket>
  constructor(opt: {
    server: Server
    path?: string
    maxPayload?: number
    verifyClient?: (info: { origin: string; req: IncomingMessage; secure: boolean }) => boolean
  })
  on(event: 'connection', fn: (ws: CompatSocket, req: IncomingMessage) => void): this
  close(cb?: () => void): void
}
