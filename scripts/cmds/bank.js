const fs = require("fs");
const path = require("path");
const { createCanvas } = require("canvas");

module.exports = {
    config: {
        name: "bank",
        version: "0.0.7",
        author: "Azadx69x",
        role: 0,
        shortDescription: "𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐁𝐚𝐧𝐤𝐢𝐧𝐠 𝐒𝐲𝐬𝐭𝐞𝐦",
        longDescription: "𝐂𝐨𝐦𝐩𝐥𝐞𝐭𝐞 𝐝𝐢𝐠𝐢𝐭𝐚𝐥 𝐛𝐚𝐧𝐤𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 𝐫𝐞𝐚𝐥𝐢𝐬𝐭𝐢𝐜 𝐀𝐓𝐌 𝐜𝐚𝐫𝐝𝐬",
        category: "economy",
        guide: `${String.fromCharCode(55357, 56485)} 𝐁𝐀𝐍𝐊𝐈𝐍𝐆 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:
━━━━━━━━━━━━━━━━━━━
💳 𝐀𝐂𝐂𝐎𝐔𝐍𝐓:
{𝐩𝐧} 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫 - 𝐎𝐩𝐞𝐧 𝐚𝐜𝐜𝐨𝐮𝐧𝐭
{𝐩𝐧} 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 - 𝐂𝐡𝐞𝐜𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞
{𝐩𝐧} 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 - 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐝𝐞𝐭𝐚𝐢𝐥𝐬

💳 𝐀𝐓𝐌 𝐂𝐀𝐑𝐃:
{𝐩𝐧} 𝐜𝐚𝐫𝐝 - 𝐕𝐢𝐞𝐰 𝐀𝐓𝐌 𝐜𝐚𝐫𝐝
{𝐩𝐧} 𝐜𝐚𝐫𝐝 𝐛𝐚𝐜𝐤 - 𝐕𝐢𝐞𝐰 𝐜𝐚𝐫𝐝 𝐛𝐚𝐜𝐤
{𝐩𝐧} 𝐜𝐚𝐫𝐝 𝐝𝐞𝐬𝐢𝐠𝐧𝐬 - 𝐀𝐥𝐥 𝐝𝐞𝐬𝐢𝐠𝐧𝐬
{𝐩𝐧} 𝐚𝐭𝐦𝐜𝐨𝐝𝐞 - 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐀𝐓𝐌 𝐜𝐨𝐝𝐞
{𝐩𝐧} 𝐚𝐭𝐦𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰 <𝐜𝐨𝐝𝐞> <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐀𝐓𝐌 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰

💸 𝐓𝐑𝐀𝐍𝐒𝐀𝐂𝐓𝐈𝐎𝐍𝐒:
{𝐩𝐧} 𝐝𝐞𝐩𝐨𝐬𝐢𝐭 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐀𝐝𝐝 𝐦𝐨𝐧𝐞𝐲
{𝐩𝐧} 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐓𝐚𝐤𝐞 𝐦𝐨𝐧𝐞𝐲
{𝐩𝐧} 𝐬𝐞𝐧𝐝 <@𝐮𝐬𝐞𝐫> <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐒𝐞𝐧𝐝 𝐦𝐨𝐧𝐞𝐲
{𝐩𝐧} 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 <𝐚𝐜𝐜#> <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐁𝐲 𝐚𝐜𝐜𝐨𝐮𝐧𝐭

💰 𝐈𝐍𝐕𝐄𝐒𝐓𝐌𝐄𝐍𝐓𝐒:
{𝐩𝐧} 𝐟𝐝 - 𝐅𝐢𝐱𝐞𝐝 𝐃𝐞𝐩𝐨𝐬𝐢𝐭
{𝐩𝐧} 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 - 𝐂𝐨𝐥𝐥𝐞𝐜𝐭 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭

🏦 𝐋𝐎𝐀𝐍𝐒:
{𝐩𝐧} 𝐥𝐨𝐚𝐧 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐀𝐩𝐩𝐥𝐲 𝐥𝐨𝐚𝐧
{𝐩𝐧} 𝐫𝐞𝐩𝐚𝐲 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐑𝐞𝐩𝐚𝐲 𝐥𝐨𝐚𝐧

📊 𝐎𝐓𝐇𝐄𝐑𝐒:
{𝐩𝐧} 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 - 𝐅𝐮𝐥𝐥 𝐡𝐢𝐬𝐭𝐨𝐫𝐲
{𝐩𝐧} 𝐦𝐢𝐧𝐢𝐬𝐭𝐚𝐭𝐞𝐦𝐞𝐧𝐭 - 𝐋𝐚𝐬𝐭 𝟓
{𝐩𝐧} 𝐥𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 - 𝐓𝐨𝐩 𝟏𝟎 𝐫𝐢𝐜𝐡`
    },

    // Helper Functions
    formatMoney(amount) {
        if (isNaN(amount)) return "𝟎";
        amount = Number(amount);
        const scales = [
            { value: 1e15, suffix: '𝐐' },
            { value: 1e12, suffix: '𝐓' },
            { value: 1e9, suffix: '𝐁' },
            { value: 1e6, suffix: '𝐌' },
            { value: 1e3, suffix: '𝐤' }
        ];
        for (let scale of scales) {
            if (amount >= scale.value) {
                let val = amount / scale.value;
                return val % 1 === 0 ? `${val}${scale.suffix}` : `${val.toFixed(2)}${scale.suffix}`;
            }
        }
        return amount.toString();
    },

    generateCardNumber() {
        const visaPrefix = "𝟒";
        const mastercardPrefix = "𝟓";
        const prefix = Math.random() > 0.5 ? visaPrefix : mastercardPrefix;
        
        let number = prefix;
        for (let i = 0; i < 15; i++) {
            number += Math.floor(Math.random() * 10).toString();
        }
        
        return number.match(/.{1,4}/g).join(" ");
    },

    generateCVV() { 
        const cvv = Math.floor(100 + Math.random() * 900).toString();
        return cvv.split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('');
    },
    
    generatePIN() { 
        const pin = Math.floor(1000 + Math.random() * 9000).toString();
        return pin.split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('');
    },
    
    generateATMCode() {
        const chars = '𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    generateAccountNumber() {
        const num1 = Math.floor(10000000 + Math.random() * 90000000).toString();
        const num2 = Math.floor(1000 + Math.random() * 9000).toString();
        return `𝐆𝐁${num1.split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}${num2.split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}`;
    },

    getExpiry() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = (now.getFullYear() + 4).toString().slice(-2);
        return `${month.toString().padStart(2, '0').split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}/${year.split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}`;
    },

    nowISO() {
        return new Date().toISOString();
    },

    calculateInterest(amount, days) {
        const rate = 0.05;
        return amount * rate * (days / 365);
    },

    calculateLoanInterest(amount, days) {
        const rate = 0.12;
        return amount * rate * (days / 365);
    },

    calculateCreditScore(transactions, balance, loanHistory) {
        let score = 500;
        score += Math.min(transactions.length * 5, 200);
        score += Math.min(Math.floor(balance / 10000) * 2, 200);
        if (loanHistory) {
            if (loanHistory.repaidOnTime) score += 100;
            if (loanHistory.defaulted) score -= 200;
        }
        return Math.min(Math.max(score, 300), 850);
    },

    // Ultra Realistic Card Designs
    cardDesigns: {
        visa_platinum: {
            name: "𝐕𝐈𝐒𝐀 𝐏𝐋𝐀𝐓𝐈𝐍𝐔𝐌",
            gradient: ["#0d1b3a", "#1b2b4f", "#2a3b64"],
            chipColor: "#b8860b",
            hologramColors: ["#c0c0c0", "#e8e8e8", "#a0a0a0"],
            textColor: "#ffffff",
            accentColor: "#d4af37",
            logo: "𝐕𝐈𝐒𝐀",
            logoColor: "#1a1f71",
            network: "visa",
            type: "𝐏𝐋𝐀𝐓𝐈𝐍𝐔𝐌",
            metallic: true
        },
        mastercard_black: {
            name: "𝐌𝐀𝐒𝐓𝐄𝐑𝐂𝐀𝐑𝐃 𝐁𝐋𝐀𝐂𝐊",
            gradient: ["#000000", "#1a1a1a", "#2d2d2d"],
            chipColor: "#c0c0c0",
            hologramColors: ["#808080", "#a9a9a9", "#666666"],
            textColor: "#ffffff",
            accentColor: "#ffd700",
            logo: "𝐌𝐀𝐒𝐓𝐄𝐑𝐂𝐀𝐑𝐃",
            logoColor: "#ff5f00",
            network: "mastercard",
            type: "𝐁𝐋𝐀𝐂𝐊 𝐄𝐃𝐈𝐓𝐈𝐎𝐍",
            metallic: true
        },
        american_express: {
            name: "𝐀𝐌𝐄𝐑𝐈𝐂𝐀𝐍 𝐄𝐗𝐏𝐑𝐄𝐒𝐒",
            gradient: ["#002663", "#003087", "#0046b3"],
            chipColor: "#b5b5b5",
            hologramColors: ["#8a6e4b", "#c0a97a", "#9b7e55"],
            textColor: "#ffffff",
            accentColor: "#ffffff",
            logo: "𝐀𝐌𝐄𝐗",
            logoColor: "#ffffff",
            network: "amex",
            type: "𝐆𝐎𝐋𝐃",
            metallic: true
        },
        gold_elite: {
            name: "𝐄𝐋𝐈𝐓𝐄 𝐆𝐎𝐋𝐃",
            gradient: ["#8B7355", "#B8860B", "#DAA520"],
            chipColor: "#DAA520",
            hologramColors: ["#FBB917", "#E5B73B", "#FFD700"],
            textColor: "#000000",
            accentColor: "#000000",
            logo: "𝐄𝐋𝐈𝐓𝐄",
            logoColor: "#000000",
            network: "premium",
            type: "𝐆𝐎𝐋𝐃",
            metallic: true
        },
        signature_visa: {
            name: "𝐕𝐈𝐒𝐀 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄",
            gradient: ["#0a0f2c", "#1a1f4a", "#2a2f6a"],
            chipColor: "#9b870c",
            hologramColors: ["#b8860b", "#daa520", "#ffd700"],
            textColor: "#ffffff",
            accentColor: "#c0c0c0",
            logo: "𝐕𝐈𝐒𝐀",
            logoColor: "#ffffff",
            network: "visa",
            type: "𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄",
            metallic: true
        },
        world_mastercard: {
            name: "𝐖𝐎𝐑𝐋𝐃 𝐌𝐀𝐒𝐓𝐄𝐑𝐂𝐀𝐑𝐃",
            gradient: ["#1a237e", "#283593", "#3949ab"],
            chipColor: "#c0c0c0",
            hologramColors: ["#e0e0e0", "#f5f5f5", "#ffffff"],
            textColor: "#ffffff",
            accentColor: "#ffd700",
            logo: "𝐌𝐀𝐒𝐓𝐄𝐑𝐂𝐀𝐑𝐃",
            logoColor: "#ffffff",
            network: "mastercard",
            type: "𝐖𝐎𝐑𝐋𝐃 𝐄𝐋𝐈𝐓𝐄",
            metallic: true
        },
        titanium: {
            name: "𝐓𝐈𝐓𝐀𝐍𝐈𝐔𝐌",
            gradient: ["#2b2b2b", "#3d3d3d", "#4f4f4f"],
            chipColor: "#a8a9ad",
            hologramColors: ["#71797E", "#8C8F94", "#A9ACB1"],
            textColor: "#ffffff",
            accentColor: "#00ffff",
            logo: "𝐓𝐈𝐓𝐀𝐍𝐈𝐔𝐌",
            logoColor: "#00ffff",
            network: "premium",
            type: "𝐌𝐄𝐓𝐀𝐋",
            metallic: true
        },
        infinite: {
            name: "𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐄",
            gradient: ["#0b0b0b", "#1e1e1e", "#2d2d2d"],
            chipColor: "#ffd700",
            hologramColors: ["#c0c0c0", "#d4af37", "#e5e4e2"],
            textColor: "#ffffff",
            accentColor: "#d4af37",
            logo: "𝐈𝐍𝐅𝐈𝐍𝐈𝐓𝐄",
            logoColor: "#d4af37",
            network: "premium",
            type: "𝐁𝐋𝐀𝐂𝐊",
            metallic: true
        }
    },

    // Create Front of Card
    async createCardFront(card, username, balance, transactions = [], design = "visa_platinum", creditScore = 700) {
        const width = 900, height = 540;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const d = this.cardDesigns[design] || this.cardDesigns.visa_platinum;
        
        // Background with metallic effect
        if (d.metallic) {
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, d.gradient[0]);
            gradient.addColorStop(0.3, d.gradient[1]);
            gradient.addColorStop(0.6, d.gradient[2]);
            gradient.addColorStop(1, d.gradient[0]);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
            
            ctx.globalAlpha = 0.1;
            for (let i = 0; i < height; i += 20) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(width, i + 100);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
        } else {
            const bg = ctx.createLinearGradient(0, 0, width, height);
            bg.addColorStop(0, d.gradient[0]);
            bg.addColorStop(0.5, d.gradient[1]);
            bg.addColorStop(1, d.gradient[2]);
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, width, height);
        }
        
        // Card border
        ctx.strokeStyle = d.accentColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(5, 5, width - 10, height - 10);
        
        // Bank Name with 3D effect (Stylish)
        ctx.font = "bold 42px 'Arial'";
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fillText("𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐁𝐀𝐍𝐊", 42, 82);
        ctx.fillStyle = d.textColor;
        ctx.fillText("𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐁𝐀𝐍𝐊", 40, 80);
        
        // EMV Chip
        ctx.fillStyle = d.chipColor;
        ctx.fillRect(40, 160, 120, 80);
        
        // Chip circuit pattern
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        for (let i = 170; i < 240; i += 20) {
            ctx.beginPath();
            ctx.moveTo(45, i);
            ctx.lineTo(155, i);
            ctx.stroke();
        }
        for (let i = 55; i < 160; i += 25) {
            ctx.beginPath();
            ctx.moveTo(i, 165);
            ctx.lineTo(i, 235);
            ctx.stroke();
        }
        
        // Small squares on chip
        ctx.fillStyle = "#000000";
        for (let i = 60; i < 150; i += 30) {
            for (let j = 175; j < 225; j += 20) {
                ctx.fillRect(i, j, 5, 5);
            }
        }
        
        // Contactless symbol
        ctx.font = "bold 32px 'Arial'";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fillText("📶", 200, 210);
        
        // Card Number (Stylish)
        ctx.font = "bold 38px 'Courier New'";
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillText(card.number, 42, 342);
        ctx.fillStyle = d.textColor;
        ctx.fillText(card.number, 40, 340);
        
        // Valid Thru (Stylish)
        ctx.font = "bold 18px 'Arial'";
        ctx.fillStyle = "rgba(255,255,255,0.6)";
        ctx.fillText("𝐕𝐀𝐋𝐈𝐃", 600, 280);
        ctx.fillText("𝐓𝐇𝐑𝐔", 700, 280);
        
        ctx.font = "bold 32px 'Courier New'";
        ctx.fillStyle = d.textColor;
        ctx.fillText(card.expiry, 600, 330);
        
        // Card Holder Name (Stylish)
        ctx.font = "bold 28px 'Arial'";
        ctx.fillStyle = d.textColor;
        ctx.fillText(username.toUpperCase().split('').map(c => {
            if (c.match(/[A-Z]/)) return String.fromCharCode(55349, 56804 + (c.charCodeAt(0) - 65));
            return c;
        }).join(''), 40, 450);
        
        // Account type (Stylish)
        ctx.font = "bold 20px 'Arial'";
        ctx.fillStyle = d.accentColor;
        ctx.fillText(d.type, 40, 490);
        
        // Card network logo (Stylish)
        ctx.font = "bold 48px 'Arial'";
        ctx.fillStyle = d.logoColor;
        ctx.fillText(d.logo, 720, 150);
        
        // Balance and Credit Score (Stylish)
        ctx.font = "bold 20px 'Arial'";
        ctx.fillStyle = d.textColor;
        ctx.textAlign = "right";
        ctx.fillText(`𝐁𝐀𝐋: ${this.formatMoney(balance)} 𝐁𝐃𝐓`, 860, 400);
        ctx.fillText(`𝐂𝐒: ${creditScore.toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}`, 860, 430);
        
        // Hologram
        ctx.globalAlpha = 0.7;
        const hologram = ctx.createLinearGradient(750, 50, 830, 130);
        hologram.addColorStop(0, d.hologramColors[0]);
        hologram.addColorStop(0.5, d.hologramColors[1]);
        hologram.addColorStop(1, d.hologramColors[2]);
        ctx.fillStyle = hologram;
        ctx.beginPath();
        ctx.ellipse(790, 90, 35, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Small text (Stylish)
        ctx.font = "12px 'Arial'";
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.textAlign = "left";
        ctx.fillText("𝐓𝐡𝐢𝐬 𝐜𝐚𝐫𝐝 𝐢𝐬 𝐩𝐫𝐨𝐩𝐞𝐫𝐭𝐲 𝐨𝐟 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐁𝐚𝐧𝐤", 40, 520);
        ctx.fillText("𝐈𝐟 𝐟𝐨𝐮𝐧𝐝, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐫𝐞𝐭𝐮𝐫𝐧 𝐭𝐨 𝐚𝐧𝐲 𝐛𝐫𝐚𝐧𝐜𝐡", 40, 535);
        
        const outputDir = path.join(__dirname, "cache");
        fs.mkdirSync(outputDir, { recursive: true });
        const filePath = path.join(outputDir, `${Date.now()}_card_front.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());
        return filePath;
    },

    // Create Back of Card
    async createCardBack(card, username, design = "visa_platinum") {
        const width = 900, height = 540;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");
        const d = this.cardDesigns[design] || this.cardDesigns.visa_platinum;
        
        // Background
        ctx.fillStyle = "#2b2b2b";
        ctx.fillRect(0, 0, width, height);
        
        // Magnetic stripe
        ctx.fillStyle = "#3b2b1a";
        ctx.fillRect(0, 60, width, 80);
        
        // Magnetic stripe texture
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < width; i += 10) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(i, 65, 5, 70);
        }
        ctx.globalAlpha = 1;
        
        // Signature panel
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(50, 200, 500, 80);
        
        // Signature line
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(50, 240);
        ctx.lineTo(550, 240);
        ctx.stroke();
        
        // Signature text (Stylish)
        ctx.font = "bold 16px 'Arial'";
        ctx.fillStyle = "#000000";
        ctx.fillText("𝐀𝐔𝐓𝐇𝐎𝐑𝐈𝐙𝐄𝐃 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄", 55, 230);
        ctx.fillStyle = "#666666";
        ctx.fillText("𝐍𝐎𝐓 𝐕𝐀𝐋𝐈𝐃 𝐖𝐈𝐓𝐇𝐎𝐔𝐓 𝐒𝐈𝐆𝐍𝐀𝐓𝐔𝐑𝐄", 55, 265);
        
        // CVV (Stylish)
        ctx.font = "bold 24px 'Courier New'";
        ctx.fillStyle = "#000000";
        ctx.fillText("𝐂𝐕𝐕𝟐: ***", 580, 240);
        ctx.fillStyle = "#666666";
        ctx.fillText(card.cvv, 680, 240);
        
        // Card number last 4 (Stylish)
        const last4 = card.number.slice(-4);
        ctx.font = "20px 'Courier New'";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`**** **** **** ${last4}`, 100, 350);
        
        // Customer service (Stylish)
        ctx.font = "18px 'Arial'";
        ctx.fillStyle = "#cccccc";
        ctx.fillText("𝟐𝟒/𝟕 𝐂𝐔𝐒𝐓𝐎𝐌𝐄𝐑 𝐒𝐄𝐑𝐕𝐈𝐂𝐄", 100, 400);
        ctx.fillText("+𝟖𝟖𝟎 𝟏𝟐𝟑𝟒-𝟓𝟔𝟕𝟖𝟗𝟎", 100, 430);
        
        // Bank address (Stylish)
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = "#999999";
        ctx.fillText("𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐁𝐚𝐧𝐤 𝐋𝐭𝐝.", 100, 480);
        ctx.fillText("𝐃𝐡𝐚𝐤𝐚, 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡", 100, 500);
        
        // Website (Stylish)
        ctx.font = "bold 16px 'Arial'";
        ctx.fillStyle = d.accentColor;
        ctx.fillText("𝐰𝐰𝐰.𝐮𝐥𝐭𝐢𝐦𝐚𝐭𝐞𝐛𝐚𝐧𝐤.𝐜𝐨𝐦", 650, 500);
        
        const outputDir = path.join(__dirname, "cache");
        fs.mkdirSync(outputDir, { recursive: true });
        const filePath = path.join(outputDir, `${Date.now()}_card_back.png`);
        fs.writeFileSync(filePath, canvas.toBuffer());
        return filePath;
    },

    async onStart({ message, args, usersData, event, api }) {
        const uid = event.senderID;
        const action = args[0]?.toLowerCase();
        let data = await usersData.get(uid);
        
        // Initialize bank data
        if (!data.data) data.data = {};
        if (!data.data.bank) {
            data.data.bank = {
                balance: 0,
                registered: false,
                card: null,
                transactions: [],
                accountNumber: this.generateAccountNumber(),
                createdAt: null,
                savings: 0,
                atmCodes: [],
                loan: {
                    amount: 0,
                    takenAt: null,
                    dueDate: null,
                    interest: 0
                },
                fixedDeposits: [],
                creditScore: 500,
                lastInterestClaim: null,
                accountType: "𝐒𝐭𝐚𝐧𝐝𝐚𝐫𝐝",
                dailyLimit: 100000,
                usedToday: 0,
                lastReset: new Date().setHours(0,0,0,0),
                cardDesign: "visa_platinum"
            };
        }
        
        const bank = data.data.bank;
        
        // Reset daily limit
        const today = new Date().setHours(0,0,0,0);
        if (bank.lastReset < today) {
            bank.usedToday = 0;
            bank.lastReset = today;
        }
        
        // Update account type
        if (bank.balance >= 10000000) bank.accountType = "𝐏𝐥𝐚𝐭𝐢𝐧𝐮𝐦";
        else if (bank.balance >= 5000000) bank.accountType = "𝐆𝐨𝐥𝐝";
        else if (bank.balance >= 1000000) bank.accountType = "𝐏𝐫𝐞𝐦𝐢𝐮𝐦";
        else bank.accountType = "𝐒𝐭𝐚𝐧𝐝𝐚𝐫𝐝";
        
        // Update credit score
        bank.creditScore = this.calculateCreditScore(bank.transactions, bank.balance, bank.loan);

        // Show available card designs
        if (action === "card" && args[1] === "designs") {
            let designsText = "💳 𝐀𝐕𝐀𝐈𝐋𝐀𝐁𝐋𝐄 𝐂𝐀𝐑𝐃 𝐃𝐄𝐒𝐈𝐆𝐍𝐒\n━━━━━━━━━━━━━━━━━━━\n\n";
            
            Object.keys(this.cardDesigns).forEach((key, index) => {
                const d = this.cardDesigns[key];
                designsText += `${(index + 1).toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}. ${d.name}\n`;
                designsText += `   🏷️ 𝐓𝐲𝐩𝐞: ${d.type}\n`;
                designsText += `   💫 𝐍𝐞𝐭𝐰𝐨𝐫𝐤: ${d.network.toUpperCase()}\n`;
                designsText += `   𝐔𝐬𝐞: bank card ${key}\n\n`;
            });
            
            designsText += "━━━━━━━━━━━━━━━━━━━\n";
            designsText += "𝐄𝐱𝐚𝐦𝐩𝐥𝐞: bank card visa_platinum";
            
            return message.reply(designsText);
        }

        // Register Command
        if (action === "register") {
            if (bank.registered) return message.reply("⚠️ 𝐘𝐨𝐮 𝐚𝐥𝐫𝐞𝐚𝐝𝐲 𝐡𝐚𝐯𝐞 𝐚 𝐛𝐚𝐧𝐤 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.");
            
            bank.registered = true;
            bank.balance = 1000;
            bank.createdAt = this.nowISO();
            bank.transactions.push({
                type: "received",
                amount: 1000,
                from: "𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐁𝐨𝐧𝐮𝐬",
                time: Date.now()
            });
            
            await usersData.set(uid, { data: data.data });

            return message.reply(
`✅ 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐓𝐈𝐎𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋!
━━━━━━━━━━━━━━━━━━━
🏦 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐃𝐢𝐠𝐢𝐭𝐚𝐥 𝐁𝐚𝐧𝐤
📈 𝐀𝐜𝐜𝐨𝐮𝐧𝐭: ${bank.accountNumber}
💰 𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐁𝐨𝐧𝐮𝐬: 𝟏,𝟎𝟎𝟎 𝐁𝐃𝐓
📅 𝐎𝐩𝐞𝐧𝐞𝐝: ${bank.createdAt}
💳 𝐓𝐲𝐩𝐞: ${bank.accountType}

𝐔𝐬𝐞: \`bank card\` 𝐭𝐨 𝐯𝐢𝐞𝐰 𝐲𝐨𝐮𝐫 𝐀𝐓𝐌 𝐜𝐚𝐫𝐝
𝐔𝐬𝐞: \`bank card designs\` 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐝𝐞𝐬𝐢𝐠𝐧𝐬`
            );
        }

        if (!bank.registered)
            return message.reply("❌ 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐚 𝐛𝐚𝐧𝐤 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.\n𝐔𝐬𝐞: \`bank register\`");

        // Balance Command
        if (action === "balance") {
            return message.reply(
`💰 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 𝐈𝐍𝐅𝐎
━━━━━━━━━━━━━━━━━━━
💳 𝐀𝐜𝐜𝐨𝐮𝐧𝐭: ${bank.accountNumber}
💴 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
🏦 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐓𝐲𝐩𝐞: ${bank.accountType}
📊 𝐂𝐫𝐞𝐝𝐢𝐭 𝐒𝐜𝐨𝐫𝐞: ${bank.creditScore}
💎 𝐒𝐚𝐯𝐢𝐧𝐠𝐬: ${this.formatMoney(bank.savings || 0)} 𝐁𝐃𝐓
━━━━━━━━━━━━━━━━━━━`
            );
        }

        // ATM Code Generation
        if (action === "atmcode") {
            const newCode = this.generateATMCode();
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            
            if (!bank.atmCodes) bank.atmCodes = [];
            bank.atmCodes.push({
                code: newCode,
                createdAt: Date.now(),
                expiresAt: expiryTime,
                used: false,
                maxAmount: Math.min(bank.balance, bank.dailyLimit - bank.usedToday)
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`🏧 𝐀𝐓𝐌 𝐂𝐎𝐃𝐄 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃
━━━━━━━━━━━━━━━━━━━
🔐 𝐂𝐨𝐝𝐞: \`${newCode}\`
⏰ 𝐄𝐱𝐩𝐢𝐫𝐞𝐬: ${new Date(expiryTime).toLocaleString()}
💰 𝐌𝐚𝐱 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(Math.min(bank.balance, bank.dailyLimit - bank.usedToday))} 𝐁𝐃𝐓
📊 𝐃𝐚𝐢𝐥𝐲 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓

📌 𝐔𝐬𝐞: \`bank atmwithdraw ${newCode} <amount>\`

⚠️ 𝐄𝐱𝐩𝐢𝐫𝐞𝐬 𝐢𝐧 𝟐𝟒𝐡 | 𝐎𝐧𝐞 𝐭𝐢𝐦𝐞 𝐮𝐬𝐞`
            );
        }
        
        // ATM Withdrawal
        if (action === "atmwithdraw") {
            const code = args[1]?.toUpperCase();
            const amount = parseFloat(args[2]);
            
            if (!code) return message.reply("❌ 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐀𝐓𝐌 𝐜𝐨𝐝𝐞.\n𝐔𝐬𝐚𝐠𝐞: bank atmwithdraw <code> <amount>");
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
            
            let foundUser = null;
            let foundCode = null;
            let foundUserId = null;
            
            const allUsers = await usersData.getAll();
            
            for (const [userId, userData] of Object.entries(allUsers)) {
                if (userData.data?.bank?.atmCodes) {
                    const atmCode = userData.data.bank.atmCodes.find(
                        c => c.code === code && !c.used && c.expiresAt > Date.now()
                    );
                    if (atmCode) {
                        foundUser = userData;
                        foundCode = atmCode;
                        foundUserId = userId;
                        break;
                    }
                }
            }
            
            if (!foundCode) {
                return message.reply("❌ 𝐈𝐧𝐯𝐚𝐥𝐢𝐝/𝐞𝐱𝐩𝐢𝐫𝐞𝐝 𝐀𝐓𝐌 𝐜𝐨𝐝𝐞.");
            }
            
            if (amount > foundCode.maxAmount) {
                return message.reply(`❌ 𝐌𝐚𝐱 𝐚𝐥𝐥𝐨𝐰𝐞𝐝: ${this.formatMoney(foundCode.maxAmount)} 𝐁𝐃𝐓`);
            }
            
            if (amount > foundUser.data.bank.balance) {
                return message.reply(`❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐢𝐧 𝐬𝐨𝐮𝐫𝐜𝐞 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.`);
            }
            
            // Process transaction
            foundUser.data.bank.balance -= amount;
            foundCode.used = true;
            foundCode.usedAt = Date.now();
            foundCode.usedBy = uid;
            
            bank.balance += amount;
            bank.usedToday += amount;
            
            foundUser.data.bank.transactions.push({
                type: "sent",
                amount: amount,
                to: data.name || "𝐀𝐓𝐌 𝐔𝐬𝐞𝐫",
                time: Date.now(),
                method: "𝐀𝐓𝐌 𝐂𝐨𝐝𝐞",
                balance: foundUser.data.bank.balance
            });
            
            bank.transactions.push({
                type: "received",
                amount: amount,
                from: foundUser.name || "𝐀𝐓𝐌 𝐒𝐞𝐧𝐝𝐞𝐫",
                time: Date.now(),
                method: "𝐀𝐓𝐌 𝐂𝐨𝐝𝐞",
                balance: bank.balance
            });
            
            await usersData.set(foundUserId, { data: foundUser.data });
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐀𝐓𝐌 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖𝐀𝐋 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(amount)} 𝐁𝐃𝐓
👤 𝐅𝐫𝐨𝐦: ${foundUser.name || "𝐔𝐬𝐞𝐫"}
💳 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
📊 𝐃𝐚𝐢𝐥𝐲 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓

📝 𝐓𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞𝐝`
            );
        }

        // Card Commands
        if (action === "card") {
            if (args[1] === "back") {
                if (!bank.card) {
                    bank.card = {
                        number: this.generateCardNumber(),
                        cvv: this.generateCVV(),
                        pin: this.generatePIN(),
                        expiry: this.getExpiry(),
                    };
                    await usersData.set(uid, { data: data.data });
                }
                
                const image = await this.createCardBack(bank.card, data.name || "User", bank.cardDesign);
                
                return message.reply({
                    body: `💳 𝐂𝐀𝐑𝐃 𝐁𝐀𝐂𝐊 𝐒𝐈𝐃𝐄\n━━━━━━━━━━━━━━━━━━━\n🔐 𝐂𝐕𝐕: ${bank.cvv}\n📋 𝐒𝐢𝐠𝐧 𝐚𝐧𝐝 𝐤𝐞𝐞𝐩 𝐬𝐚𝐟𝐞`,
                    attachment: fs.createReadStream(image),
                });
            }
            
            if (args[1] && this.cardDesigns[args[1]]) {
                bank.cardDesign = args[1];
                await usersData.set(uid, { data: data.data });
                return message.reply(`✅ 𝐂𝐚𝐫𝐝 𝐝𝐞𝐬𝐢𝐠𝐧 𝐜𝐡𝐚𝐧𝐠𝐞𝐝 𝐭𝐨: ${this.cardDesigns[args[1]].name}`);
            }
            
            if (!bank.card) {
                bank.card = {
                    number: this.generateCardNumber(),
                    cvv: this.generateCVV(),
                    pin: this.generatePIN(),
                    expiry: this.getExpiry(),
                };
                await usersData.set(uid, { data: data.data });
            }
            
            const chosenDesign = args[1] || bank.cardDesign || "visa_platinum";
            
            const image = await this.createCardFront(
                bank.card, 
                data.name || "User", 
                bank.balance, 
                bank.transactions, 
                chosenDesign,
                bank.creditScore
            );
            
            return message.reply({
                body:
                    `💳 𝐘𝐨𝐮𝐫 𝐀𝐓𝐌 𝐂𝐚𝐫𝐝\n` +
                    `━━━━━━━━━━━━━━━━━━━\n` +
                    `💳 𝐂𝐚𝐫𝐝: ${bank.card.number}\n` +
                    `📅 𝐄𝐱𝐩: ${bank.card.expiry}\n` +
                    `🔐 𝐏𝐈𝐍: ${bank.card.pin}\n` +
                    `📊 𝐂𝐒: ${bank.creditScore.toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}\n` +
                    `💰 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓\n` +
                    `━━━━━━━━━━━━━━━━━━━\n` +
                    `🎨 𝐃𝐞𝐬𝐢𝐠𝐧: ${this.cardDesigns[chosenDesign]?.name || "𝐕𝐢𝐬𝐚 𝐏𝐥𝐚𝐭𝐢𝐧𝐮𝐦"}\n` +
                    `📱 𝐔𝐬𝐞: \`bank card back\` 𝐭𝐨 𝐬𝐞𝐞 𝐛𝐚𝐜𝐤 𝐬𝐢𝐝𝐞\n` +
                    `🎯 𝐔𝐬𝐞: \`bank card designs\` 𝐭𝐨 𝐬𝐞𝐞 𝐚𝐥𝐥 𝐝𝐞𝐬𝐢𝐠𝐧𝐬`,
                attachment: fs.createReadStream(image),
            });
        }

        // Loan Command
        if (action === "loan") {
            const amount = parseFloat(args[1]);
            
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
            
            if (bank.creditScore < 600) {
                return message.reply(`❌ 𝐋𝐨𝐚𝐧 𝐫𝐞𝐣𝐞𝐜𝐭𝐞𝐝! 𝐘𝐨𝐮𝐫 𝐜𝐫𝐞𝐝𝐢𝐭 𝐬𝐜𝐨𝐫𝐞 (${bank.creditScore}) 𝐢𝐬 𝐭𝐨𝐨 𝐥𝐨𝐰. 𝐌𝐢𝐧 𝟔𝟎𝟎 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.`);
            }
            
            let maxLoan = bank.balance * 2;
            if (bank.creditScore >= 750) maxLoan = bank.balance * 5;
            else if (bank.creditScore >= 700) maxLoan = bank.balance * 3;
            
            if (amount > maxLoan) {
                return message.reply(`❌ 𝐌𝐚𝐱 𝐥𝐨𝐚𝐧 𝐚𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(maxLoan)} 𝐁𝐃𝐓`);
            }
            
            if (bank.loan && bank.loan.amount > 0) {
                return message.reply(`❌ 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐚𝐧 𝐞𝐱𝐢𝐬𝐭𝐢𝐧𝐠 𝐥𝐨𝐚𝐧 𝐨𝐟 ${this.formatMoney(bank.loan.amount)} 𝐁𝐃𝐓`);
            }
            
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + 6);
            
            bank.loan = {
                amount: amount,
                takenAt: Date.now(),
                dueDate: dueDate.getTime(),
                interest: this.calculateLoanInterest(amount, 180),
                repaid: false
            };
            
            bank.balance += amount;
            
            bank.transactions.push({
                type: "received",
                amount: amount,
                from: "𝐁𝐚𝐧𝐤 𝐋𝐨𝐚𝐧",
                time: Date.now(),
                method: "𝐋𝐨𝐚𝐧 𝐃𝐢𝐬𝐛𝐮𝐫𝐬𝐞𝐦𝐞𝐧𝐭",
                balance: bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐋𝐎𝐀𝐍 𝐀𝐏𝐏𝐑𝐎𝐕𝐄𝐃!
━━━━━━━━━━━━━━━━━━━
💰 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(amount)} 𝐁𝐃𝐓
📊 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: ${this.formatMoney(bank.loan.interest)} 𝐁𝐃𝐓 (𝟏𝟐%)
📅 𝐃𝐮𝐞 𝐃𝐚𝐭𝐞: ${new Date(dueDate).toLocaleDateString()}
💳 𝐍𝐞𝐰 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
📈 𝐂𝐫𝐞𝐝𝐢𝐭 𝐒𝐜𝐨𝐫𝐞: ${bank.creditScore}

𝐔𝐬𝐞: \`bank repay <amount>\` 𝐭𝐨 𝐫𝐞𝐩𝐚𝐲`
            );
        }

        // Repay Loan
        if (action === "repay") {
            const amount = parseFloat(args[1]);
            
            if (!bank.loan || bank.loan.amount <= 0) {
                return message.reply("❌ 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐨𝐚𝐧.");
            }
            
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
            
            const totalDue = bank.loan.amount + bank.loan.interest;
            
            if (amount > bank.balance) {
                return message.reply(`❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞. 𝐍𝐞𝐞𝐝: ${this.formatMoney(amount)} 𝐁𝐃𝐓`);
            }
            
            if (amount > totalDue) {
                return message.reply(`❌ 𝐘𝐨𝐮 𝐨𝐧𝐥𝐲 𝐨𝐰𝐞 ${this.formatMoney(totalDue)} 𝐁𝐃𝐓`);
            }
            
            bank.balance -= amount;
            bank.loan.amount -= amount;
            
            if (bank.loan.amount < 0) {
                const overpaid = Math.abs(bank.loan.amount);
                bank.balance += overpaid;
                bank.loan.amount = 0;
            }
            
            if (bank.loan.amount <= 0) {
                bank.loan = { amount: 0, takenAt: null, dueDate: null, interest: 0 };
            } else {
                const daysRemaining = (bank.loan.dueDate - Date.now()) / (1000 * 60 * 60 * 24);
                bank.loan.interest = this.calculateLoanInterest(bank.loan.amount, daysRemaining);
            }
            
            bank.transactions.push({
                type: "sent",
                amount: amount,
                to: "𝐋𝐨𝐚𝐧 𝐑𝐞𝐩𝐚𝐲𝐦𝐞𝐧𝐭",
                time: Date.now(),
                method: "𝐋𝐨𝐚𝐧 𝐑𝐞𝐩𝐚𝐲𝐦𝐞𝐧𝐭",
                balance: bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐋𝐎𝐀𝐍 𝐑𝐄𝐏𝐀𝐘𝐌𝐄𝐍𝐓 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 𝐏𝐚𝐢𝐝: ${this.formatMoney(amount)} 𝐁𝐃𝐓
💳 𝐑𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠: ${this.formatMoney(bank.loan.amount)} 𝐁𝐃𝐓
📊 𝐍𝐞𝐰 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓`
            );
        }

        // Fixed Deposit
        if (action === "fd") {
            const subAction = args[1]?.toLowerCase();
            
            if (subAction === "create") {
                const amount = parseFloat(args[2]);
                
                if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
                
                if (amount > bank.balance) {
                    return message.reply(`❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞. 𝐍𝐞𝐞𝐝: ${this.formatMoney(amount)} 𝐁𝐃𝐓`);
                }
                
                const maturityDate = new Date();
                maturityDate.setMonth(maturityDate.getMonth() + 3);
                
                const fd = {
                    amount: amount,
                    createdAt: Date.now(),
                    maturityDate: maturityDate.getTime(),
                    interestRate: 0.05,
                    interest: this.calculateInterest(amount, 90),
                    withdrawn: false
                };
                
                if (!bank.fixedDeposits) bank.fixedDeposits = [];
                bank.fixedDeposits.push(fd);
                bank.balance -= amount;
                
                bank.transactions.push({
                    type: "sent",
                    amount: amount,
                    to: "𝐅𝐢𝐱𝐞𝐝 𝐃𝐞𝐩𝐨𝐬𝐢𝐭",
                    time: Date.now(),
                    method: "𝐅𝐃 𝐂𝐫𝐞𝐚𝐭𝐢𝐨𝐧",
                    balance: bank.balance
                });
                
                await usersData.set(uid, { data: data.data });
                
                return message.reply(
`✅ 𝐅𝐈𝐗𝐄𝐃 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 𝐂𝐑𝐄𝐀𝐓𝐄𝐃!
━━━━━━━━━━━━━━━━━━━
💰 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(amount)} 𝐁𝐃𝐓
📈 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭: ${this.formatMoney(fd.interest)} 𝐁𝐃𝐓 (𝟓%)
📅 𝐌𝐚𝐭𝐮𝐫𝐢𝐭𝐲: ${new Date(maturityDate).toLocaleDateString()}
💰 𝐌𝐚𝐭𝐮𝐫𝐢𝐭𝐲 𝐕𝐚𝐥𝐮𝐞: ${this.formatMoney(amount + fd.interest)} 𝐁𝐃𝐓

𝐔𝐬𝐞: \`bank fd withdraw\` 𝐚𝐟𝐭𝐞𝐫 𝐦𝐚𝐭𝐮𝐫𝐢𝐭𝐲`
                );
            }
            
            if (subAction === "withdraw") {
                if (!bank.fixedDeposits || bank.fixedDeposits.length === 0) {
                    return message.reply("❌ 𝐘𝐨𝐮 𝐡𝐚𝐯𝐞 𝐧𝐨 𝐅𝐃.");
                }
                
                let totalWithdrawn = 0;
                const now = Date.now();
                
                bank.fixedDeposits = bank.fixedDeposits.filter(fd => {
                    if (fd.withdrawn) return false;
                    
                    if (now >= fd.maturityDate) {
                        const maturityValue = fd.amount + fd.interest;
                        bank.balance += maturityValue;
                        totalWithdrawn += maturityValue;
                        
                        bank.transactions.push({
                            type: "received",
                            amount: maturityValue,
                            from: "𝐅𝐃 𝐌𝐚𝐭𝐮𝐫𝐢𝐭𝐲",
                            time: Date.now(),
                            method: "𝐅𝐃 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐚𝐥",
                            balance: bank.balance
                        });
                        
                        return false;
                    }
                    return true;
                });
                
                if (totalWithdrawn === 0) {
                    return message.reply("❌ 𝐍𝐨 𝐅𝐃 𝐡𝐚𝐬 𝐦𝐚𝐭𝐮𝐫𝐞𝐝 𝐲𝐞𝐭.");
                }
                
                await usersData.set(uid, { data: data.data });
                
                return message.reply(
`✅ 𝐅𝐃 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖𝐀𝐋 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 𝐓𝐨𝐭𝐚𝐥 𝐑𝐞𝐜𝐞𝐢𝐯𝐞𝐝: ${this.formatMoney(totalWithdrawn)} 𝐁𝐃𝐓
💳 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓`
                );
            }
            
            let fdText = "🏦 𝐅𝐈𝐗𝐄𝐃 𝐃𝐄𝐏𝐎𝐒𝐈𝐓𝐒\n━━━━━━━━━━━━━━━━━━━\n";
            
            if (!bank.fixedDeposits || bank.fixedDeposits.length === 0) {
                fdText += "𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐅𝐃.\n";
            } else {
                bank.fixedDeposits.forEach((fd, i) => {
                    const maturityDate = new Date(fd.maturityDate);
                    const status = fd.maturityDate > Date.now() ? "⏳ 𝐀𝐜𝐭𝐢𝐯𝐞" : "✅ 𝐌𝐚𝐭𝐮𝐫𝐞𝐝";
                    fdText += `${(i+1).toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}. ${status}\n`;
                    fdText += `   💰 ${this.formatMoney(fd.amount)} 𝐁𝐃𝐓\n`;
                    fdText += `   📈 +${this.formatMoney(fd.interest)} 𝐁𝐃𝐓\n`;
                    fdText += `   📅 ${maturityDate.toLocaleDateString()}\n\n`;
                });
            }
            
            fdText += "━━━━━━━━━━━━━━━━━━━\n";
            fdText += "𝐔𝐬𝐞: \`bank fd create <amount>\`\n";
            fdText += "𝐔𝐬𝐞: \`bank fd withdraw\`";
            
            return message.reply(fdText);
        }

        // Interest Collection
        if (action === "interest") {
            const now = Date.now();
            const lastClaim = bank.lastInterestClaim || bank.createdAt ? new Date(bank.createdAt).getTime() : now;
            
            if (lastClaim && (now - lastClaim) < 24 * 60 * 60 * 1000) {
                const timeLeft = 24 * 60 * 60 * 1000 - (now - lastClaim);
                const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
                return message.reply(`⏳ 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐚𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐢𝐧 ${hoursLeft} 𝐡𝐨𝐮𝐫𝐬.`);
            }
            
            const savingsInterest = bank.savings * 0.02;
            const balanceInterest = bank.balance * 0.01;
            
            const totalInterest = savingsInterest + balanceInterest;
            
            if (totalInterest < 1) {
                return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 𝐟𝐨𝐫 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭.");
            }
            
            bank.balance += totalInterest;
            bank.lastInterestClaim = now;
            
            bank.transactions.push({
                type: "received",
                amount: totalInterest,
                from: "𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭 𝐏𝐚𝐲𝐦𝐞𝐧𝐭",
                time: now,
                method: "𝐃𝐚𝐢𝐥𝐲 𝐈𝐧𝐭𝐞𝐫𝐞𝐬𝐭",
                balance: bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 𝐂𝐎𝐋𝐋𝐄𝐂𝐓𝐄𝐃!
━━━━━━━━━━━━━━━━━━━
💰 𝐒𝐚𝐯𝐢𝐧𝐠𝐬 𝐈𝐧𝐭: ${this.formatMoney(savingsInterest)} 𝐁𝐃𝐓
💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞 𝐈𝐧𝐭: ${this.formatMoney(balanceInterest)} 𝐁𝐃𝐓
💳 𝐓𝐨𝐭𝐚𝐥: ${this.formatMoney(totalInterest)} 𝐁𝐃𝐓
📊 𝐍𝐞𝐰 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓

𝐍𝐞𝐱𝐭 𝐢𝐧 𝟐𝟒 𝐡𝐨𝐮𝐫𝐬`
            );
        }

        // Transfer by Account Number
        if (action === "transfer") {
            const targetAccount = args[1];
            const amount = parseFloat(args[2]);
            
            if (!targetAccount) return message.reply("❌ 𝐏𝐫𝐨𝐯𝐢𝐝𝐞 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐧𝐮𝐦𝐛𝐞𝐫.");
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
            if (amount > bank.balance) return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
            if (amount > bank.dailyLimit - bank.usedToday) {
                return message.reply(`❌ 𝐃𝐚𝐢𝐥𝐲 𝐥𝐢𝐦𝐢𝐭 𝐞𝐱𝐜𝐞𝐞𝐝𝐞𝐝. 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`);
            }
            
            let targetUser = null;
            let targetUserId = null;
            const allUsers = await usersData.getAll();
            
            for (const [userId, userData] of Object.entries(allUsers)) {
                if (userData.data?.bank?.accountNumber === targetAccount) {
                    targetUser = userData;
                    targetUserId = userId;
                    break;
                }
            }
            
            if (!targetUser) {
                return message.reply("❌ 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐧𝐮𝐦𝐛𝐞𝐫 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.");
            }
            
            if (targetUserId === uid) {
                return message.reply("❌ 𝐂𝐚𝐧𝐧𝐨𝐭 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 𝐭𝐨 𝐲𝐨𝐮𝐫 𝐨𝐰𝐧 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.");
            }
            
            bank.balance -= amount;
            bank.usedToday += amount;
            
            targetUser.data.bank.balance += amount;
            
            bank.transactions.push({
                type: "sent",
                amount: amount,
                to: targetUser.name || "𝐔𝐬𝐞𝐫",
                time: Date.now(),
                method: "𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫",
                account: targetAccount,
                balance: bank.balance
            });
            
            targetUser.data.bank.transactions.push({
                type: "received",
                amount: amount,
                from: data.name || "𝐔𝐬𝐞𝐫",
                time: Date.now(),
                method: "𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐓𝐫𝐚𝐧𝐬𝐟𝐞𝐫",
                account: bank.accountNumber,
                balance: targetUser.data.bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            await usersData.set(targetUserId, { data: targetUser.data });
            
            return message.reply(
`✅ 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(amount)} 𝐁𝐃𝐓
📋 𝐓𝐨: ${targetUser.name || "𝐔𝐬𝐞𝐫"}
📈 𝐀𝐜𝐜𝐨𝐮𝐧𝐭: ${targetAccount}
💳 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
📊 𝐃𝐚𝐢𝐥𝐲 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`
            );
        }

        // Deposit Command
        if (action === "deposit") {
            const amount = parseFloat(args[1]);
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.");
            
            bank.balance += amount;
            bank.transactions.push({
                type: "received",
                amount,
                from: "𝐃𝐞𝐩𝐨𝐬𝐢𝐭",
                time: Date.now(),
                balance: bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐃𝐄𝐏𝐎𝐒𝐈𝐓 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 +${this.formatMoney(amount)} 𝐁𝐃𝐓
💳 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓`
            );
        }

        // Withdraw Command
        if (action === "withdraw") {
            const amount = parseFloat(args[1]);
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭.");
            if (amount > bank.balance) return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
            if (amount > bank.dailyLimit - bank.usedToday) {
                return message.reply(`❌ 𝐃𝐚𝐢𝐥𝐲 𝐥𝐢𝐦𝐢𝐭 𝐞𝐱𝐜𝐞𝐞𝐝𝐞𝐝. 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`);
            }
            
            bank.balance -= amount;
            bank.usedToday += amount;
            
            bank.transactions.push({
                type: "sent",
                amount,
                to: "𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰𝐚𝐥",
                time: Date.now(),
                balance: bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            
            return message.reply(
`✅ 𝐖𝐈𝐓𝐇𝐃𝐑𝐀𝐖𝐀𝐋 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 -${this.formatMoney(amount)} 𝐁𝐃𝐓
💳 𝐍𝐞𝐰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
📊 𝐃𝐚𝐢𝐥𝐲 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`
            );
        }

        // Send Command
        if (action === "send") {
            if (!args[1] || !args[2]) {
                return message.reply("❌ 𝐔𝐬𝐚𝐠𝐞: bank send <@user> <amount>");
            }
            
            let targetId;
            if (args[1].startsWith("@")) {
                const mentions = Object.keys(event.mentions || {});
                if (mentions.length === 0) return message.reply("❌ 𝐏𝐥𝐞𝐚𝐬𝐞 𝐦𝐞𝐧𝐭𝐢𝐨𝐧 𝐚 𝐮𝐬𝐞𝐫.");
                targetId = mentions[0];
            } else {
                targetId = args[1];
            }
            
            const amount = parseFloat(args[2]);
            
            if (isNaN(amount) || amount <= 0) return message.reply("❌ 𝐕𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 𝐫𝐞𝐪𝐮𝐢𝐫𝐞𝐝.");
            if (amount > bank.balance) return message.reply("❌ 𝐈𝐧𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭 𝐛𝐚𝐥𝐚𝐧𝐜𝐞.");
            if (amount > bank.dailyLimit - bank.usedToday) {
                return message.reply(`❌ 𝐃𝐚𝐢𝐥𝐲 𝐥𝐢𝐦𝐢𝐭 𝐞𝐱𝐜𝐞𝐞𝐝𝐞𝐝. 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`);
            }
            
            let targetData = await usersData.get(targetId);
            if (!targetData.data) targetData.data = {};
            if (!targetData.data.bank) {
                targetData.data.bank = {
                    balance: 0,
                    registered: false,
                    card: null,
                    transactions: [],
                    accountNumber: this.generateAccountNumber(),
                    atmCodes: []
                };
            }
            
            if (!targetData.data.bank.registered) {
                return message.reply("❌ 𝐑𝐞𝐜𝐢𝐩𝐢𝐞𝐧𝐭 𝐝𝐨𝐞𝐬 𝐧𝐨𝐭 𝐡𝐚𝐯𝐞 𝐚 𝐛𝐚𝐧𝐤 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.");
            }
            
            bank.balance -= amount;
            bank.usedToday += amount;
            targetData.data.bank.balance += amount;
            
            bank.transactions.push({
                type: "sent",
                amount,
                to: targetData.name || "𝐔𝐬𝐞𝐫",
                time: Date.now(),
                method: "𝐃𝐢𝐫𝐞𝐜𝐭 𝐒𝐞𝐧𝐝",
                balance: bank.balance
            });
            
            targetData.data.bank.transactions.push({
                type: "received",
                amount,
                from: data.name || "𝐔𝐬𝐞𝐫",
                time: Date.now(),
                method: "𝐃𝐢𝐫𝐞𝐜𝐭 𝐒𝐞𝐧𝐝",
                balance: targetData.data.bank.balance
            });
            
            await usersData.set(uid, { data: data.data });
            await usersData.set(targetId, { data: targetData.data });
            
            return message.reply(
`✅ 𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑 𝐒𝐔𝐂𝐂𝐄𝐒𝐒!
━━━━━━━━━━━━━━━━━━━
💰 𝐀𝐦𝐨𝐮𝐧𝐭: ${this.formatMoney(amount)} 𝐁𝐃𝐓
👤 𝐓𝐨: ${targetData.name || "𝐔𝐬𝐞𝐫"}
💳 𝐘𝐨𝐮𝐫 𝐁𝐚𝐥: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
📊 𝐃𝐚𝐢𝐥𝐲 𝐋𝐞𝐟𝐭: ${this.formatMoney(bank.dailyLimit - bank.usedToday)} 𝐁𝐃𝐓`
            );
        }

        // Mini Statement
        if (action === "ministatement") {
            let statementText = "📋 𝐌𝐈𝐍𝐈 𝐒𝐓𝐀𝐓𝐄𝐌𝐄𝐍𝐓\n━━━━━━━━━━━━━━━━━━━\n";
            
            if (!bank.transactions.length) {
                statementText += "𝐍𝐨 𝐭𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧𝐬 𝐲𝐞𝐭.\n";
            } else {
                const last5 = bank.transactions.slice(-5).reverse();
                last5.forEach((tx, i) => {
                    const date = new Date(tx.time).toLocaleString();
                    const symbol = tx.type === "received" ? "📥" : "📤";
                    statementText += `${symbol} ${this.formatMoney(tx.amount)} 𝐁𝐃𝐓\n`;
                    statementText += `   ${tx.type === "received" ? "𝐅𝐫𝐨𝐦" : "𝐓𝐨"}: ${tx.from || tx.to}\n`;
                    statementText += `   ${date}\n\n`;
                });
            }
            
            statementText += `💳 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓`;
            
            return message.reply(statementText);
        }

        // History Command
        if (action === "history") {
            let historyText = "📝 𝐓𝐑𝐀𝐍𝐒𝐀𝐂𝐓𝐈𝐎𝐍 𝐇𝐈𝐒𝐓𝐎𝐑𝐘\n━━━━━━━━━━━━━━━━━━━\n";
            
            if (!bank.transactions.length) {
                historyText += "𝐍𝐨 𝐭𝐫𝐚𝐧𝐬𝐚𝐜𝐭𝐢𝐨𝐧𝐬 𝐲𝐞𝐭.\n";
            } else {
                bank.transactions.slice(-15).reverse().forEach((tx, i) => {
                    const date = tx.time ? new Date(tx.time).toLocaleString() : "𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐃𝐚𝐭𝐞";
                    const method = tx.method ? ` [${tx.method}]` : '';
                    
                    if (tx.type === "received") {
                        historyText += `${(i + 1).toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}. 📥 𝐑𝐄𝐂𝐄𝐈𝐕𝐄𝐃${method}\n`;
                        historyText += `   +${this.formatMoney(tx.amount)} 𝐁𝐃𝐓\n`;
                        historyText += `   𝐅𝐫𝐨𝐦: ${tx.from || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧"}\n`;
                        historyText += `   📅 ${date}\n\n`;
                    } else {
                        historyText += `${(i + 1).toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}. 📤 𝐒𝐄𝐍𝐓${method}\n`;
                        historyText += `   -${this.formatMoney(tx.amount)} 𝐁𝐃𝐓\n`;
                        historyText += `   𝐓𝐨: ${tx.to || "𝐔𝐧𝐤𝐧𝐨𝐰𝐧"}\n`;
                        historyText += `   📅 ${date}\n\n`;
                    }
                });
            }
            
            return message.reply(historyText);
        }

        // Leaderboard
        if (action === "leaderboard") {
            const allUsers = await usersData.getAll();
            const richList = [];
            
            for (const [userId, userData] of Object.entries(allUsers)) {
                if (userData.data?.bank?.registered && userData.data.bank.balance > 0) {
                    richList.push({
                        name: userData.name || "𝐔𝐬𝐞𝐫",
                        balance: userData.data.bank.balance,
                        type: userData.data.bank.accountType || "𝐒𝐭𝐚𝐧𝐝𝐚𝐫𝐝",
                        id: userId
                    });
                }
            }
            
            richList.sort((a, b) => b.balance - a.balance);
            
            let lbText = "👑 𝐖𝐄𝐀𝐋𝐓𝐇 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃\n━━━━━━━━━━━━━━━━━━━\n";
            
            if (richList.length === 0) {
                lbText += "𝐍𝐨 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫𝐞𝐝 𝐮𝐬𝐞𝐫𝐬 𝐲𝐞𝐭.\n";
            } else {
                richList.slice(0, 10).forEach((user, index) => {
                    const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${(index+1).toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}.`;
                    lbText += `${medal} ${user.name}\n`;
                    lbText += `   💰 ${this.formatMoney(user.balance)} 𝐁𝐃𝐓\n`;
                    lbText += `   🏦 ${user.type}\n\n`;
                });
            }
            
            return message.reply(lbText);
        }

        // Account Details
        if (action === "account") {
            const activeCodes = bank.atmCodes?.filter(c => !c.used && c.expiresAt > Date.now()).length || 0;
            const activeFD = bank.fixedDeposits?.filter(fd => !fd.withdrawn).length || 0;
            
            let loanInfo = "𝐍𝐨 𝐚𝐜𝐭𝐢𝐯𝐞 𝐥𝐨𝐚𝐧";
            if (bank.loan && bank.loan.amount > 0) {
                loanInfo = `${this.formatMoney(bank.loan.amount)} 𝐁𝐃𝐓 (𝐃𝐮𝐞: ${new Date(bank.loan.dueDate).toLocaleDateString()})`;
            }
            
            return message.reply(
`💳 𝐀𝐂𝐂𝐎𝐔𝐍𝐓 𝐃𝐄𝐓𝐀𝐈𝐋𝐒
━━━━━━━━━━━━━━━━━━━
🏦 𝐁𝐚𝐧𝐤: 𝐔𝐥𝐭𝐢𝐦𝐚𝐭𝐞 𝐁𝐚𝐧𝐤
👤 𝐇𝐨𝐥𝐝𝐞𝐫: ${data.name || "𝐔𝐬𝐞𝐫"}
📈 𝐀𝐜𝐜𝐨𝐮𝐧𝐭: ${bank.accountNumber}
🏷️ 𝐓𝐲𝐩𝐞: ${bank.accountType}
💴 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: ${this.formatMoney(bank.balance)} 𝐁𝐃𝐓
💎 𝐒𝐚𝐯𝐢𝐧𝐠𝐬: ${this.formatMoney(bank.savings || 0)} 𝐁𝐃𝐓
📊 𝐂𝐫𝐞𝐝𝐢𝐭 𝐒𝐜𝐨𝐫𝐞: ${bank.creditScore.toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}
🏧 𝐀𝐓𝐌 𝐂𝐨𝐝𝐞𝐬: ${activeCodes.toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')} 𝐚𝐜𝐭𝐢𝐯𝐞
🏦 𝐅𝐃 𝐂𝐨𝐮𝐧𝐭: ${activeFD.toString().split('').map(d => String.fromCharCode(120783 + parseInt(d))).join('')}
💰 𝐋𝐨𝐚𝐧: ${loanInfo}
📅 𝐉𝐨𝐢𝐧𝐞𝐝: ${bank.createdAt ? new Date(bank.createdAt).toLocaleDateString() : "𝐍/𝐀"}
━━━━━━━━━━━━━━━━━━━`
            );
        }

        // Default Menu (with full stylish text)
        return message.reply(
`🏦 𝐔𝐋𝐓𝐈𝐌𝐀𝐓𝐄 𝐁𝐀𝐍𝐊 𝐌𝐄𝐍𝐔
━━━━━━━━━━━━━━━━━━━
💳 𝐀𝐂𝐂𝐎𝐔𝐍𝐓:
• 𝐫𝐞𝐠𝐢𝐬𝐭𝐞𝐫 - 𝐎𝐩𝐞𝐧 𝐚𝐜𝐜𝐨𝐮𝐧𝐭
• 𝐛𝐚𝐥𝐚𝐧𝐜𝐞 - 𝐂𝐡𝐞𝐜𝐤 𝐛𝐚𝐥𝐚𝐧𝐜𝐞
• 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 - 𝐀𝐜𝐜𝐨𝐮𝐧𝐭 𝐝𝐞𝐭𝐚𝐢𝐥𝐬

💳 𝐀𝐓𝐌 𝐂𝐀𝐑𝐃:
• 𝐜𝐚𝐫𝐝 - 𝐕𝐢𝐞𝐰 𝐀𝐓𝐌 𝐜𝐚𝐫𝐝
• 𝐜𝐚𝐫𝐝 𝐛𝐚𝐜𝐤 - 𝐕𝐢𝐞𝐰 𝐜𝐚𝐫𝐝 𝐛𝐚𝐜𝐤
• 𝐜𝐚𝐫𝐝 𝐝𝐞𝐬𝐢𝐠𝐧𝐬 - 𝐀𝐥𝐥 𝐝𝐞𝐬𝐢𝐠𝐧𝐬
• 𝐚𝐭𝐦𝐜𝐨𝐝𝐞 - 𝐆𝐞𝐧𝐞𝐫𝐚𝐭𝐞 𝐀𝐓𝐌 𝐜𝐨𝐝𝐞
• 𝐚𝐭𝐦𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰 - 𝐔𝐬𝐞 𝐀𝐓𝐌 𝐜𝐨𝐝𝐞

💸 𝐓𝐑𝐀𝐍𝐒𝐀𝐂𝐓𝐈𝐎𝐍𝐒:
• 𝐝𝐞𝐩𝐨𝐬𝐢𝐭 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐀𝐝𝐝 𝐦𝐨𝐧𝐞𝐲
• 𝐰𝐢𝐭𝐡𝐝𝐫𝐚𝐰 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐓𝐚𝐤𝐞 𝐦𝐨𝐧𝐞𝐲
• 𝐬𝐞𝐧𝐝 <@𝐮𝐬𝐞𝐫> <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐒𝐞𝐧𝐝 𝐦𝐨𝐧𝐞𝐲
• 𝐭𝐫𝐚𝐧𝐬𝐟𝐞𝐫 <𝐚𝐜𝐜#> <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐁𝐲 𝐚𝐜𝐜𝐨𝐮𝐧𝐭

💰 𝐈𝐍𝐕𝐄𝐒𝐓𝐌𝐄𝐍𝐓𝐒:
• 𝐟𝐝 - 𝐅𝐢𝐱𝐞𝐝 𝐃𝐞𝐩𝐨𝐬𝐢𝐭
• 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭 - 𝐂𝐨𝐥𝐥𝐞𝐜𝐭 𝐢𝐧𝐭𝐞𝐫𝐞𝐬𝐭

🏦 𝐋𝐎𝐀𝐍𝐒:
• 𝐥𝐨𝐚𝐧 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐀𝐩𝐩𝐥𝐲 𝐥𝐨𝐚𝐧
• 𝐫𝐞𝐩𝐚𝐲 <𝐚𝐦𝐨𝐮𝐧𝐭> - 𝐑𝐞𝐩𝐚𝐲 𝐥𝐨𝐚𝐧

📊 𝐎𝐓𝐇𝐄𝐑𝐒:
• 𝐡𝐢𝐬𝐭𝐨𝐫𝐲 - 𝐅𝐮𝐥𝐥 𝐡𝐢𝐬𝐭𝐨𝐫𝐲
• 𝐦𝐢𝐧𝐢𝐬𝐭𝐚𝐭𝐞𝐦𝐞𝐧𝐭 - 𝐋𝐚𝐬𝐭 𝟓
• 𝐥𝐞𝐚𝐝𝐞𝐫𝐛𝐨𝐚𝐫𝐝 - 𝐓𝐨𝐩 𝟏𝟎 𝐫𝐢𝐜𝐡

━━━━━━━━━━━━━━━━━━━
💡 𝐄𝐱𝐚𝐦𝐩𝐥𝐞:
bank card visa_platinum
bank card back
bank atmcode`
        );
    }
};
