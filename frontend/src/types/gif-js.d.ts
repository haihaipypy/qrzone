declare module 'gif.js' {
  export default class GIF {
    constructor(options: {
      workers?: number
      quality?: number
      width?: number
      height?: number
      workerScript?: string
    })
    addFrame(canvas: HTMLCanvasElement, options?: { delay?: number; copy?: boolean }): void
    on(event: 'finished', callback: (blob: Blob) => void): void
    render(): void
  }
}