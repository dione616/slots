import "./app";
import "./resources";
import "./style.css";
import "./world";
import { app } from "./app";
import { World } from "./world";

const world = (app.world = new World());

world.populate();
app.stage.addChild(world);
