const { findUid } = global.utils;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const axios = require("axios");

const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
	config: {
		name: "uid",
		version: "0.0.7",
		author: "Azadx69x",
		countDown: 3,
		role: 0,
		description: {
			en: "Facebook UID Card"
		},
		category: "info"
	},

	onStart: async function ({ message, event, args, usersData }) {

		let uid = "";
		let userName = "";
	    
		if (event.messageReply) {
			uid = event.messageReply.senderID;
			userName = (await usersData.get(uid))?.name || "Facebook User";
		}
	    
		else if (!args[0]) {
			uid = event.senderID;
			userName = (await usersData.get(uid))?.name || "Facebook User";
		}
	    
		else if (args[0].match(regExCheckURL)) {
			try {
				uid = await findUid(args[0]);
				userName = (await usersData.get(uid))?.name || "Facebook User";
			} catch {
				return message.reply("❌ Cannot find UID from link");
			}
		}
	    
		else {
			const { mentions } = event;
			for (const id in mentions) {
				uid = id;
				userName = mentions[id].replace("@", "");
			}
		}

		if (!uid) return message.reply("❌ UID not found");
	    
		let avatar;
		try {
			const avatarUrls = [
				`https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, // With access token
				`https://graph.facebook.com/v12.0/${uid}/picture?width=512&height=512`,
				`https://graph.facebook.com/${uid}/picture?type=large&width=512&height=512`,
				`https://api.zahwazein.xyz/facebook/pp?url=${uid}`,
				`https://api.dhtutt.com/facebook/profile?uid=${uid}`,
				`https://www.facebook.com/${uid}/picture?width=512&height=512`
			];

			let avatarBuffer = null;
			for (const url of avatarUrls) {
				try {
					const res = await axios({
						url,
						method: "GET",
						responseType: "arraybuffer",
						timeout: 5000,
						headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
						}
					});
					
					if (res.status === 200) {
						avatarBuffer = Buffer.from(res.data, "binary");
						break;
					}
				} catch (e) {
					continue;
				}
			}

			if (avatarBuffer) {
				avatar = await loadImage(avatarBuffer);
			} else {
				const cdnUrl = `https://scontent.fcgp3-1.fna.fbcdn.net/v/t1.30497-1/cp0/c15.0.50.50a/p50x50/${uid}_${Date.now()}_n.jpg`;
				try {
					const res = await axios({
						url: cdnUrl,
						method: "GET",
						responseType: "arraybuffer",
						timeout: 3000
					});
					avatar = await loadImage(Buffer.from(res.data, "binary"));
				} catch {
					avatar = null;
				}
			}

		} catch (err) {
			console.log("Avatar load error:", err.message);
			avatar = null;
		}

		const canvas = createCanvas(1000, 500);
		const ctx = canvas.getContext("2d");
	    
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, "#0f0c29");
		gradient.addColorStop(0.5, "#302b63");
		gradient.addColorStop(1, "#24243e");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	    
		ctx.save();
	    
		for (let i = 0; i < 20; i++) {
			ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.1})`;
			ctx.beginPath();
			ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 5, 0, Math.PI * 2);
			ctx.fill();
		}
	    
		ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
		ctx.lineWidth = 1;
		for (let i = -canvas.height; i < canvas.width; i += 40) {
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i + canvas.height, canvas.height);
			ctx.stroke();
		}

		ctx.restore();
	    
		ctx.save();
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
		ctx.shadowBlur = 20;
		ctx.shadowOffsetY = 5;
		
		ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
		ctx.roundRect(40, 40, 920, 420, 30);
		ctx.fill();
		
		ctx.restore();
	    
		ctx.save();
		ctx.strokeStyle = "#6366f1";
		ctx.lineWidth = 3;
		ctx.shadowColor = "#818cf8";
		ctx.shadowBlur = 15;
		ctx.roundRect(40, 40, 920, 420, 30);
		ctx.stroke();
		ctx.restore();
	    
		const titleGradient = ctx.createLinearGradient(300, 80, 700, 80);
		titleGradient.addColorStop(0, "#818cf8");
		titleGradient.addColorStop(0.5, "#c084fc");
		titleGradient.addColorStop(1, "#e879f9");
		ctx.fillStyle = titleGradient;
		ctx.font = "bold 42px 'Arial', 'Sans'";
		ctx.shadowColor = "#c084fc";
		ctx.shadowBlur = 15;
		ctx.fillText("UID CARD", 370, 110);
		ctx.shadowBlur = 0;
	    
		ctx.save();
		ctx.shadowColor = "#818cf8";
		ctx.shadowBlur = 20;
		ctx.beginPath();
		ctx.arc(220, 260, 115, 0, Math.PI * 2);
		ctx.strokeStyle = "#818cf8";
		ctx.lineWidth = 4;
		ctx.stroke();
		ctx.restore();
	    
		ctx.save();
		ctx.beginPath();
		ctx.arc(220, 260, 110, 0, Math.PI * 2);
		ctx.closePath();
		ctx.clip();

		if (avatar) {
			ctx.drawImage(avatar, 110, 150, 220, 220);
		    
			ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			ctx.fillRect(110, 150, 220, 220);
		} else {
			const avatarGradient = ctx.createRadialGradient(220, 260, 0, 220, 260, 110);
			avatarGradient.addColorStop(0, "#4f46e5");
			avatarGradient.addColorStop(0.5, "#7c3aed");
			avatarGradient.addColorStop(1, "#a855f7");
			ctx.fillStyle = avatarGradient;
			ctx.fillRect(110, 150, 220, 220);
		    
			ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
			for (let i = 0; i < 10; i++) {
				ctx.beginPath();
				ctx.arc(220 + Math.random() * 80 - 40, 260 + Math.random() * 80 - 40, Math.random() * 10, 0, Math.PI * 2);
				ctx.fill();
			}
		    
			ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
			ctx.font = "60px 'Arial'";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText("👤", 220, 260);
		    
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.font = "14px 'Arial'";
			ctx.fillText("No Photo", 220, 320);
		}
		ctx.restore();
	    
		ctx.save();
		ctx.shadowColor = "#818cf8";
		ctx.shadowBlur = 15;
		ctx.strokeStyle = "#c084fc";
		ctx.lineWidth = 6;
		ctx.beginPath();
		ctx.arc(220, 260, 115, 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();
	    
		ctx.save();
		ctx.shadowColor = "#818cf8";
		ctx.shadowBlur = 10;
		ctx.strokeStyle = "#818cf8";
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(300, 130);
		ctx.lineTo(700, 130);
		ctx.stroke();
		ctx.restore();
	    
		ctx.fillStyle = "#94a3b8";
		ctx.font = "18px 'Arial'";
		ctx.fillText("NAME", 420, 190);

		ctx.fillStyle = "#f8fafc";
		ctx.font = "bold 34px 'Arial', 'Sans'";
		ctx.shadowColor = "#818cf8";
		ctx.shadowBlur = 10;
		ctx.fillText(userName.length > 18 ? userName.substring(0, 16) + "..." : userName, 420, 240);
		ctx.shadowBlur = 0;
	    
		ctx.fillStyle = "#94a3b8";
		ctx.font = "18px 'Arial'";
		ctx.fillText("USER ID", 420, 300);
	    
		const uidGradient = ctx.createLinearGradient(420, 340, 720, 340);
		uidGradient.addColorStop(0, "#a78bfa");
		uidGradient.addColorStop(1, "#f472b6");
		ctx.fillStyle = uidGradient;
		ctx.font = "bold 32px 'Courier New', monospace";
		ctx.shadowColor = "#a78bfa";
		ctx.shadowBlur = 10;
		ctx.fillText(uid, 420, 350);
		ctx.shadowBlur = 0;
	    
		ctx.save();
		ctx.strokeStyle = "rgba(129, 140, 248, 0.3)";
		ctx.lineWidth = 2;
		for (let i = 0; i < 3; i++) {
			ctx.strokeRect(800 + i*30, 350 + i*20, 25, 25);
		}
		ctx.restore();
	    
		ctx.fillStyle = "rgba(148, 163, 184, 0.5)";
		ctx.font = "14px 'Arial'";
		ctx.textAlign = "right";
		ctx.fillText("Chudling pong", 920, 440);

		const path = __dirname + `/uid_${Date.now()}.png`;
		fs.writeFileSync(path, canvas.toBuffer());

		return message.reply({
			body: `🆔 UID: ${uid}`,
			attachment: fs.createReadStream(path)
		});
	}
};
