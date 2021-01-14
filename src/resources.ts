import { app } from "./app";
import { World } from "./world";

const loader = new PIXI.Loader();

/* const app: any = global.window.app; */
/* global.window.app */
app.loader = loader;

//logic
const gameWidth = 800;
const gameHeight = 600;

loadGameAssets();

async function loadGameAssets(): Promise<void> {
  return new Promise(async (res, rej) => {
    const data = await fetch("http://localhost:8080/src/data/db.json")
      .then((resp) => resp.json())
      .then((data) => data);

    const loadingLine = new PIXI.Graphics();
    const style = new PIXI.TextStyle({
      fill: ["white", "white"],
    });
    const loadingText = new PIXI.Text("Loading...", style);

    app.loader.add(data);

    loader.onProgress.add((loader, res) => {
      loadingLine.beginFill(0x81db58, 1);
      loadingLine.drawRect(window.innerWidth / 3, window.innerHeight / 2 - 25, loader.progress * 10, 50);
      loadingText.position.set(window.innerWidth / 2 - 30, window.innerHeight / 2 - 20);

      app.stage.addChild(loadingLine);
      app.stage.addChild(loadingText);
    });

    loader.onComplete.add(() => {
      app.stage.removeChild(loadingLine);
      app.stage.removeChild(loadingText);
    });

    loader.onError.once(() => {
      rej();
    });

    loader.load(() => {
      resizeCanvas();
      res();
      const world = (app.world = new World());

      app.stage.addChild(world);
      world.populate();
    });
  });
}

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

function resizeCanvas(): void {
  const resize = () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    app.stage.scale.x = window.innerWidth / gameWidth;
    app.stage.scale.y = window.innerHeight / gameHeight;
  };

  resize();

  window.addEventListener("resize", resize);
}
