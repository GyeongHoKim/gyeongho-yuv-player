
import { IRenderer } from "./IRenderer";

export class Simple2DRenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement | OffscreenCanvas;
  private readonly ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas;
    const _ctx = this.canvas.getContext("2d");
    if (!_ctx) {
      throw new Error("Failed to get 2d context");
    }
    this.ctx = _ctx;
  }
  draw(frame: VideoFrame): void {
    this.canvas.width = frame.codedWidth;
    this.canvas.height = frame.codedHeight;
    this.ctx.drawImage(frame, 0, 0, frame.codedWidth, frame.codedHeight);
    frame.close();
  }
}