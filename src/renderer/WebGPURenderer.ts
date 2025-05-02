import { IRenderer } from "./IRenderer";

declare global {
  type GPUCanvasContext = any;
  type GPUTextureFormat = any;
  type GPUDevice = any;
  type GPURenderPipeline = any;
  type GPUSampler = any;
  type GPURenderPassDescriptor = any;
  type GPU = any;
}

export class WebGPURenderer implements IRenderer {
  private readonly canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: GPUCanvasContext;

  // Promise for `#start()`, WebGPU setup is asynchronous.
  private started: Promise<void>;

  // WebGPU state shared between setup and drawing.
  private format: GPUTextureFormat;
  private device: GPUDevice;
  private pipeline: GPURenderPipeline;
  private sampler: GPUSampler;

  // Generates two triangles covering the whole canvas.
  static vertexShaderSource = `
    struct VertexOutput {
      @builtin(position) Position: vec4<f32>,
      @location(0) uv: vec2<f32>,
    }

    @vertex
    fn vert_main(@builtin(vertex_index) VertexIndex: u32) -> VertexOutput {
      var pos = array<vec2<f32>, 6>(
        vec2<f32>( 1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0,  1.0),
        vec2<f32>(-1.0, -1.0),
        vec2<f32>(-1.0,  1.0)
      );

      var uv = array<vec2<f32>, 6>(
        vec2<f32>(1.0, 0.0),
        vec2<f32>(1.0, 1.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(1.0, 0.0),
        vec2<f32>(0.0, 1.0),
        vec2<f32>(0.0, 0.0)
      );

      var output : VertexOutput;
      output.Position = vec4<f32>(pos[VertexIndex], 0.0, 1.0);
      output.uv = uv[VertexIndex];
      return output;
    }
  `;

  // Samples the external texture using generated UVs.
  static fragmentShaderSource = `
    @group(0) @binding(1) var mySampler: sampler;
    @group(0) @binding(2) var myTexture: texture_external;
    
    @fragment
    fn frag_main(@location(0) uv : vec2<f32>) -> @location(0) vec4<f32> {
      return textureSampleBaseClampToEdge(myTexture, mySampler, uv);
    }
  `;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas;
    this.started = this.start();
  }

  async start() {
    const gpu = (navigator as any).gpu as GPU;
    if (!gpu) throw new Error("WebGPU is not supported in this environment.");
    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error("Failed to get WebGPU adapter.");
    this.device = await adapter.requestDevice();
    this.format = gpu.getPreferredCanvasFormat();

    const ctx = this.canvas.getContext("webgpu") as GPUCanvasContext | null;
    if (!ctx) throw new Error("Failed to get WebGPU context.");
    this.ctx = ctx;
    this.ctx.configure({
      device: this.device,
      format: this.format,
      alphaMode: "opaque",
    });

    this.pipeline = this.device.createRenderPipeline({
      layout: "auto",
      vertex: {
        module: this.device.createShaderModule({ code: WebGPURenderer.vertexShaderSource }),
        entryPoint: "vert_main"
      },
      fragment: {
        module: this.device.createShaderModule({ code: WebGPURenderer.fragmentShaderSource }),
        entryPoint: "frag_main",
        targets: [{ format: this.format }]
      },
      primitive: {
        topology: "triangle-list"
      }
    });

    // Default sampler configuration is nearest + clamp.
    this.sampler = this.device.createSampler({});
  }

  async draw(frame: VideoFrame) {
    // Don't try to draw any frames until the context is configured.
    await this.started;

    this.canvas.width = frame.displayWidth;
    this.canvas.height = frame.displayHeight;

    const uniformBindGroup = this.device.createBindGroup({
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        { binding: 1, resource: this.sampler },
        { binding: 2, resource: this.device.importExternalTexture({ source: frame }) }
      ],
    });

    const commandEncoder = this.device.createCommandEncoder();
    const textureView = this.ctx.getCurrentTexture().createView();
    const renderPassDescriptor: GPURenderPassDescriptor = {
      colorAttachments: [
        {
          view: textureView,
          clearValue: [1.0, 0.0, 0.0, 1.0],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    };

    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, uniformBindGroup);
    passEncoder.draw(6, 1, 0, 0);
    passEncoder.end();
    this.device.queue.submit([commandEncoder.finish()]);

    frame.close();
  }
}