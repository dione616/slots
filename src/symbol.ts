import * as PIXI from "pixi.js";

const Sprite = PIXI.Sprite;

export class MySymbol extends Sprite {
  constructor(texture: PIXI.Texture) {
    super(texture);
    this.size = 110;
  }

  symbols: MySymbol[] = [];

  previousPosition = 0;
  blur = 0;
  size = 110;
}
