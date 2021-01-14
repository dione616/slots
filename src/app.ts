import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import { MySymbol } from "./symbol";
import "./style.css";

class Application {
  renderer;
  ticker;
  stage;
  loader: PIXI.Loader;
  world: PIXI.Container = new PIXI.Container();
  constructor() {
    this.renderer = new PIXI.Renderer({
      backgroundColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    document.body.appendChild(this.renderer.view);
    this.ticker = new PIXI.Ticker();
    this.stage = new PIXI.Container();

    this.ticker.add(this.render.bind(this), PIXI.UPDATE_PRIORITY.LOW);
    this.ticker.start();
    this.loader = new PIXI.Loader();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get screen() {
    return this.renderer.screen;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  render() {
    this.renderer.render(this.stage);
  }
}

export const app = ((global as any).app = new Application());
