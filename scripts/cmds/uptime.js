const os = require("os");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports = {
  config: {
    name: "uptime",
    version: "0.0.7",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    shortDescription: "Advanced full system report",
    longDescription: "Everything: uptime, cpu, ram, disk, network, process, env",
    category: "system",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const start = Date.now();

    const format = (sec) => {
      const d = Math.floor(sec / 86400);
      const h = Math.floor((sec % 86400) / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      return `${d}d ${h}h ${m}m ${s}s`;
    };

    const botUptime = format(process.uptime());
    const sysUptime = format(os.uptime());

    const cpus = os.cpus();
    const cpuModel = cpus[0].model.trim();
    const cpuCores = cpus.length;
    const cpuSpeed = cpus[0].speed;

    const load = os.loadavg().map(v => v.toFixed(2));

    const toGB = (b) => (b / 1024 / 1024 / 1024).toFixed(2);
    const toMB = (b) => (b / 1024 / 1024).toFixed(0);

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

    const mem = process.memoryUsage();
    const heapPercent = ((mem.heapUsed / mem.heapTotal) * 100).toFixed(1);

    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    const hostname = os.hostname();
    const user = os.userInfo().username;

    const nets = os.networkInterfaces();
    let ip = "127.0.0.1";
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === "IPv4" && !net.internal) {
          ip = net.address;
          break;
        }
      }
      if (ip !== "127.0.0.1") break;
    }

    let diskInfo = { total: "N/A", used: "N/A", free: "N/A", percent: "N/A" };
    try {
      const stdout = execSync("df -h / | tail -1", { encoding: "utf8" });
      const parts = stdout.trim().split(/\s+/);
      if (parts.length >= 6) {
        diskInfo.total = parts[1];
        diskInfo.used = parts[2];
        diskInfo.free = parts[3];
        diskInfo.percent = parts[4];
      }
    } catch (e) {
      diskInfo.total = "Unavailable";
    }

    const nodeVersion = process.version;
    const pid = process.pid;
    const cwd = process.cwd();

    const latency = Date.now() - start;

    const msg = `⏱️  𝐔𝐏𝐓𝐈𝐌𝐄
├─ 𝐁𝐨𝐭: ${botUptime}
├─ 𝐒𝐲𝐬𝐭𝐞𝐦: ${sysUptime}
└─ 𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞: ${latency}𝐦𝐬

🖥️  𝐒𝐘𝐒𝐓𝐄𝐌
├─ 𝐎𝐒: ${platform} ${arch}
├─ 𝐑𝐞𝐥𝐞𝐚𝐬𝐞: ${release}
├─ 𝐇𝐨𝐬𝐭: ${hostname}
├─ 𝐔𝐬𝐞𝐫: ${user}
└─ 𝐈𝐏: ${ip}

⚙️  𝐂𝐏𝐔
├─ ${cpuModel}
├─ 𝐂𝐨𝐫𝐞𝐬: ${cpuCores} @ ${cpuSpeed}𝐌𝐇𝐳
└─ 𝐋𝐨𝐚𝐝: [${load[0]}] [${load[1]}] [${load[2]}]

💾 𝐌𝐄𝐌𝐎𝐑𝐘
├─ 𝐓𝐨𝐭𝐚𝐥: ${toGB(totalMem)} 𝐆𝐁
├─ 𝐔𝐬𝐞𝐝:  ${toGB(usedMem)} 𝐆𝐁 (${memPercent}%)
└─ 𝐅𝐫𝐞𝐞:  ${toGB(freeMem)} 𝐆𝐁

🧠 𝐏𝐑𝐎𝐂𝐄𝐒𝐒
├─ 𝐑𝐒𝐒: ${toMB(mem.rss)} 𝐌𝐁
├─ 𝐇𝐞𝐚𝐩: ${toMB(mem.heapUsed)}/${toMB(mem.heapTotal)} 𝐌𝐁 (${heapPercent}%)
└─ 𝐄𝐱𝐭𝐞𝐫𝐧𝐚𝐥: ${toMB(mem.external)} 𝐌𝐁

💿 𝐒𝐓𝐎𝐑𝐀𝐆𝐄
├─ 𝐓𝐨𝐭𝐚𝐥: ${diskInfo.total}
├─ 𝐔𝐬𝐞𝐝:  ${diskInfo.used} (${diskInfo.percent})
└─ 𝐅𝐫𝐞𝐞:  ${diskInfo.free}

🔧 𝐑𝐔𝐍𝐓𝐈𝐌𝐄
├─ 𝐍𝐨𝐝𝐞: ${nodeVersion}
├─ 𝐏𝐈𝐃: ${pid}
└─ 𝐏𝐚𝐭𝐡: ${cwd}`;

    return message.reply(msg);
  }
};
