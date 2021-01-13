import { MySymbol } from "./Symbol";
import { app } from "./app";
import { World } from "./world";

const loader = new PIXI.Loader();

/* const app: any = global.window.app; */
/* global.window.app */
app.loader = loader;

//Symbols textures
export const slotTextures = [
  PIXI.Texture.from("assets/wild.png"),
  PIXI.Texture.from("assets/straw.png"),
  PIXI.Texture.from("assets/pine.png"),
  PIXI.Texture.from("assets/wild.png"),
  PIXI.Texture.from("assets/lemon.png"),
  PIXI.Texture.from("assets/green.png"),
  PIXI.Texture.from("assets/grape.png"),
];

loader.add([
  { name: "bg", url: "assets/BG.png" },
  { name: "spin_d", url: "assets/BTN_Spin_d.png" },
  { name: "spin", url: "assets/BTN_Spin.png" },
  { name: "wild", url: "assets/wild.png" },
  { name: "straw", url: "assets/straw.png" },
  { name: "pine", url: "assets/pine.png" },
  { name: "lemon", url: "assets/lemon.png" },
  { name: "green", url: "assets/green.png" },
  { name: "grape", url: "assets/grape.png" },
]);

/* loader.load((loader, res) => {}); */

const Texture = PIXI.Texture;
const Sprite = PIXI.Sprite;
const Container = PIXI.Container;
const TextStyle = PIXI.TextStyle;
const Text = PIXI.Text;
const Graphics = PIXI.Graphics;

//logic
const gameWidth = 800;
const gameHeight = 600;
/* 

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
const reelsOffsetToReed = [2, 2, 2]; */

async function loadGameAssets(): Promise<void> {
  return new Promise((res, rej) => {
    /* const loader = PIXI.Loader.shared; */

    app.loader.add([
      { name: "bg", url: "assets/BG.png" },
      { name: "spin_d", url: "assets/BTN_Spin_d.png" },
      { name: "spin", url: "assets/BTN_Spin.png" },
      { name: "wild", url: "assets/wild.png" },
      { name: "straw", url: "assets/straw.png" },
      { name: "pine", url: "assets/pine.png" },
      { name: "lemon", url: "assets/lemon.png" },
      { name: "green", url: "assets/green.png" },
      { name: "grape", url: "assets/grape.png" },
    ]);

    loader.onProgress.add((loader, res) => {
      console.log(loader.progress);
      console.log(res.texture);
    });

    loader.onComplete.once(() => {
      res();
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load();
  });
}

loader.load(() => {
  resizeCanvas();
});

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.scale.x = window.innerWidth / gameWidth;
    app.stage.scale.y = window.innerHeight / gameHeight;
  };

  resize();

  window.addEventListener("resize", resize);
}
