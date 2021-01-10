import * as PIXI from "pixi.js";
import { MySymbol } from "./Symbol";
const Application = PIXI.Application;
const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;

import "./style.css";

const gameWidth = 800;
const gameHeight = 600;

const app = new Application({
  backgroundColor: 0x000000,
  width: gameWidth,
  height: gameHeight,
});

const stage = app.stage;

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 150; /* 180 */
const reels: MySymbol[] = [];
let counter = 2;
const resultArray: any = [];
let gameWin = false;
const message = new PIXI.Text(gameWin ? "Win" : "");
let money = 100;
const moneyText = new PIXI.Text(money.toString());

const reelsOffset: any = [];
const reelsOffsetToReed = [2, 2, 2];

//Symbols textures
export const slotTextures = [
  Texture.from("assets/wild.png"),
  Texture.from("assets/straw.png"),
  Texture.from("assets/pine.png"),
  Texture.from("assets/lemon.png"),
  Texture.from("assets/green.png"),
  Texture.from("assets/grape.png"),
];

window.onload = async (): Promise<void> => {
  await loadGameAssets();

  document.body.appendChild(app.view);

  resizeCanvas();

  /* const birdFromSprite = getBird();
    birdFromSprite.anchor.set(0.5, 0.5);
    birdFromSprite.position.set(gameWidth / 2, gameHeight / 2);

    stage.addChild(birdFromSprite); */

  const background = Texture.from("assets/BG.png");
  const BG = new MySymbol(background);
  BG.scale.set(0.85, 1);

  stage.addChild(BG);

  //Build the reels
  const reelContainer = new Container();

  for (let i = 0; i < 3; i++) {
    const rc = new Container();
    rc.x = i * REEL_WIDTH + 90;
    reelContainer.addChild(rc);

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
      const symbol = new Sprite(texture);

      // Scale the symbol to fit symbol area.
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = 0.5;
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);

      //push to parent
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
  }
  stage.addChild(reelContainer);

  // Build top & bottom covers and position reelContainer
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 5;
  reelContainer.y = margin;

  const bottom = new PIXI.Graphics();
  bottom.beginFill(0, 1);
  bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

  const spinButtonTexture = Texture.from("assets/BTN_Spin.png");
  const spinButton = new Sprite(spinButtonTexture);

  spinButton.position.set(700, 220);

  stage.addChild(spinButton);

  //Set the interactivity
  spinButton.interactive = true;
  spinButton.buttonMode = true;
  spinButton.addListener("pointerdown", () => {
    startPlay();
  });

  stage.addChild(message);

  moneyText.x = 10;
  moneyText.y = 260;
  stage.addChild(moneyText);

  let running = false;

  //Function to start playing.
  function startPlay() {
    money -= 5;
    moneyText.updateText(false);
    moneyText.text = money.toString();

    if (running) return;
    running = true;

    //for each i save target and then pass to r.symbols[counter]._texture.textureCacheIds[0];

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

      const extra = Number(Math.floor(Math.random() * 3));
      const target =
        Number(r.position) + extra + i + 2 * 2; /* + extra */ /*  + extra + i + 1 * 2; */ /* 0 + i * 5 + extra */

      reelsOffset[i] = extra + i + 2 * 2;
      const time = 500 + i * 600 + extra * 600;
      tweenTo(r, "position", target, time, easing(0.5), null, i === reels.length - 1 ? reelsComplete : null);
    }

    for (let i = 0; i < 3; i++) {
      for (let c = 0; c < reelsOffset[i]; c++) {
        reelsOffsetToReed[i]--;
        if (reelsOffsetToReed[i] == -1) {
          reelsOffsetToReed[i] = 3;
        }
      }
    }
  }

  //Reels done handler
  function reelsComplete() {
    running = false;
    counter = 2;
    checkResult();
    if (gameWin) {
      money += 10;
      moneyText.updateText(false);
      moneyText.text = money.toString();
      message.updateText(false);
      message.text = "Win";
      gameWin = false;
    }
  }

  app.ticker.add((delta) => {
    // Update the slots.

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      // r.blur.blurY = (r.position.y - r.previousPosition) * 8;
      r.previousPosition = Number(r.position);

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];

        const prevy = s.y; //prev position
        s.y = ((Number(r.position) + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
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
};

/* <-------------Where to tween -----------> */
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
    /*  && property == "assets/wild.png" */
    /* if (count[property] >= 2 ) {
      gameWin = true;
    } */
    if (count[property] > 2 && property != "assets/wild.png") {
      gameWin = true;
    }
  }
  console.log(count);
  console.log(gameWin);
}

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    const loader = PIXI.Loader.shared;
    loader.add("rabbit", "./assets/simpleSpriteSheet.json");

    app.loader.add([
      "assets/BG.png",
      "assets/BTN_Spin_d.png",
      "assets/BTN_Spin.png",
      "assets/wild.png",
      "assets/straw.png",
      "assets/pine.png",
      "assets/lemon.png",
      "assets/green.png",
      "assets/grape.png",
    ]);

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    stage.scale.x = window.innerWidth / gameWidth;
    stage.scale.y = window.innerHeight / gameHeight;
  };

  resize();

  window.addEventListener("resize", resize);
}

/* function getBird(): PIXI.AnimatedSprite {
    const bird = new PIXI.AnimatedSprite([
        PIXI.Texture.from("birdUp.png"),
        PIXI.Texture.from("birdMiddle.png"),
        PIXI.Texture.from("birdDown.png"),
    ]);

    bird.loop = true;
    bird.animationSpeed = 0.1;
    bird.play();
    bird.scale.set(3);

    return bird;
} */
