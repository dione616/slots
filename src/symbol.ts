import * as PIXI from "pixi.js";

const Sprite = PIXI.Sprite;

export class MySymbol extends Sprite {
  constructor(texture: PIXI.Texture) {
    super(texture);
  }

  public symbols: MySymbol[] = [];

  public previousPosition = 0;
  public blur = 0;
}
