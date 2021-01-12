import * as PIXI from "pixi.js";
window.PIXI = PIXI;
import { MySymbol } from "./symbol";
import "./style.css";

class Application {
  public renderer;
  public ticker;
  public stage;
  public loader: PIXI.Loader;
  constructor() {
    this.renderer = new PIXI.Renderer({ backgroundColor: 0x2f6a38, width: 800, height: 600 });
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

//declare global
/* declare global {
  namespace NodeJS {
    interface Global {
       document: Document;
       window: any;
       navigator: Navigator;
  }
} */

export const app = ((global as any).app = new Application());
/* console.log(global); */

export default Application;
