export class MySprite extends PIXI.Sprite {
  constructor(texture, id) {
    super(texture);
    this.id = id;
  }

  get id() {
    return this.id;
  }
}
