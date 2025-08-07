import { GameSimulator } from "./simulation.js";
import fs from "fs";

const strategy = process.argv[2] || "balanced";
const sim = new GameSimulator(strategy);
const log = sim.run(100, { timestamp: true });

if (Array.isArray(log)) {
  fs.writeFileSync("sim-output.log", log.map(l => JSON.stringify(l)).join("\n"));
  console.log(log);
}
