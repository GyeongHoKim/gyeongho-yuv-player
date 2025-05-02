import { IPlayer, PlayerOptions } from "./IPlayer";

export class SimplePlayer implements IPlayer {
  constructor(private playerOptions: PlayerOptions) {
    this.playerOptions = playerOptions;
  }
  stop(): void {
    throw new Error("Method not implemented.");
  }

  play() {
    throw new Error("Method not implemented.");
  }

  pause() {
    throw new Error("Method not implemented.");
  }
}