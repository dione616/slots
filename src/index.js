import * as PIXI from "pixi.js";
let ratio = 1;
let ancho;
let alto;

/* window.onresize = function (event) {
  resize();
}; */

function resize() {
  if (window.innerWidth / window.innerHeight >= ratio) {
    ancho = ~~(window.innerHeight * ratio);
    alto = window.innerHeight;

    app.view.style.position = "absolute";
    app.view.style.width = ancho + "px";
    app.view.style.height = alto + "px";
    //console.log("A");

    app.view.style.left = ~~((window.innerWidth - ancho) / 2) + "px";
    app.view.style.top = "0px";
  } else {
    ancho = window.innerWidth;
    alto = ~~(window.innerWidth / ratio);

    app.view.style.position = "absolute";
    app.view.style.width = ancho + "px";
    app.view.style.height = alto + "px";
    //console.log("B");
    app.view.style.left = 0 + "px";
    app.view.style.top = window.innerWidth - alto / 2 + "px";
  }
  //console.log(ancho,alto);
}

//Alliases
const Application = PIXI.Application;
const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;

const app = new Application({ width: 1200, autoResize: true });
document.body.appendChild(app.view);

app.loader
  .add([
    "assets/BG.png",
    "assets/BTN_Spin_d.png",
    "assets/BTN_Spin.png",
    "assets/wild.png",
    "assets/straw.png",
    "assets/pine.png",
    "assets/lemon.png",
    "assets/green.png",
    "assets/grape.png",
  ])
  .load(onAssetsLoaded);

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 150; /* 180 */
const reels = [];

/* <-------------Load reel, symbols and startListener -----------> */
function onAssetsLoaded() {
  /* resize(); */
  const background = Texture.from("assets/BG.png");
  let BG = new Sprite(background);
  BG.scale.set(1.25, 1);

  app.stage.addChild(BG);

  //Symbols textures
  const slotTextures = [
    Texture.from("assets/wild.png"),
    Texture.from("assets/straw.png"),
    Texture.from("assets/pine.png"),
    Texture.from("assets/lemon.png"),
    Texture.from("assets/green.png"),
    Texture.from("assets/grape.png"),
  ];

  //Build the reels

  const reelContainer = new Container();
  for (let i = 0; i < 3; i++) {
    const rc = new Container();
    rc.x = i * REEL_WIDTH + 290;
    reelContainer.addChild(rc);

    const reel = {
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
      let texture =
        slotTextures[Math.floor(Math.random() * slotTextures.length)];
      const symbol = new Sprite(texture);
      symbol.____ID = texture.textureCacheIds;

      // Scale the symbol to fit symbol area.
      symbol.y = j * SYMBOL_SIZE;
      symbol.scale.x = symbol.scale.y = Math.min(
        SYMBOL_SIZE / symbol.width,
        SYMBOL_SIZE / symbol.height
      );
      symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);

      //push to parent
      reel.symbols.push(symbol);
      rc.addChild(symbol);
    }
    reels.push(reel);
    console.log(rc);
  }
  app.stage.addChild(reelContainer);

  // Build top & bottom covers and position reelContainer
  const margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
  reelContainer.y = margin;

  const top = new PIXI.Graphics();
  top.beginFill(0, 1);
  top.drawRect(0, 0, app.screen.width, margin);
  const bottom = new PIXI.Graphics();
  bottom.beginFill(0, 1);
  bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, app.screen.width, margin);

  const spinButtonTexture = Texture.from("assets/BTN_Spin.png");
  const spinButton = new Sprite(spinButtonTexture);

  spinButton.position.set(app.stage.width - 120, 220);

  app.stage.addChild(spinButton);

  //Set the interactivity
  spinButton.interactive = true;
  spinButton.buttonMode = true;
  spinButton.addListener("pointerdown", () => {
    startPlay();
  });

  let running = false;

  //Function to start playing.
  function startPlay() {
    if (running) return;
    running = true;

    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];

      const extra = Math.floor(Math.random() * 3);
      const target = 1;
      const time = 1000 + i * 600 + extra * 600;

      //run tweeniing
      tweenTo(
        r,
        "position",
        target,
        time,
        easing(1),
        null,
        i === reels.length - 1 ? reelsComplete : null
      );

      console.log(`AllReels:`);
      console.log(reels);
    }
  }

  //Reels done handler
  function reelsComplete() {
    running = false;
  }

  app.ticker.add((delta) => {
    // Update the slots.
    for (let i = 0; i < reels.length; i++) {
      const r = reels[i];
      // Update blur filter y amount based on speed.
      // This would be better if calculated with time in mind also. Now blur depends on frame rate.
      r.blur.blurY = (r.position - r.previousPosition) * 8;
      r.previousPosition = r.position;

      // Update symbol positions on reel.
      for (let j = 0; j < r.symbols.length; j++) {
        const s = r.symbols[j];
        const prevy = s.y;
        s.y = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
        if (s.y < 0 && prevy > SYMBOL_SIZE) {
          // Detect going over and swap a texture.
          // This should in proper product be determined from some logical reel.
          s.texture =
            slotTextures[Math.floor(Math.random() * slotTextures.length)];
          s.scale.x = s.scale.y = Math.min(
            SYMBOL_SIZE / s.texture.width,
            SYMBOL_SIZE / s.texture.height
          );
          s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
        }
      }
    }
  });
}

/* <-------------Where to tween -----------> */
const tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
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

function easing(amount) {
  return (t) => --t * t * ((amount + 1) * t + amount) + 1;
}
