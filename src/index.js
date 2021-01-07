import * as PIXI from "pixi.js";
let ratio = 1;
let ancho;
let alto;

window.onresize = function (event) {
  resize();
};

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
const SYMBOL_SIZE = 150;

function onAssetsLoaded() {
  resize();
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
  const reels = [];
  const reelContainer = new Container();
  for (let i = 0; i < 3; i++) {
    const rc = new Container();
    rc.x = i * REEL_WIDTH + 290;
    reelContainer.addChild(rc);
  }
}
