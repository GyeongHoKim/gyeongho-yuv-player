export interface IRenderer {
  draw(frame: VideoFrame): void;
}

export type RendererOptions = {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  renderer: "2d" | "webgl" | "webgl2" | "webgpu"
}