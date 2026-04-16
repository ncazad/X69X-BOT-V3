const { createCanvas } = require("canvas");
const fs = require("fs");
const os = require("os");

module.exports = {
	config: {
		name: "up2",
		version: "0.0.7",
		author: "Azadx69x",
		countDown: 5,
		role: 0,
		description: {
			en: "bot dashboard panel"
		},
		category: "system"
	},

	onStart: async function ({ message, usersData, threadsData, api }) {

		const start = Date.now();
		
		const uptime = process.uptime();
		const days = Math.floor(uptime / 86400);
		const hours = Math.floor((uptime % 86400) / 3600);
		const minutes = Math.floor((uptime % 3600) / 60);
		const seconds = Math.floor(uptime % 60);
		const uptimeText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
		
		const totalUsers = (await usersData.getAll()).length;
		const totalThreads = (await threadsData.getAll()).length;
		const totalCommands = global.GoatBot.commands.size;
		
		const ramUsed = process.memoryUsage().rss / 1024 / 1024;
		const ramTotal = os.totalmem() / 1024 / 1024;
		const ramFree = os.freemem() / 1024 / 1024;
		const ramPercent = Math.min(Math.round((ramUsed / ramTotal) * 100), 100);
		const ramFreePercent = Math.round((ramFree / ramTotal) * 100);
		
		const cpuLoad = Math.min(Math.round(os.loadavg()[0] * 10) / 10, 100);
		const cpuCores = os.cpus().length;
		const cpu = os.cpus()[0].model;
		const cpuSpeed = os.cpus()[0].speed;
		
		const platform = os.platform();
		const arch = os.arch();
		const node = process.version;
		
		const networkInterfaces = os.networkInterfaces();
		let ipAddress = "N/A";
		for (const interfaceName in networkInterfaces) {
			const interfaces = networkInterfaces[interfaceName];
			for (const iface of interfaces) {
				if (iface.family === 'IPv4' && !iface.internal) {
					ipAddress = iface.address;
					break;
				}
			}
		}
		
		const ping = Date.now() - start;
		
		const botName = global.GoatBot.config.nickNameBot || "X69X BOT";
		const botPrefix = global.GoatBot.config.prefix;
		const botOwner = global.GoatBot.config.owner || "Azadx69x";
		const botLanguage = global.GoatBot.config.language || "en";
		const botAdmin = global.GoatBot.config.adminBot || [];
		
		const canvas = createCanvas(1200, 850);
		const ctx = canvas.getContext("2d");
		
		function roundRect(ctx, x, y, w, h, r) {
			if (w < 2 * r) r = w / 2;
			if (h < 2 * r) r = h / 2;
			ctx.beginPath();
			ctx.moveTo(x + r, y);
			ctx.lineTo(x + w - r, y);
			ctx.quadraticCurveTo(x + w, y, x + w, y + r);
			ctx.lineTo(x + w, y + h - r);
			ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
			ctx.lineTo(x + r, y + h);
			ctx.quadraticCurveTo(x, y + h, x, y + h - r);
			ctx.lineTo(x, y + r);
			ctx.quadraticCurveTo(x, y, x + r, y);
			ctx.closePath();
			return ctx;
		}
		
		const gradient = ctx.createLinearGradient(0, 0, 1200, 850);
		gradient.addColorStop(0, "#0f2027");
		gradient.addColorStop(0.5, "#203a43");
		gradient.addColorStop(1, "#2c5364");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 1200, 850);
		
		ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
		ctx.lineWidth = 2;
		for (let i = 0; i < 3; i++) {
			ctx.beginPath();
			ctx.arc(600, 400, 300 + i * 50, 0, Math.PI * 2);
			ctx.stroke();
		}
		
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = 20;
		ctx.shadowOffsetX = 5;
		ctx.shadowOffsetY = 5;
		
		ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.lineWidth = 2;
		roundRect(ctx, 30, 30, 1140, 790, 20);
		ctx.fill();
		ctx.stroke();
		
		ctx.shadowBlur = 0;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
		
		ctx.font = "bold 52px 'Arial Black'";
		ctx.textAlign = "center";
		ctx.fillStyle = "#ffffff";
		ctx.fillText("BOT DASHBOARD", 600, 90);
		
		ctx.font = "bold 28px 'Arial'";
		ctx.fillStyle = "#00d2ff";
		ctx.fillText(botName, 600, 145);
		
		function drawPremiumCard(x, y, title, value, color1, color2, percent) {
			const width = 220;
			const height = 130;
			
			ctx.shadowBlur = 15;
			ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
			ctx.shadowOffsetX = 3;
			ctx.shadowOffsetY = 3;
			
			const gradient = ctx.createLinearGradient(x - width/2, y - height/2, x + width/2, y + height/2);
			gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
			gradient.addColorStop(1, "rgba(255, 255, 255, 0.05)");
			
			ctx.fillStyle = gradient;
			roundRect(ctx, x - width/2, y - height/2, width, height, 15);
			ctx.fill();
			
			const borderGradient = ctx.createLinearGradient(x - width/2, y - height/2, x + width/2, y + height/2);
			borderGradient.addColorStop(0, color1);
			borderGradient.addColorStop(1, color2);
			
			ctx.strokeStyle = borderGradient;
			ctx.lineWidth = 2;
			ctx.stroke();
			
			ctx.font = "bold 16px 'Arial'";
			ctx.fillStyle = "#cccccc";
			ctx.textAlign = "center";
			ctx.fillText(title, x, y - 35);
			
			ctx.font = "bold 22px 'Arial'";
			ctx.fillStyle = "#ffffff";
			ctx.fillText(value, x, y);
			
			if (percent > 0) {
				ctx.shadowBlur = 0;
				ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
				roundRect(ctx, x - 70, y + 20, 140, 8, 4);
				ctx.fill();
				
				const progressGradient = ctx.createLinearGradient(x - 70, y + 20, x + 70, y + 28);
				progressGradient.addColorStop(0, color1);
				progressGradient.addColorStop(1, color2);
				
				ctx.fillStyle = progressGradient;
				roundRect(ctx, x - 70, y + 20, 140 * (percent / 100), 8, 4);
				ctx.fill();
				
				ctx.font = "bold 12px 'Arial'";
				ctx.fillStyle = color1;
				ctx.fillText(percent + "%", x + 80, y + 15);
			}

			ctx.shadowBlur = 0;
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 0;
			ctx.textAlign = "center";
		}
		
		drawPremiumCard(250, 230, "UPTIME", uptimeText, "#00b4db", "#0083b0", 0);
		drawPremiumCard(500, 230, "PING", ping + " ms", "#f7971e", "#ffd200", Math.min(ping, 100));
		drawPremiumCard(750, 230, "COMMANDS", totalCommands.toString(), "#11998e", "#38ef7d", 0);
		drawPremiumCard(1000, 230, "PREFIX", botPrefix, "#ee0979", "#ff6a00", 0);
		
		drawPremiumCard(375, 390, "USERS", totalUsers.toLocaleString(), "#4568DC", "#B06AB3", 0);
		drawPremiumCard(625, 390, "THREADS", totalThreads.toLocaleString(), "#834d9b", "#d04ed6", 0);
		drawPremiumCard(875, 390, "RAM USED", Math.round(ramUsed) + "MB", "#cb356b", "#bd3f32", ramPercent);
		
		drawPremiumCard(375, 550, "CPU LOAD", cpuLoad + "%", "#f12711", "#f5af19", cpuLoad);
		drawPremiumCard(625, 550, "RAM FREE", ramFreePercent + "%", "#56ab2f", "#a8e063", ramFreePercent);
		drawPremiumCard(875, 550, "CPU CORES", cpuCores + " Cores", "#304352", "#d7d2cc", 0);
		
		const bottomY = 640;
		const panelHeight = 160;
		
		ctx.shadowBlur = 20;
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		
		ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		roundRect(ctx, 40, bottomY, 1120, panelHeight, 15);
		ctx.fill();
		
		ctx.strokeStyle = "rgba(0, 210, 255, 0.3)";
		ctx.lineWidth = 2;
		ctx.stroke();
		
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.lineWidth = 1;
		roundRect(ctx, 42, bottomY + 2, 1116, panelHeight - 4, 13);
		ctx.stroke();

		ctx.shadowBlur = 0;
		ctx.textAlign = "left";
		
		ctx.font = "bold 15px 'Arial'";
		
		ctx.fillStyle = "#00d2ff";
		ctx.fillText("SYSTEM", 70, bottomY + 35);
		ctx.font = "bold 13px 'Courier New'";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(platform + " " + arch, 70, bottomY + 65);
		ctx.fillText("IP: " + ipAddress, 70, bottomY + 90);
		ctx.fillText("Node: " + node, 70, bottomY + 115);
		
		ctx.font = "bold 15px 'Arial'";
		ctx.fillStyle = "#ff8800";
		ctx.fillText("CPU", 320, bottomY + 35);
		ctx.font = "bold 13px 'Courier New'";
		ctx.fillStyle = "#ffffff";
		ctx.fillText(cpu.substring(0, 25) + "...", 320, bottomY + 65);
		ctx.fillText(cpuSpeed + " MHz", 320, bottomY + 90);
		ctx.fillText(cpuCores + " Cores", 320, bottomY + 115);
		
		ctx.font = "bold 15px 'Arial'";
		ctx.fillStyle = "#44ff44";
		ctx.fillText("RAM", 570, bottomY + 35);
		ctx.font = "bold 13px 'Courier New'";
		ctx.fillStyle = "#ffffff";
		ctx.fillText("Used: " + Math.round(ramUsed) + " MB", 570, bottomY + 65);
		ctx.fillText("Free: " + Math.round(ramFree) + " MB", 570, bottomY + 90);
		ctx.fillText("Total: " + Math.round(ramTotal) + " MB", 570, bottomY + 115);
		
		ctx.font = "bold 15px 'Arial'";
		ctx.fillStyle = "#ff66aa";
		ctx.fillText("BOT", 820, bottomY + 35);
		ctx.font = "bold 13px 'Courier New'";
		ctx.fillStyle = "#ffffff";
		ctx.fillText("Name: " + botName.substring(0, 15), 820, bottomY + 65);
		ctx.fillText("Owner: " + botOwner, 820, bottomY + 90);
		ctx.fillText("Admins: " + botAdmin.length, 820, bottomY + 115);
		
		ctx.font = "bold 15px 'Arial'";
		ctx.fillStyle = "#aa66ff";
		ctx.fillText("STATS", 1020, bottomY + 35);
		ctx.font = "bold 13px 'Courier New'";
		ctx.fillStyle = "#ffffff";
		ctx.fillText("Prefix: " + botPrefix, 1020, bottomY + 65);
		ctx.fillText("Language: " + botLanguage, 1020, bottomY + 90);
		ctx.fillText("Commands: " + totalCommands, 1020, bottomY + 115);
		
		ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
		ctx.lineWidth = 1;
		for (let i = 1; i < 5; i++) {
			ctx.beginPath();
			ctx.moveTo(40 + i * 224, bottomY + 15);
			ctx.lineTo(40 + i * 224, bottomY + panelHeight - 15);
			ctx.stroke();
		}
		
		ctx.font = "11px 'Arial'";
		ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
		ctx.textAlign = "center";
		ctx.fillText("", 600, bottomY + panelHeight - 10);
		
		const path = __dirname + `/up2_${Date.now()}.png`;
		fs.writeFileSync(path, canvas.toBuffer());
		
		const textMessage = 
		"╔═════════════════╗\n" +
		"║    🤖 BOT STATUS        \n" +
		"╠═════════════════╣\n" +
		"║ 🤖 Bot: " + botName.padEnd(18) + " \n" +
		"║ ⏳ Uptime: " + uptimeText.padEnd(15) + " \n" +
		"║ 👤 Users: " + totalUsers.toLocaleString().padEnd(15) + " \n" +
		"║ 💾 Threads: " + totalThreads.toLocaleString().padEnd(13) + " \n" +
		"║ 🗂️ Commands: " + totalCommands.toString().padEnd(12) + " \n" +
		"║ ⚡  Ping: " + (ping + "ms").padEnd(16) + " \n" +
		"║ 🚀 RAM: " + (Math.round(ramUsed) + "MB/" + Math.round(ramTotal) + "MB") + " \n" +
		"║ 📊 CPU: " + (cpuLoad + "%").padEnd(17) + " \n" +
		"║ 🤸‍♂️ Owner: " + botOwner.padEnd(15) + " \n" +
		"╚═════════════════╝";

		await message.reply({
			body: textMessage,
			attachment: fs.createReadStream(path)
		});

		fs.unlinkSync(path);
	}
};
