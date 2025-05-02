export interface IPlayer {
  play(): void;
  pause(): void;
  stop(): void;
}

export type PlayerOptions = {
  renderer: "2d" | "webgl" | "webgl2" | "webgpu"
}