import { IRenderer, RendererOptions } from "./IRenderer";
import { Simple2DRenderer } from "./Simple2DRenderer";
import { WebGLRenderer } from "./WebGLRenderer";
import { WebGPURenderer } from "./WebGPURenderer";

export class RendererFactory {
  static createRenderer(rendererOptions: RendererOptions): IRenderer {
    const { renderer, canvas } = rendererOptions;
    switch (renderer) {
      case "2d":
        return new Simple2DRenderer(canvas);
      case "webgl":
        return new WebGLRenderer(canvas, "webgl");
      case "webgl2":
        return new WebGLRenderer(canvas, "webgl2");
      case "webgpu":
        return new WebGPURenderer(canvas);
    }
  }
}