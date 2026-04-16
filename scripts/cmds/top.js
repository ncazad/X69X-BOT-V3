const fs = require("fs");
const path = require("path");
const moment = require("moment-timezone");
const { createCanvas, loadImage, registerFont } = require("canvas");
const axios = require("axios");

try {
    registerFont('./fonts/Poppins-Bold.ttf', { family: 'Poppins', weight: 'bold' });
    registerFont('./fonts/Poppins-Regular.ttf', { family: 'Poppins', weight: 'normal' });
    registerFont('./fonts/Orbitron-Bold.ttf', { family: 'Orbitron', weight: 'bold' });
} catch (e) {
}

function formatMoney(value) {
    value = Number(value);
    if (isNaN(value)) return "0";
    if (value >= 1e15) return (value / 1e15).toFixed(2) + "Q";
    if (value >= 1e12) return (value / 1e12).toFixed(2) + "T";
    if (value >= 1e9) return (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(2) + "M";
    if (value >= 1e3) return (value / 1e3).toFixed(2) + "K";
    return value.toString();
}

const avatarCache = new Map();
async function fetchAvatar(userID, usersData) {
    if (avatarCache.has(userID)) return avatarCache.get(userID);

    try {
        let avatarURL = await usersData.getAvatarUrl(userID);
        if (!avatarURL) {
            avatarURL = `https://graph.facebook.com/${userID}/picture?type=large&width=500&height=500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
        }
        const res = await axios.get(avatarURL, { 
            responseType: "arraybuffer", 
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const image = await loadImage(Buffer.from(res.data));
        avatarCache.set(userID, image);
        return image;
    } catch (e) {
        const canvas = createCanvas(200, 200);
        const ctx = canvas.getContext("2d");
        
        const hue = userID ? userID.split('').reduce((a,b)=>a+b.charCodeAt(0),0) % 360 : 200;
        const gradient = ctx.createLinearGradient(0, 0, 200, 200);
        gradient.addColorStop(0, `hsl(${hue}, 80%, 60%)`);
        gradient.addColorStop(1, `hsl(${hue + 40}, 80%, 40%)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);
        
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(0, 0, 200, 100);
        
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "#fff";
        ctx.font = "bold 90px 'Poppins', Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const firstLetter = userID ? userID[0] : "U";
        ctx.fillText(firstLetter.toUpperCase(), 100, 100);
        
        avatarCache.set(userID, canvas);
        return canvas;
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function drawTopBoard(users, usersData) {
    const W = 1200, H = 1600;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    try {
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, "#0a0a0f");
        bg.addColorStop(0.3, "#1a1a2e");
        bg.addColorStop(0.7, "#16213e");
        bg.addColorStop(1, "#0f0f1a");
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Animated-style particles with glow - reduced count
        for (let i = 0; i < 150; i++) {
            const x = Math.random() * W;
            const y = Math.random() * H;
            const size = Math.random() * 3;
            const opacity = Math.random() * 0.5;
            const hue = Math.random() > 0.5 ? 200 : 280;
            
            ctx.shadowColor = `hsla(${hue}, 100%, 70%, ${opacity})`;
            ctx.shadowBlur = 10;
            ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${opacity})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Top decorative line with glow
        const lineGrad = ctx.createLinearGradient(0, 0, W, 0);
        lineGrad.addColorStop(0, "transparent");
        lineGrad.addColorStop(0.2, "#00d4ff");
        lineGrad.addColorStop(0.5, "#ff00ff");
        lineGrad.addColorStop(0.8, "#00d4ff");
        lineGrad.addColorStop(1, "transparent");
        
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 20;
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.lineTo(W - 100, 100);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Title - smaller and higher
        ctx.save();
        ctx.shadowColor = "#ff00ff";
        ctx.shadowBlur = 30;
        ctx.font = "bold 60px 'Orbitron', 'Arial', sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("TOP 15 RICHEST USERS", W/2, 65);
        
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 60;
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("TOP 15 RICHEST USERS", W/2, 65);
        ctx.restore();

        // Subtitle - smaller
        ctx.font = "italic 24px 'Poppins', Arial";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("Elite Billionaires Club", W/2, 95);

        // Top 3 positions - COMPACT
        const positions = [
            { x: W/2 - 80, y: 130, size: 160, color: "#ffd700", glow: "#ffaa00", rank: 1 },   // Center - smaller
            { x: W/2 - 350, y: 200, size: 130, color: "#c0c0c0", glow: "#a0a0a0", rank: 2 },  // Left - smaller
            { x: W/2 + 200, y: 200, size: 130, color: "#cd7f32", glow: "#b87333", rank: 3 },  // Right - smaller
        ];
        
        // Draw top 3 users
        for (let i = 0; i < 3 && i < users.length; i++) {
            try {
                await drawTopThreeCompact(ctx, users[i], positions[i], usersData);
            } catch (e) {
                console.log(`Error drawing top player ${i}:`, e);
            }
        }

        // Divider line - moved up
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 420);
        ctx.lineTo(W - 100, 420);
        ctx.stroke();

        // Compact cards for 4-15
        const startY = 435;
        const cardHeight = 60; // Reduced from 75
        const gap = 8; // Reduced from 12
        
        for (let i = 3; i < users.length; i++) {
            try {
                const y = startY + (i-3) * (cardHeight + gap);
                await drawCompactCard(ctx, users[i], i+1, y, usersData, W);
            } catch (e) {
                console.log(`Error drawing rank card ${i}:`, e);
            }
        }

        // Bottom section - compact
        const footerY = H - 80;
        
        // Gradient line
        ctx.shadowColor = "#ff00ff";
        ctx.shadowBlur = 15;
        const footerGrad = ctx.createLinearGradient(200, 0, W-200, 0);
        footerGrad.addColorStop(0, "transparent");
        footerGrad.addColorStop(0.5, "rgba(0,212,255,0.8)");
        footerGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = footerGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(200, footerY);
        ctx.lineTo(W - 200, footerY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Stats - smaller
        ctx.font = "bold 24px 'Poppins', Arial";
        ctx.fillStyle = "#00d4ff";
        ctx.textAlign = "center";
        ctx.fillText(`Total Users: ${usersData.getAll ? (await usersData.getAll()).length : 'N/A'}`, W/2, footerY + 30);
        
        ctx.font = "18px 'Poppins', Arial";
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fillText(`${moment().tz("Asia/Dhaka").format("YYYY-MM-DD | hh:mm:ss A")}`, W/2, footerY + 55);

        // Save with high quality
        const cacheDir = path.join(__dirname, "cache");
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        const fileName = `top_money_${Date.now()}.png`;
        const filePath = path.join(cacheDir, fileName);
        
        const buffer = canvas.toBuffer("image/png", { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE });
        fs.writeFileSync(filePath, buffer);
        
        return filePath;

    } catch (e) {
        console.log("Error in drawTopBoard:", e);
        throw e;
    }
}

async function drawTopThreeCompact(ctx, user, pos, usersData) {
    try {
        const avatar = await fetchAvatar(user.userID, usersData);
        const { x, y, size, color, glow, rank } = pos;
        const centerX = x + size/2;
        const centerY = y + size/2;

        // Outer glow ring - thinner
        ctx.shadowColor = glow;
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size/2 + 15, 0, Math.PI*2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Inner glow
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(centerX, centerY, size/2 + 8, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Avatar with clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, size/2, 0, Math.PI*2);
        ctx.clip();
        
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(x, y, size, size);
        ctx.drawImage(avatar, x, y, size, size);
        
        // Glass overlay
        const glassGrad = ctx.createLinearGradient(0, y + size*0.6, 0, y + size);
        glassGrad.addColorStop(0, "transparent");
        glassGrad.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = glassGrad;
        ctx.fillRect(x, y + size*0.6, size, size*0.4);
        
        ctx.restore();

        // Rank text - smaller
        ctx.font = "bold 26px 'Orbitron', Arial";
        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = glow;
        ctx.shadowBlur = 8;
        ctx.fillText(`#${rank}`, centerX, y + size + 25);
        ctx.shadowBlur = 0;

        // Name - smaller
        ctx.shadowColor = "rgba(255,255,255,0.5)";
        ctx.shadowBlur = 8;
        ctx.font = "bold 24px 'Poppins', Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        const displayName = user.name && user.name.length > 10 ? user.name.slice(0, 8) + ".." : (user.name || "Unknown");
        ctx.fillText(displayName, centerX, y + size + 55);
        ctx.shadowBlur = 0;

        // Money - smaller
        ctx.font = "bold 20px 'Poppins', Arial";
        ctx.fillStyle = color;
        ctx.fillText(`${formatMoney(user.money || 0)}`, centerX, y + size + 80);

    } catch (e) {
        console.log("Error in drawTopThreeCompact:", e);
    }
}

// Compact card for 4-15
async function drawCompactCard(ctx, user, rank, y, usersData, W) {
    try {
        const x = 60;
        const w = W - 120;
        const h = 60; // Reduced height
        const avatar = await fetchAvatar(user.userID, usersData);
        const avatarSize = 45; // Reduced from 55

        // Subtle glass background
        const glassGrad = ctx.createLinearGradient(x, y, x + w, y + h);
        glassGrad.addColorStop(0, "rgba(255,255,255,0.05)");
        glassGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
        glassGrad.addColorStop(1, "rgba(255,255,255,0.05)");
        
        ctx.fillStyle = glassGrad;
        roundRect(ctx, x, y, w, h, 12);
        ctx.fill();
        
        // Single accent line on left - thinner
        const rankColors = {
            4: "#00d4ff", 5: "#00d4ff", 6: "#00d4ff",
            7: "#ff6b6b", 8: "#ff6b6b", 9: "#ff6b6b",
            10: "#ffd93d", 11: "#ffd93d", 12: "#ffd93d",
            13: "#6bcf7f", 14: "#6bcf7f", 15: "#6bcf7f"
        };
        const accentColor = rankColors[rank] || "#00d4ff";
        
        ctx.fillStyle = accentColor;
        ctx.fillRect(x, y + 8, 3, h - 16);

        // Rank number - smaller
        ctx.font = "bold 22px 'Orbitron', Arial";
        ctx.fillStyle = accentColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`#${rank}`, x + 15, y + h/2);

        // Avatar with subtle ring - smaller
        const avatarX = x + 65;
        const avatarY = y + 7;
        
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2);
        ctx.clip();
        ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
        
        // Avatar ring - thinner
        ctx.beginPath();
        ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 1, 0, Math.PI*2);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Name - smaller
        ctx.font = "bold 22px 'Poppins', Arial";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        const displayName = user.name && user.name.length > 18 ? user.name.slice(0, 16) + ".." : (user.name || "Unknown");
        ctx.fillText(displayName, x + 120, y + h/2);

        // Money - smaller
        ctx.font = "bold 20px 'Orbitron', Arial";
        ctx.fillStyle = "#00ff88";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(`${formatMoney(user.money || 0)}`, x + w - 20, y + h/2);

    } catch (e) {
        console.log("Error in drawCompactCard:", e);
    }
}

