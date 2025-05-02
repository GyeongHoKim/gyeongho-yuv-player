import { IPlayer, PlayerOptions } from "./IPlayer";
import { SimplePlayer } from "./SimplePlayer";

export class PlayerFactory {
  static createPlayer(playerOptions: PlayerOptions): IPlayer {
    return new SimplePlayer(playerOptions);
  }
}