import * as PIXI from "pixi.js";
import { app } from "../app";

export class Reel extends PIXI.Container {
  sprite: PIXI.Container;
  constructor() {
    super();

    this.sprite = new PIXI.Container();
    this.addChild(this.sprite);
  }
}
