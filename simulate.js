import { GameSimulator } from "./simulator.js";
import fs from "fs";

const strategy = process.argv[2] || "balanced";
const sim = new GameSimulator(strategy);
const log = sim.run();

fs.writeFileSync("sim-output.log", log.join("\n"));
console.log(log.join("\n"));