// Module export
module.exports = {
    config: {
        name: "top",
        version: "0.0.7",
        author: "Azadx69x",
        countDown: 5,
        role: 0,
        shortDescription: "Top 15 Money Leaderboard",
        longDescription: "Shows top 15 richest users",
        category: "rank",
        guide: "{pn} money"
    },

    onStart: async function({ api, event, usersData, message }) {
        try {
            // Set loading reaction
            if (api && event) {
                api.setMessageReaction("⚡", event.messageID, () => {}, true);
            }

            // Get all users
            const allUsers = await usersData.getAll();
            
            if (!allUsers || allUsers.length === 0) {
                return message.reply("No users found in database!");
            }

            // Sort by money and get top 15
            const sorted = allUsers
                .map(u => ({
                    userID: u.userID,
                    name: u.name || "Unknown User",
                    money: u.money || 0
                }))
                .sort((a, b) => b.money - a.money)
                .slice(0, 15);

            // Generate compact image
            const filePath = await drawTopBoard(sorted, usersData);

            // Send message with attachment only
            await message.reply({
                attachment: fs.createReadStream(filePath)
            });

            // Success reaction
            if (api && event) {
                api.setMessageReaction("✓", event.messageID, () => {}, true);
            }

            // Cleanup after 10 seconds
            setTimeout(() => {
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (e) {}
            }, 10000);

        } catch(err) {
            console.error("Top command error:", err);
            
            if (api && event) {
                try {
                    api.setMessageReaction("✗", event.messageID, () => {}, true);
                } catch (e) {}
            }
            
            return message.reply("Error generating leaderboard. Please try again later.");
        }
    }
};
