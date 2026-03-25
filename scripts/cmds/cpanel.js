const os = require("os");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");
const si = require("systeminformation");
const GIFEncoder = require("gifencoder");

function getHostingName() {
  const env = process.env;

  if (env.RENDER) return "Render";
  if (env.RAILWAY_ENVIRONMENT) return "Railway";
  if (env.VERCEL) return "Vercel";
  if (env.REPL_ID) return "Replit";
  if (env.FLY_APP_NAME) return "Fly.io";
  if (env.AWS_EXECUTION_ENV) return "AWS";
  if (env.DYNO) return "Heroku";
  if (env.GITHUB_ACTIONS) return "GitHub Actions";

  return "VPS / Local";
}

module.exports = {
  config: {
    name: "cpanel",
    version: "0.0.7",
    author: "Azadx69x",
    category: "info",
    guide: { en: "{pn} - Shows bot Info Panel." }
  },

  onStart: async function ({ message }) {
    try {
      const [cpu, load, mem, osInfo] = await Promise.all([
        si.cpu(),
        si.currentLoad(),
        si.mem(),
        si.osInfo()
      ]);

      const uptime = process.uptime() * 1000;
      const uptimeFormatted = formatUptime(uptime);

      const bdTime = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Dhaka"
      });

      const canvasWidth = 900;
      const canvasHeight = 600;
      const outputPath = path.join(
        __dirname,
        "cache",
        `c_panel_${Date.now()}.gif`
      );

      await fs.ensureDir(path.dirname(outputPath));

      const encoder = new GIFEncoder(canvasWidth, canvasHeight);
      const gifStream = fs.createWriteStream(outputPath);
      encoder.createReadStream().pipe(gifStream);

      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(250);
      encoder.setQuality(15);

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");
      
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2 + 10;
      const radius = 210;
      
      const centerData = {
        value: "Azadx69x",
        radius: 100,
        hasLabel: false
      };

      const stats = [
        { label: "CORES", value: String(cpu.physicalCores) },
        { label: "THREADS", value: String(cpu.cores) },
        { label: "LOAD", value: `${load.currentLoad.toFixed(1)}%` },
        { label: "USER", value: `${load.currentLoadUser.toFixed(1)}%` },
        { label: "RAM", value: `${(mem.total / 1e9).toFixed(1)}GB` },
        { label: "FREE", value: `${(mem.available / 1e9).toFixed(1)}GB` },
        { label: "OS", value: osInfo.distro.split(' ')[0] },
        { label: "HOST", value: getHostingName() },
        { label: "NODE", value: process.version.replace('v', '') },
        { label: "UPTIME", value: uptimeFormatted }
      ];
      
      const circleRadius = 70;
      const maxTextWidth = circleRadius * 1.4;
      
      centerData.valueFont = fitFont(ctx, centerData.value, centerData.radius * 1.6, 26, true);
      
      const statCircles = stats.map((stat, idx) => {
        const angle = (Math.PI * 2 / stats.length) * idx - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        return {
          x, y,
          label: stat.label,
          value: stat.value,
          valueFont: fitFont(ctx, stat.value, maxTextWidth, 18, true),
          labelFont: fitFont(ctx, stat.label, maxTextWidth, 12, false)
        };
      });
      
      for (let i = 0; i < 5; i++) {
        const hue = (i * 72) % 360;
        const glowColor = `hsl(${hue}, 100%, 70%)`;
        
        ctx.fillStyle = "#0a0f1a";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("🤖 X69X BOT V3", 30, 40);

        ctx.font = "20px Arial";
        ctx.textAlign = "right";
        ctx.fillText(bdTime, canvasWidth - 30, 40);
        
        drawFixedCircle(ctx, centerX, centerY, centerData.radius, glowColor);
        drawCenterText(ctx, centerX, centerY, centerData, glowColor);
        
        statCircles.forEach(circle => {
          drawFixedCircle(ctx, circle.x, circle.y, circleRadius, glowColor);
          drawFixedText(ctx, circle.x, circle.y, circle, glowColor);
        });

        encoder.addFrame(ctx);
      }

      encoder.finish();
      await new Promise((res, rej) => {
        gifStream.on("finish", res);
        gifStream.on("error", rej);
      });

      await message.reply({
        attachment: fs.createReadStream(outputPath)
      });

      setTimeout(() => {
        fs.unlink(outputPath).catch(() => {});
      }, 5000);

    } catch (err) {
      console.error("Cpanel Error:", err);
      message.reply("❌ Failed to generate panel.");
    }
  }
};

function fitFont(ctx, text, maxWidth, baseSize, bold) {
  let size = baseSize;
  ctx.font = `${bold ? "bold " : ""}${size}px Arial`;
  
  while (ctx.measureText(text).width > maxWidth && size > 10) {
    size--;
    ctx.font = `${bold ? "bold " : ""}${size}px Arial`;
  }
  return `${bold ? "bold " : ""}${size}px Arial`;
}

function drawFixedCircle(ctx, x, y, radius, glowColor) {
  ctx.save();
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#111a25";
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

function drawCenterText(ctx, x, y, data, glowColor) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  ctx.font = data.valueFont;
  ctx.fillStyle = glowColor;
  ctx.fillText(data.value, x, y);
}

function drawFixedText(ctx, x, y, data, glowColor) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  ctx.font = data.valueFont;
  ctx.fillStyle = glowColor;
  ctx.fillText(data.value, x, y - 6);
  
  ctx.font = data.labelFont;
  ctx.fillStyle = "#cccccc";
  ctx.fillText(data.label, x, y + 10);
}

function formatUptime(ms) {
  if (ms <= 0) return "0s";
  let sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  sec %= 86400;
  const hours = Math.floor(sec / 3600);
  sec %= 3600;
  const minutes = Math.floor(sec / 60);
  const seconds = sec % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(" ");
}
