import * as PIXI from "pixi.js";
import { slotTextures } from "./resources";

const Sprite = PIXI.Sprite;

export class MySymbol extends Sprite {
  constructor(texture: PIXI.Texture) {
    super(texture);
    this.textureName = texture.textureCacheIds[0];
  }

  private sprite = new Sprite();
  private textureName: string;
  public symbols: MySymbol[] = [];

  public previousPosition = 0;
  public blur = 0;

  private updateTexture = (textureId: number) => {
    this.sprite.texture = slotTextures[textureId];
  };
}
