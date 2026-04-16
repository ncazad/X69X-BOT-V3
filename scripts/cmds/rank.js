const { createCanvas, loadImage } = require("canvas");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

function roundRect(ctx, x, y, width, height, radius) {
    if (typeof radius === "number") {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
}

function formatNumber(num) {
    if (!num || isNaN(num)) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMoney(num) {
    if (!num || num === 0) return "0";
    if (num < 1000) return num.toString();
    const suffixes = ["", "K", "M", "B", "T"];
    const exp = Math.floor(Math.log(num) / Math.log(1000));
    const value = (num / Math.pow(1000, exp)).toFixed(2);
    return value.replace(/\.00$/, "") + suffixes[exp];
}

function expToLevel(exp) {
    if (!exp || exp <= 0) return 1;
    return Math.floor((Math.sqrt(8 * exp / 5 + 1) - 1) / 2) + 1;
}

function expForLevel(level) {
    if (level <= 1) return 0;
    return 5 * (level - 1) * level / 2;
}

function getLevelColor(level) {
    if (level >= 100) return { main: "#FF006E", light: "#FF4D9E" };
    if (level >= 50) return { main: "#FB5607", light: "#FF8C42" };
    if (level >= 30) return { main: "#FFBE0B", light: "#FFE66D" };
    if (level >= 10) return { main: "#8338EC", light: "#B56CFF" };
    return { main: "#3A86FF", light: "#70B8FF" };
}

function getRankColor(rank) {
    if (rank === 1) return "#FFD700";
    if (rank === 2) return "#C0C0C0";
    if (rank === 3) return "#CD7F32";
    if (rank <= 10) return "#FF6B6B";
    if (rank <= 100) return "#4ECDC4";
    return "#95A5A6";
}

async function loadAvatar(uid) {
    try {
        const fbUrls = [
            `https://graph.facebook.com/${uid}/picture?width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
            `https://graph.facebook.com/${uid}/picture?width=500&height=500`,
            `https://graph.facebook.com/${uid}/picture?type=large`
        ];

        for (const url of fbUrls) {
            try {
                const response = await axios.get(url, {
                    responseType: "arraybuffer",
                    timeout: 5000,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        Accept: "image/*"
                    }
                });
                if (response.status === 200 && response.data) {
                    return await loadImage(Buffer.from(response.data));
                }
            } catch (err) { continue; }
        }
    } catch (err) {
        console.log("Avatar load failed");
    }
    return null;
}

function createDefaultAvatar(name, color) {
    const canvas = createCanvas(300, 300);
    const c = canvas.getContext("2d");

    c.fillStyle = color.main;
    c.fillRect(0, 0, 300, 300);

    c.fillStyle = color.light;
    c.beginPath();
    c.arc(150, 150, 120, 0, Math.PI * 2);
    c.fill();

    const initial = name ? name.charAt(0).toUpperCase() : "?";
    c.fillStyle = "#ffffff";
    c.font = "bold 140px Arial";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(initial, 150, 150);

    return canvas;
}

module.exports = {
    config: {
        name: "rank",
        version: "0.0.7",
        author: "Azadx69x",
        countDown: 5,
        shortDescription: { en: "Rank card" },
        longDescription: { en: "Profile card with your info" },
        category: "rank"
    },

    onStart: async function ({ event, message, usersData, args, api, threadsData }) {
        try {
            let targetUID;
            if (Object.keys(event.mentions).length > 0) targetUID = Object.keys(event.mentions)[0];
            else if (args[0] && /^\d+$/.test(args[0])) targetUID = args[0];
            else if (event.messageReply) targetUID = event.messageReply.senderID;
            else targetUID = event.senderID;

            const userData = await usersData.get(targetUID);
            const allUsers = await usersData.getAll();

            let messages = 0;
            try {
                const threadData = await threadsData.get(event.threadID);
                if (threadData && threadData.members) {
                    const memberData = threadData.members.find((m) => m.userID === targetUID);
                    if (memberData) {
                        messages = parseInt(memberData.count) || parseInt(memberData.messageCount) || parseInt(memberData.messages) || 0;
                    }
                }
                if (messages === 0 && threadData && threadData.data) {
                    const memberData = threadData.data.find((m) => m.id === targetUID || m.userID === targetUID);
                    if (memberData) {
                        messages = parseInt(memberData.count) || parseInt(memberData.messageCount) || 0;
                    }
                }
            } catch (err) {
                console.log("Message count error:", err.message);
            }
            if (messages === 0) {
                messages = parseInt(userData.messages) || parseInt(userData.messageCount) || parseInt(userData.msgCount) || 0;
            }

            let name = userData.name || "Unknown";
            let username = "@user";
            try {
                const info = (await api.getUserInfo(targetUID))[targetUID];
                if (info) {
                    name = info.name || name;
                    username = info.vanity ? `@${info.vanity}` : info.alternateName || name;
                }
            } catch {}

            let gender = "Unknown";
            let genderColor = "#95A5A6";
            if (userData.gender !== undefined) {
                const g = String(userData.gender).toLowerCase();
                if (g === "female" || g === "f" || g === "1") { gender = "Female"; genderColor = "#FF69B4"; }
                else if (g === "male" || g === "m" || g === "2") { gender = "Male"; genderColor = "#4169E1"; }
            }

            const exp = parseInt(userData.exp) || 0;
            const money = parseInt(userData.money) || 0;
            const level = expToLevel(exp);
            const levelColor = getLevelColor(level);

            const expSorted = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0));
            const expRank = expSorted.findIndex((u) => String(u.userID) === String(targetUID)) + 1;

            const moneySorted = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0));
            const moneyRank = moneySorted.findIndex((u) => String(u.userID) === String(targetUID)) + 1;

            const vipList = (
                global.GoatBot?.config?.vipuser ||
                global.GoatBot?.config?.vipUser ||
                global.GoatBot?.config?.vip ||
                []
            ).map(String);
            const isVIP = vipList.includes(String(targetUID));

            let commandsUsed = 0;
            const possibleFields = ['commandUsed', 'commandCount', 'cmdCount', 'cmdUsed', 'commands', 'usage', 'command', 'count', 'allTime'];
            for (const field of possibleFields) {
                if (userData[field] !== undefined && userData[field] !== null) {
                    const val = parseInt(userData[field]);
                    if (!isNaN(val) && val > 0) {
                        commandsUsed = val;
                        break;
                    }
                }
            }
            
            const expStartCurrentLevel = expForLevel(level);
            
            const expStartNextLevel = expForLevel(level + 1);
            
            const expNeededToLevelUp = expStartNextLevel - expStartCurrentLevel;
            
            const expProgressInLevel = exp - expStartCurrentLevel;
            
            let progressPercent = 0;
            if (expNeededToLevelUp > 0) {
                progressPercent = (expProgressInLevel / expNeededToLevelUp) * 100;
                progressPercent = Math.max(0, Math.min(100, progressPercent));
            } else {
                progressPercent = 100;
            }
            
            console.log(`🎯 EXP: ${exp} | Level: ${level} | ${expProgressInLevel}/${expNeededToLevelUp} = ${progressPercent.toFixed(1)}%`);

            let avatar;
            try {
                avatar = await loadAvatar(targetUID);
            } catch (avatarErr) {
                avatar = createDefaultAvatar(name, levelColor);
            }

            const width = 1200;
            const height = 700;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext("2d");

            const bgGrad = ctx.createLinearGradient(0, 0, width, height);
            bgGrad.addColorStop(0, "#1a1a2e");
            bgGrad.addColorStop(1, "#16213e");
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "rgba(255,255,255,0.03)";
            roundRect(ctx, 40, 40, 1120, 620, 25);
            ctx.fill();
            
            ctx.strokeStyle = levelColor.main;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.8;
            roundRect(ctx, 40, 40, 1120, 620, 25);
            ctx.stroke();
            ctx.globalAlpha = 1;

            const leftX = 60;
            const leftY = 60;
            const leftW = 380;
            const leftH = 580;
            
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            roundRect(ctx, leftX, leftY, leftW, leftH, 20);
            ctx.fill();

            const avatarX = leftX + leftW/2;
            const avatarY = leftY + 130;
            
            ctx.fillStyle = levelColor.main;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, 105, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, 95, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, avatarX - 95, avatarY - 95, 190, 190);
            ctx.restore();

            ctx.strokeStyle = levelColor.main;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(avatarX, avatarY, 97, 0, Math.PI * 2);
            ctx.stroke();

            const badgeY = avatarY + 85;
            ctx.fillStyle = levelColor.main;
            ctx.beginPath();
            ctx.arc(avatarX, badgeY, 30, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`LV.${level}`, avatarX, badgeY);

            const nameY = leftY + 260;
            ctx.fillStyle = "#fff";
            ctx.font = "bold 26px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const displayName = name.length > 18 ? name.substring(0, 18) + "..." : name;
            ctx.fillText(displayName, avatarX, nameY);
            
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.font = "15px Arial";
            ctx.fillText(username, avatarX, nameY + 32);

            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.font = "12px monospace";
            ctx.fillText(`ID: ${targetUID}`, avatarX, nameY + 55);

            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(leftX + 30, leftY + 340);
            ctx.lineTo(leftX + leftW - 30, leftY + 340);
            ctx.stroke();

            const infoStartY = leftY + 370;
            const lineHeight = 45;
            
            const infos = [
                { label: "Gender", value: gender, color: genderColor },
                { label: "Messages", value: formatNumber(messages), color: "#fff" },
                { label: "Joined", value: moment(userData.createdAt || Date.now()).format("DD/MM/YYYY"), color: "#aaa" }
            ];

            infos.forEach((info, i) => {
                const y = infoStartY + (i * lineHeight);
                
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.font = "14px Arial";
                ctx.fillText(info.label, leftX + 40, y);
                
                ctx.textAlign = "right";
                ctx.fillStyle = info.color;
                ctx.font = "bold 16px Arial";
                ctx.fillText(info.value, leftX + leftW - 40, y);
            });

            const rightX = 470;
            const rightY = 60;
            const rightW = 670;
            
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 30px Arial";
            ctx.fillText("STATISTICS", rightX, rightY);
            
            ctx.strokeStyle = levelColor.main;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(rightX, rightY + 35);
            ctx.lineTo(rightX + 140, rightY + 35);
            ctx.stroke();

            const gridStartY = rightY + 60;
            const boxW = 310;
            const boxH = 90;
            const colGap = 40;
            const rowGap = 20;
            
            const stats = [
                { label: "EXP RANK", value: expRank ? `#${expRank}` : "--", sub: formatNumber(exp) + " EXP", color: getRankColor(expRank) },
                { label: "MONEY RANK", value: moneyRank ? `#${moneyRank}` : "--", sub: "$" + formatMoney(money), color: getRankColor(moneyRank) },
                { label: "COMMANDS", value: formatNumber(commandsUsed), sub: "Total Used", color: "#00D9FF" },
                { label: "VIP STATUS", value: isVIP ? "ACTIVE" : "NORMAL", sub: isVIP ? "Premium" : "Regular", color: isVIP ? "#FFD700" : "#9E9E9E" }
            ];

            stats.forEach((stat, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = rightX + (col * (boxW + colGap));
                const y = gridStartY + (row * (boxH + rowGap));

                ctx.fillStyle = "rgba(255,255,255,0.05)";
                roundRect(ctx, x, y, boxW, boxH, 12);
                ctx.fill();

                ctx.strokeStyle = stat.color;
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.6;
                roundRect(ctx, x, y, boxW, boxH, 12);
                ctx.stroke();
                ctx.globalAlpha = 1;

                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                ctx.fillStyle = "rgba(255,255,255,0.5)";
                ctx.font = "12px Arial";
                ctx.fillText(stat.label, x + 15, y + 12);

                ctx.textAlign = "right";
                ctx.textBaseline = "middle";
                ctx.fillStyle = stat.color;
                ctx.font = "bold 28px Arial";
                ctx.fillText(stat.value, x + boxW - 15, y + boxH/2);

                ctx.textAlign = "left";
                ctx.textBaseline = "bottom";
                ctx.fillStyle = "rgba(255,255,255,0.4)";
                ctx.font = "11px Arial";
                ctx.fillText(stat.sub, x + 15, y + boxH - 10);
            });
            
            const progY = gridStartY + 220;
            
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#fff";
            ctx.font = "bold 20px Arial";
            ctx.fillText("LEVEL PROGRESS", rightX, progY);

            const barY = progY + 35;
            const barH = 30;
            
            ctx.fillStyle = "rgba(255,255,255,0.1)";
            roundRect(ctx, rightX, barY, rightW, barH, 15);
            ctx.fill();
            
            const barFill = (rightW * progressPercent) / 100;
            if (barFill > 0) {
                ctx.fillStyle = levelColor.main;
                roundRect(ctx, rightX, barY, barFill, barH, 15);
                ctx.fill();
            }
            
            ctx.fillStyle = "#fff";
            ctx.font = "bold 13px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(`${Math.floor(progressPercent)}%  |  ${formatNumber(expProgressInLevel)} / ${formatNumber(expNeededToLevelUp)} EXP`, rightX + rightW/2, barY + barH/2);
            
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.font = "12px Arial";
            ctx.fillText(`Level ${level}`, rightX, barY + barH + 8);
            
            ctx.textAlign = "right";
            ctx.fillText(`Level ${level + 1}`, rightX + rightW, barY + barH + 8);

            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.font = "11px Arial";
            ctx.fillText(`Generated by X69X BOT • ${moment().format("DD MMM YYYY, HH:mm")}`, width/2, height - 15);

            const tmpPath = path.join(__dirname, "tmp");
            if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath, { recursive: true });
            const imagePath = path.join(tmpPath, `rank_${targetUID}_${Date.now()}.png`);

            fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

            const vipEmoji = isVIP ? "👑" : "👤";
            const expRankStr = expRank ? `#${expRank}` : "N/A";
            const moneyRankStr = moneyRank ? `#${moneyRank}` : "N/A";
            
            await message.reply({
                body: `${vipEmoji} ${name}\n⭐ Level: ${level} | 💰 $${formatMoney(money)}\n📊 EXP Rank: ${expRankStr} | 💵 Money Rank: ${moneyRankStr}\n⚡ EXP: ${formatNumber(exp)} | 🔄 Commands: ${formatNumber(commandsUsed)}`,
                attachment: fs.createReadStream(imagePath)
            });

            setTimeout(() => { try { fs.unlinkSync(imagePath); } catch {} }, 15000);

        } catch (err) {
            console.error("Rank error:", err);
            await message.reply(`❌ Error: ${err.message}`);
        }
    }
};
