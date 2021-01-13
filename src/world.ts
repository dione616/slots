import * as PIXI from "pixi.js";
import { app } from "./app";
import { Reel } from "./entities/reel";
import { slotTextures } from "./resources";
import { MySymbol } from "./symbol";

const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;
const TextStyle = PIXI.TextStyle;
const Text = PIXI.Text;
const Graphics = PIXI.Graphics;

//logic

const gameWidth = 800;
const gameHeight = 600;

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 150;
const reels: MySymbol[] = [];
const resultArray: string[] = [];
let gameWin = false;
const style = new TextStyle({
  fontFamily: "Arial",
  fontSize: 36,
});
const message = new Text(gameWin ? "Win" : "", style);

let money = 100;
const moneyText = new Text("$" + money.toString());

const reelsOffset: any = [];
const reelsOffsetToReed = [2, 2, 2];

export class World extends PIXI.Container {
  reels: MySymbol[] = []; //reels: MySymbol[] = [];
  reelContainer: PIXI.Container = new PIXI.Container();
  background = PIXI.Texture.from("assets/BG.png");
  BG = new PIXI.Sprite(this.background);

  constructor() {
    super();
    app.stage.on("loaded", () => {
      this.populate();
      app.stage.addChild(this);
    });
    this.addChild(this.BG);
    this.BG.width = app.screen.width;
  }

  populate(): void {
    for (let i = 0; i < 3; i++) {
      const rc = new Reel();
      rc.x = i * REEL_WIDTH + 90;
      /* this.reelContainer.y = -100; */
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

    const margin = (app.screen.height - SYMBOL_SIZE * 3) / 6.6;
    /* world.y = margin; */

    const bottomText = new Text("Press play to start", style);

    const width = app.screen.width;
    const height = margin;

    bottomText.position.set(250, 550);

    this.addChild(bottomText);

    const spinButtonTexture = Texture.from("assets/BTN_Spin.png");
    const spinButton = new Sprite(spinButtonTexture);

    const spinButtonDisabledTexture = Texture.from("assets/BTN_Spin_d.png");
    const spinButtonDisabled = new Sprite(spinButtonDisabledTexture);

    spinButton.position.set(700, 220);
    spinButtonDisabled.position.set(700, 220);
    spinButtonDisabled.visible = false;

    this.addChild(spinButton);
    this.addChild(spinButtonDisabled);

    //Set the interactivity
    spinButton.interactive = true;
    spinButton.buttonMode = true;
    spinButton.addListener("pointerdown", () => {
      startPlay();
    });

    this.addChild(message);

    moneyText.position.set(700, 350);
    this.addChild(moneyText);

    let running = false;

    //Function to start playing.
    const startPlay = () => {
      spinButtonDisabled.visible = true;
      spinButton.interactive = false;
      spinButton.buttonMode = false;
      money -= 5;
      moneyText.updateText(false);
      moneyText.text = "$" + money.toString();

      if (running) return;
      running = true;

      //for each i save target and then pass to r.symbols[counter]._texture.textureCacheIds[0];

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        console.log(r);

        const extra = Number(Math.floor(Math.random() * 3));
        const target = Number(r.position) + extra + i + 2 * 2;

        reelsOffset[i] = extra + i + 2 * 2;
        const time = 500 + i * 600 + extra * 600;
        tweenTo(r, "position", target, time, easing(0.5), null, i === this.reels.length - 1 ? reelsComplete : null);
      }

      for (let i = 0; i < 3; i++) {
        for (let c = 0; c < reelsOffset[i]; c++) {
          reelsOffsetToReed[i]--;
          if (reelsOffsetToReed[i] == -1) {
            reelsOffsetToReed[i] = 3;
          }
        }
      }
    };

    //Reels done handler
    function reelsComplete() {
      running = false;

      checkResult();

      const winGraphic = new Graphics();

      if (gameWin) {
        winGraphic.beginFill(0x81db58, 0.5);
        const width = app.screen.width / 4;
        const height = 180;
        winGraphic.drawRoundedRect(app.screen.width / 2 - width * 1.75, height, width, 130, 20);
        message.x = 320;
        message.y = 240;

        /* this.addChild(winGraphic); */

        money += 10;
        moneyText.updateText(false);
        moneyText.text = money.toString();
        message.updateText(false);
        message.text = "Win";
        gameWin = false;

        winGraphic.addChild(message);

        window.addEventListener("click", () => {
          /* this.removeChild(winGraphic); */
        });

        setTimeout(() => {
          /* this.removeChild(winGraphic); */
        }, 3000);
      }

      if (money) {
        spinButtonDisabled.visible = false;
        spinButton.visible = true;
        spinButton.interactive = true;
        spinButton.buttonMode = true;
      }
    }

    app.ticker.add((delta) => {
      // Update the slots.

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];

        // Update blur filter y amount based on speed.
        // This would be better if calculated with time in mind also. Now blur depends on frame rate.
        // r.blur.blurY = (r.position.y - r.previousPosition) * 8;
        r.previousPosition = Number(r.position);

        // Update symbol positions on reel.
        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];

          const prevy = s.y; //prev position
          s.y = ((Number(r.position) + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE * 1.1;
          if (s.y < 0 && prevy > SYMBOL_SIZE) {
            // Detect going over and swap a texture.

            s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = 0.5;

            if (i == 0) {
              resultArray[0] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            } else if (i == 1) {
              resultArray[1] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            } else if (i == 2) {
              resultArray[2] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            }
          }
        }
      }
    });

    const tweening: any[] = [];
    function tweenTo(
      object: any,
      property: string,
      target: number,
      time: any,
      easing: any,
      onchange: any,
      oncomplete: any
    ) {
      const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
      };

      tweening.push(tween);
      return tween;
    }

    // Listen for animate update.
    app.ticker.add((delta) => {
      const now = Date.now();
      const remove = [];

      for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];

        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase === 1) {
          t.object[t.property] = t.target;
          if (t.complete) t.complete(t);
          remove.push(t);
        }
      }
      for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
      }
    });

    // Basic lerp funtion.
    function lerp(a1: number, a2: number, t: number) {
      return a1 * (1 - t) + a2 * t;
    }

    function easing(amount: number) {
      return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
    }

    function checkResult() {
      const count: any = {};

      resultArray.forEach((i: any) => (count[i] = (count[i] || 0) + 1));

      for (const property in count) {
        if (
          (count[property] > 2 && property != "assets/wild.png") ||
          (count[property] == 2 && property == "assets/wild.png") ||
          (count[property] == 2 && count["assets/wild.png"] == 1)
        ) {
          gameWin = true;
        }
      }
    }
  }
}
