import * as PIXI from "pixi.js";

export default class Core {
  private _renderer: PIXI.Renderer;
  private _world: PIXI.Container;
  constructor() {
    this._renderer = PIXI.autoDetectRenderer({ width: 800, height: 800 });
    this._world = new PIXI.Container();
    document.body.appendChild(this._renderer.view);
    this.update();
  }
  /* update(): void {
    requestAnimationFrame(this.update);
    this._renderer.render(this._world);
  } */
  update = (): void => {
    requestAnimationFrame(this.update);
    this._renderer.render(this._world);
  };
}
