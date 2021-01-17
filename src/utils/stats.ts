import * as PIXI from "pixi.js";

const TextStyle = PIXI.TextStyle;
const Text = PIXI.Text;

export interface TweenType {
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

export const statsStyle = new TextStyle({
  fontFamily: "Arial",
  fontSize: 20,
});
// eslint-disable-next-line prefer-const
export let money = 100;
export const changeGameMoney = (increase: boolean): void => {
  money = increase ? money + 10 : money - 5;
};
export let wins = 0;
export const changeGameWinsCounter = (): void => {
  wins++;
};

export const moneyText = new Text("Money:$" + money, statsStyle);
export const winsText = new Text("Win: " + wins, statsStyle);

export const reelsOffset: number[] = [];
export const reelsOffsetToReed = [1, 1, 1];

export const slotTextures: PIXI.Texture[] = [];

export const resultArray: string[] = [];

export let gameWin = false;
export const changeGameResult = (res: boolean): void => {
  gameWin = res;
};

export const style = new TextStyle({
  fontFamily: "Arial",
  fontSize: 36,
  fill: ["white", "white"],
});
export const message = new Text(gameWin ? "Win" : "", style);
