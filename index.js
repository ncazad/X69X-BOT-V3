const { spawn } = require("child_process");
const log = require("./logger/log.js");

let restartCount = 0;
let lastRestartTime = Date.now();
const BASE_DELAY = 3000;
const MAX_DELAY = 60000;

function getRestartDelay() {
  const delay = Math.min(BASE_DELAY * Math.pow(1.5, restartCount), MAX_DELAY);
  return Math.round(delay);
}

function startProject() {
  const now = Date.now();
  if (now - lastRestartTime > 10 * 60 * 1000) {
    restartCount = 0;
  }
  lastRestartTime = now;

  const child = spawn("node", ["azadx69x.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true,
    env: process.env
  });

  child.on("close", (code) => {
    if (code === 2) {
      restartCount = 0;
      log.info("INDEX", "Restarting bot (requested via restart command)");
      setTimeout(startProject, 3000);
    } else if (code !== 0) {
      restartCount++;
      const delay = getRestartDelay();
      log.info("INDEX", `Bot crashed (code ${code}). Restarting in ${delay}ms... (attempt ${restartCount})`);
      setTimeout(startProject, delay);
    } else {
      log.info("INDEX", "Bot shut down normally");
    }
  });

  child.on("error", (err) => {
    log.err("INDEX", "Failed to start azadx69x.js:", err.message);
    restartCount++;
    const delay = getRestartDelay();
    setTimeout(startProject, delay);
  });
}

startProject();
