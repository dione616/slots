import * as PIXI from "pixi.js";
import { app } from "./app";
import { Reel } from "./entities/reel";
/* import { slotTextures } from "./resources"; */
import { MySymbol } from "./symbol";

const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;
const TextStyle = PIXI.TextStyle;
const Text = PIXI.Text;
const Graphics = PIXI.Graphics;

const statsStyle = new TextStyle({
  fontFamily: "Arial",
  fontSize: 20,
});
let money = 100;
let wins = 0;
const moneyText = new Text("Money:$" + money, statsStyle);
const winsText = new Text("Win: " + wins, statsStyle);

const reelsOffset: any = [];
const reelsOffsetToReed = [1, 1, 1];

const slotTextures: PIXI.Texture[] = [];

//WORLD
export class World extends Container {
  reels: MySymbol[] = [];
  reelContainer: PIXI.Container = new Container();

  REEL_WIDTH = 200;
  SYMBOL_SIZE = 110;

  resultArray: string[] = [];
  gameWin = false;

  style = new TextStyle({
    fontFamily: "Arial",
    fontSize: 36,
    fill: ["white", "white"],
  });
  message = new Text(this.gameWin ? "Win" : "", this.style);

  background = PIXI.Texture.from("assets/BG.png");
  BG = new PIXI.Sprite(this.background);

  constructor() {
    super();
    app.stage.on("loaded", () => {
      this.populate();
      app.stage.addChild(this);
    });
    this.addChild(this.BG);
    this.BG.width = 800;
  }

  populate = (): void => {
    for (const key in app.loader.resources) {
      slotTextures.push(app.loader.resources[key].texture);
      if (app.loader.resources[key].name == "wild") {
        slotTextures.push(app.loader.resources[key].texture);
        slotTextures.push(app.loader.resources[key].texture);
      }
    }

    for (let i = 0; i < 3; i++) {
      const rc = new Reel();
      rc.x = i * this.REEL_WIDTH + 80;
      this.reelContainer.addChild(rc);
      this.reelContainer.x = 30;
      this.reelContainer.y = 230;

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
      for (let j = 0; j < 3; j++) {
        const texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
        const symbol = new MySymbol(texture);

        // Scale the symbol to fit symbol area.
        symbol.y = j * this.SYMBOL_SIZE;
        symbol.scale.x = symbol.scale.y = 0.5;
        symbol.x = Math.round((this.SYMBOL_SIZE - symbol.width) / 2);

        //push to parent
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }

      this.reels.push(reel);
    }

    this.addChild(this.reelContainer);

    const bottomText = new Text("Press play to start", this.style);

    bottomText.position.set(250, 550);

    this.addChild(bottomText);

    const spinButtonTexture = Texture.from("assets/BTN_Spin.png");
    const spinButton = new Sprite(spinButtonTexture);

    const spinButtonDisabledTexture = Texture.from("assets/BTN_Spin_d.png");
    const spinButtonDisabled = new Sprite(spinButtonDisabledTexture);

    const buttonX = 688;
    const buttonY = 220;
    spinButton.position.set(buttonX, buttonY);
    spinButton.width = 80;

    spinButtonDisabled.position.set(buttonX, buttonY);
    spinButtonDisabled.width = 80;
    spinButtonDisabled.visible = false;

    this.addChild(spinButton);
    this.addChild(spinButtonDisabled);

    //Set the interactivity
    spinButton.interactive = true;
    spinButton.buttonMode = true;
    spinButton.addListener("pointerdown", () => {
      startPlay();
    });

    this.addChild(this.message);

    moneyText.position.set(665, 350);
    this.addChild(moneyText);
    winsText.position.set(665, 370);
    this.addChild(winsText);

    let running = false;

    //Function to start playing.
    const startPlay = () => {
      spinButtonDisabled.visible = true;
      spinButton.interactive = false;
      spinButton.buttonMode = false;
      money -= 5;
      moneyText.updateText(false);
      moneyText.text = "Money:$" + money.toString();

      if (running) return;
      running = true;

      //for each i save target and then pass to r.symbols[counter]._texture.textureCacheIds[0];

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];

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
            reelsOffsetToReed[i] = 2;
          }
        }
      }
    };

    //Reels done handler
    const reelsComplete = () => {
      running = false;

      checkResult();

      const winGraphic = new Graphics();

      if (this.gameWin && money) {
        winGraphic.beginFill(0x81db58, 0.5);

        winGraphic.drawRoundedRect(60, 220, 595, 80, 20);
        this.message.x = 320;
        this.message.y = 260;

        this.addChild(winGraphic);

        money += 10;
        wins++;

        moneyText.updateText(false);
        moneyText.text = `Money:$${money}`;
        winsText.updateText(false);
        winsText.text = `Win: ${wins}`;

        this.message.updateText(false);
        this.message.text = "Win";

        winGraphic.addChild(this.message);

        window.addEventListener("click", () => {
          this.removeChild(winGraphic);
        });
        this.gameWin = false;

        setTimeout(() => {
          this.removeChild(winGraphic);
          spinButtonDisabled.visible = false;
          spinButton.visible = true;
          spinButton.interactive = true;
          spinButton.buttonMode = true;
        }, 3000);
      } else if (money) {
        spinButtonDisabled.visible = false;
        spinButton.visible = true;
        spinButton.interactive = true;
        spinButton.buttonMode = true;
      }

      /* if (money) {
        spinButtonDisabled.visible = false;
        spinButton.visible = true;
        spinButton.interactive = true;
        spinButton.buttonMode = true;
      } */
    };

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
          s.y = ((Number(r.position) + j) % r.symbols.length) * this.SYMBOL_SIZE - this.SYMBOL_SIZE;
          if (s.y < 0 && prevy > this.SYMBOL_SIZE) {
            // Detect going over and swap a texture.
            s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
            s.scale.x = s.scale.y = 0.5;

            if (i == 0) {
              this.resultArray[0] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            } else if (i == 1) {
              this.resultArray[1] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            } else if (i == 2) {
              this.resultArray[2] = r.symbols[reelsOffsetToReed[i]].texture.textureCacheIds[0];
            }
          }
        }
      }
    });

    const tweening: any[] = [];
    const tweenTo = (
      object: any,
      property: string,
      target: number,
      time: any,
      easing: any,
      onchange: any,
      oncomplete: any
    ) => {
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
    };

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
    const lerp = (a1: number, a2: number, t: number) => {
      return a1 * (1 - t) + a2 * t;
    };

    const easing = (amount: number) => {
      return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
    };

    const checkResult = () => {
      const count: any = {};

      this.resultArray.forEach((i: any) => (count[i] = (count[i] || 0) + 1));

      for (const property in count) {
        if (
          1 > 0
          /* (count[property] > 2 && property != "wild") ||
          (count[property] == 2 && property == "wild") ||
          (count[property] == 2 && count["wild"] == 1) */
        ) {
          this.gameWin = true;
        }
      }
    };
  };
}
