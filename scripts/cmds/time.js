const { createCanvas } = require('canvas');
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "time",
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Show current time",
    longDescription: "Generates image with current time and date",
    category: "utility",
    guide: "{pn} time"
  },

  onStart: async function ({ message, event, api }) {
    try {
      const now = new Date();
      const bangladeshTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
      
      const timeString = bangladeshTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
      
      const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const englishDay = weekDays[bangladeshTime.getDay()];
      
      const englishMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      const date = bangladeshTime.getDate();
      const month = englishMonths[bangladeshTime.getMonth()];
      const year = bangladeshTime.getFullYear();
      const englishDate = `${date} ${month}, ${year}`;
      
      const canvas = createCanvas(1920, 1080);
      const ctx = canvas.getContext("2d");
      
      const gradient = ctx.createLinearGradient(0, 0, 1920, 1080);
      gradient.addColorStop(0, "#1a1a2e");
      gradient.addColorStop(0.5, "#16213e");
      gradient.addColorStop(1, "#0f3460");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1920, 1080);
      
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.arc(200 + i * 30, 800 + i * 10, 100, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.rect(300, 200, 1320, 680);
      ctx.fill();
      ctx.stroke();
      
      ctx.shadowBlur = 15;
      ctx.textAlign = "center";
      
      ctx.font = "40px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText("BANGLADESH TIME", 960, 280);
      
      ctx.font = "bold 200px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(timeString, 960, 500);
      
      ctx.font = "bold 60px Arial";
      ctx.fillStyle = "#87CEEB";
      ctx.fillText(englishDay, 960, 600);
      
      ctx.font = "50px Arial";
      ctx.fillStyle = "#D3D3D3";
      ctx.fillText(englishDate, 960, 680);
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(760, 720);
      ctx.lineTo(1160, 720);
      ctx.stroke();
      
      ctx.font = "35px Arial";
      ctx.fillStyle = "#98FB98";
      ctx.fillText("Dhaka, Bangladesh", 960, 780);
      
      ctx.font = "30px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText("chudling pong", 960, 850);
      
      ctx.font = "25px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillText("• • •", 960, 950);

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
      
      const cacheDir = path.join(__dirname, "cache");
      fs.ensureDirSync(cacheDir);
      const outputPath = path.join(cacheDir, `time_${Date.now()}.png`);
      
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputPath, buffer);
      
      await message.reply({
        attachment: fs.createReadStream(outputPath)
      });
      
      setTimeout(() => {
        try {
          if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
          }
        } catch (e) {}
      }, 5000);

    } catch (err) {
      console.error("Time command error:", err);
      await message.reply("Error generating time image!\n" + err.message);
    }
  }
};
