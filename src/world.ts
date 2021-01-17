import {
  changeGameMoney,
  changeGameResult,
  changeGameWinsCounter,
  gameWin,
  message,
  money,
  moneyText,
  reelsOffset,
  reelsOffsetToReed,
  resultArray,
  slotTextures,
  style,
  wins,
  winsText,
} from "./utils/stats";
import * as PIXI from "pixi.js";
import { app } from "./app";
import { Reel } from "./entities/reel";
import { MySymbol } from "./symbol";

const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;
const Text = PIXI.Text;
const Graphics = PIXI.Graphics;

//WORLD
export class World extends Container {
  reels: MySymbol[] = [];
  reelContainer: PIXI.Container = new Container();
  constructor() {
    super();
    app.stage.on("loaded", () => {
      this.populate();
      app.stage.addChild(this);
    });
    this.addChild(this.BG);
    this.BG.width = 800;
  }

  background = PIXI.Texture.from("assets/BG.png");
  BG = new PIXI.Sprite(this.background);

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
      rc.x = i * rc.reelWidth + 80;
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
        symbol.y = j * symbol.size;
        symbol.scale.x = symbol.scale.y = 0.5;
        symbol.x = Math.round((symbol.size - symbol.width) / 2);

        //push to parent
        reel.symbols.push(symbol);
        rc.addChild(symbol);
      }

      this.reels.push(reel);
    }

    this.addChild(this.reelContainer);

    const bottomText = new Text("Press play to start", style);
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

    this.addChild(message);

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
      changeGameMoney(false);
      moneyText.updateText(false);
      moneyText.text = "Money:$" + money.toString();

      if (running) return;
      running = true;

      //for each i save target and then pass to r.symbols[counter]._texture.textureCacheIds[0];

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];

        const extra = Number(Math.floor(Math.random() * 3));
        const target = Number(r.position) + extra + i * 3 + 2 * 2;

        reelsOffset[i] = extra + i * 3 + 2 * 2;
        const time = 500 + i * 600 + i * 600;
        if (i === this.reels.length - 1) {
          const args: TweenType = {
            object: r,
            property: "position",
            target,
            time,
            easing: this.easing(0.5),
            change: null,
            complete: reelsComplete,
          };
          tweenTo(args);
        } else {
          const args: TweenType = {
            object: r,
            property: "position",
            target,
            time,
            easing: this.easing(0.5),
            change: null,
            complete: null,
          };
          tweenTo(args);
        }
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

      this.checkResult();

      const winGraphic = new Graphics();

      if (gameWin && money) {
        winGraphic.beginFill(0x81db58, 0.5);

        winGraphic.drawRoundedRect(60, 220, 595, 80, 20);
        message.x = 320;
        message.y = 260;

        this.addChild(winGraphic);

        changeGameMoney(true);
        changeGameWinsCounter();

        moneyText.updateText(false);
        moneyText.text = `Money:$${money}`;
        winsText.updateText(false);
        winsText.text = `Win: ${wins}`;

        message.updateText(false);
        message.text = "Win";

        winGraphic.addChild(message);

        window.addEventListener("click", () => {
          this.removeChild(winGraphic);
          changeGameResult(false);
        });

        spinButtonDisabled.visible = false;
        spinButton.visible = true;
        spinButton.interactive = true;
        spinButton.buttonMode = true;

        setTimeout(() => {
          this.removeChild(winGraphic);
        }, 3000);
      } else if (money) {
        spinButtonDisabled.visible = false;
        spinButton.visible = true;
        spinButton.interactive = true;
        spinButton.buttonMode = true;

        this.removeChild(winGraphic);
      }
    };

    app.ticker.add(() => {
      // Update the slots.

      for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];

        r.previousPosition = Number(r.position);

        // Update symbol positions on reel.
        for (let j = 0; j < r.symbols.length; j++) {
          const s = r.symbols[j];

          const prevy = s.y; //prev position
          s.y = ((Number(r.position) + j) % r.symbols.length) * s.size - s.size;
          if (s.y < 0 && prevy > s.size) {
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

    interface TweenType {
      object: any;
      property: string;
      propertyBeginValue?: number;
      target: number;
      easing: (t: number) => number;
      time: number;
      change: null;
      complete: (() => void) | null;
      start?: number;
    }
    interface TweenTypeArg {
      args: TweenType;
    }
    const tweening: TweenType[] = [];
    const tweenTo = <T extends TweenType>(args: T) => {
      const tween = {
        object: args.object,
        property: args.property,
        propertyBeginValue: args.object[args.property],
        target: args.target,
        easing: args.easing,
        time: args.time,
        change: args.change,
        complete: args.complete,
        start: Date.now(),
      };

      tweening.push(tween);
      return tween;
    };

    // Listen for animate update.
    app.ticker.add(() => {
      const now = Date.now();
      const remove = [];

      for (let i = 0; i < tweening.length; i++) {
        const t = tweening[i];

        let phase = 0;

        if (t.start) {
          phase = Math.min(1, (now - t.start) / t.time);
        }

        t.object[t.property] = this.lerp(t.propertyBeginValue ? t.propertyBeginValue : 0, t.target, t.easing(phase));

        if (phase === 1) {
          t.object[t.property] = t.target;
          if (t.complete) t.complete();
          remove.push(t);
        }
      }
      for (let i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
      }
    });
  };

  // Basic lerp funtion.
  lerp = (a1: number, a2: number, t: number): number => {
    return a1 * (1 - t) + a2 * t;
  };

  easing = (amount: number) => {
    return (t: number) => --t * t * ((amount + 1) * t + amount) + 1;
  };

  checkResult = (): void => {
    const count: any = {};

    resultArray.forEach((i: string) => (count[i] = (count[i] || 0) + 1));
    console.log(count);

    for (const property in count) {
      if (
        (count[property] > 2 && property != "wild") ||
        (count[property] == 2 && property == "wild") ||
        (count[property] == 2 && count["wild"] == 1)
      ) {
        changeGameResult(true);
      }
    }
  };
}
