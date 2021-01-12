import * as PIXI from "pixi.js";
import { app } from "./app";
import { Reel } from "./entities/reel";
import { slotTextures } from "./resources";
import { MySymbol } from "./symbol";

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 150;

export class World extends PIXI.Container {
  reels: any[] = []; //reels: MySymbol[] = [];
  reelContainer: PIXI.Container = new PIXI.Container();
  background = PIXI.Texture.from("assets/BG.png");
  BG = new PIXI.Sprite(this.background);

  constructor() {
    super();
    this.addChild(this.BG);
  }

  populate(): void {
    for (let i = 0; i < 3; i++) {
      const rc = new Reel();
      rc.x = i * REEL_WIDTH + 90;
      this.reelContainer.addChild(rc);

      const reel: any = {
        container: rc,
        symbols: [],
        position: 0,
        previousPosition: 0,
        blur: new PIXI.filters.BlurFilter(),
      };
      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      rc.filters = [reel.blur];

      //Build symbols
      for (let j = 0; j < 4; j++) {
        const texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
        const symbol = new PIXI.Sprite(texture);

        // Scale the symbol to fit symbol area.
        symbol.y = j * SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = 0.5;
        symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);

        //push to parent
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.addChild(this.reelContainer);
  }
}
