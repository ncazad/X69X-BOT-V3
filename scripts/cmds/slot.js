module.exports = {
  config: {
    name: "slot",
    version: "0.0.7",
    author: "Azadx69x",
    description: {
      role: 0,
      en: "🎰 𝐀 𝐟𝐚𝐧𝐜𝐲 𝐬𝐥𝐨𝐭 𝐦𝐚𝐜𝐡𝐢𝐧𝐞 𝐠𝐚𝐦𝐞 𝐰𝐢𝐭𝐡 𝐣𝐚𝐜𝐤𝐩𝐨𝐭𝐬, 𝐛𝐨𝐧𝐮𝐬𝐞𝐬",
    },
    category: "game",
    guide: {
      en: "{pn} <amount> - 𝐏𝐥𝐚𝐲 𝐬𝐥𝐨𝐭 𝐦𝐚𝐜𝐡𝐢𝐧𝐞 (use 1k, 1m, 1b, 1t)\n{pn} stats - 𝐕𝐢𝐞𝐰 𝐲𝐨𝐮𝐫 𝐬𝐭𝐚𝐭𝐬"
    },
    cooldown: 3
  },
  langs: {
    en: {
      invalid_amount: "⚠️ 𝐄𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐚𝐦𝐨𝐮𝐧𝐭 (e.g., 1000, 1k, 1m, 1b, 1t)",
      not_enough_money: "💸 𝐘𝐨𝐮 𝐝𝐨𝐧'𝐭 𝐡𝐚𝐯𝐞 𝐞𝐧𝐨𝐮𝐠𝐡 𝐛𝐚𝐥𝐚𝐧𝐜𝐞!",
      win_message: "𝐘𝐨𝐮 𝐰𝐨𝐧 $%1!",
      lose_message: "𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 $%1!",
      jackpot_message: "𝐉𝐀𝐂𝐊𝐏𝐎𝐓!! 𝐘𝐨𝐮 𝐰𝐨𝐧 $%1!",
      mega_jackpot: "𝐌𝐄𝐆𝐀 𝐉𝐀𝐂𝐊𝐏𝐎𝐓!! 𝐘𝐨𝐮 𝐰𝐨𝐧 $%1!",
      balance_message: "𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $%1",
      bonus_round: "𝐁𝐎𝐍𝐔𝐒 𝐑𝐎𝐔𝐍𝐃! 𝐄𝐱𝐭𝐫𝐚 $%1!",
      free_spin: "𝐅𝐑𝐄𝐄 𝐒𝐏𝐈𝐍 𝐀𝐖𝐀𝐑𝐃𝐄𝐃!",
      combo_message: "%1x 𝐂𝐎𝐌𝐁𝐎! 𝐌𝐮𝐥𝐭𝐢𝐩𝐥𝐢𝐞𝐫 x%2",
      stats_title: "𝐘𝐨𝐮𝐫 𝐒𝐭𝐚𝐭𝐬",
      limit_reached: "⏰ 𝐒𝐩𝐢𝐧 𝐋𝐢𝐦𝐢𝐭 𝐑𝐞𝐚𝐜𝐡𝐞𝐝! 𝐘𝐨𝐮'𝐯𝐞 𝐮𝐬𝐞𝐝 𝐚𝐥𝐥 %3 𝐬𝐩𝐢𝐧𝐬.\n🕐 𝐂𝐨𝐦𝐞 𝐛𝐚𝐜𝐤 𝐢𝐧 %1 𝐡𝐨𝐮𝐫𝐬 %2 𝐦𝐢𝐧𝐮𝐭𝐞𝐬",
      spins_remaining: "𝐒𝐩𝐢𝐧𝐬 𝐫𝐞𝐦𝐚𝐢𝐧𝐢𝐧𝐠 : %1/%2"
    },
  },
  onStart: async function ({ args, message, event, usersData, getLang }) {
    const { senderID } = event;
    const command = args[0]?.toLowerCase();
    
    if (command === "stats") {
      return await showStats(senderID, usersData, message, getLang);
    }
    
    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { 
        money: 1000, 
        data: { 
          slotStats: { 
            totalSpins: 0, 
            totalWon: 0, 
            totalLost: 0, 
            jackpots: 0,
            bestWin: 0,
            currentStreak: 0,
            maxStreak: 0,
            spinsUsed: 0,
            lastResetTime: 0,
            nextResetTime: 0
          } 
        } 
      };
    }
    
    if (!userData.data) {
      userData.data = {};
    }
    
    if (!userData.data.slotStats) {
      userData.data.slotStats = {
        totalSpins: 0,
        totalWon: 0,
        totalLost: 0,
        jackpots: 0,
        bestWin: 0,
        currentStreak: 0,
        maxStreak: 0,
        spinsUsed: 0,
        lastResetTime: 0,
        nextResetTime: 0
      };
    }

    const stats = userData.data.slotStats;
    const currentTime = Date.now();
    const SPIN_LIMIT = 100;
    const RESET_INTERVAL = 5 * 60 * 60 * 1000;
    
    stats.spinsUsed = parseInt(stats.spinsUsed) || 0;
    stats.nextResetTime = parseInt(stats.nextResetTime) || 0;
    stats.lastResetTime = parseInt(stats.lastResetTime) || 0;
    
    if (currentTime >= stats.nextResetTime) {
      if (stats.nextResetTime !== 0) {
        stats.spinsUsed = 0;
      }
      stats.lastResetTime = currentTime;
      stats.nextResetTime = currentTime + RESET_INTERVAL;
    }
    
    if (stats.spinsUsed >= SPIN_LIMIT) {
      const remainingTime = stats.nextResetTime - currentTime;
      const remainingHours = Math.floor(remainingTime / (60 * 60 * 1000));
      const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      return message.reply(getLang("limit_reached", remainingHours, remainingMinutes, SPIN_LIMIT));
    }
    
    const betInput = args[0]?.toLowerCase();
    if (!betInput) {
      return message.reply(getLang("invalid_amount"));
    }
    
    const betAmount = parseShortcutAmount(betInput);
    
    if (isNaN(betAmount) || betAmount <= 0) {
      return message.reply(getLang("invalid_amount"));
    }
    if (betAmount > userData.money) {
      return message.reply(getLang("not_enough_money"));
    }
    
    stats.spinsUsed++;
    stats.totalSpins++;
    
    const symbols = [
      { icon: "🍌", name: "banana", weight: 3, value: 50 },   
      { icon: "7️⃣", name: "seven", weight: 5, value: 25 },     
      { icon: "🔔", name: "bell", weight: 6, value: 15 },      
      { icon: "🍒", name: "cherry", weight: 8, value: 10 },      
      { icon: "🍋", name: "lemon", weight: 10, value: 8 },       
      { icon: "🍇", name: "grape", weight: 10, value: 6 },      
      { icon: "💙", name: "blue", weight: 12, value: 4 },    
      { icon: "💜", name: "purple", weight: 12, value: 3 }     
    ];
    
    const roll = () => {
      const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
      let random = Math.random() * totalWeight;
      for (const symbol of symbols) {
        random -= symbol.weight;
        if (random <= 0) return symbol;
      }
      return symbols[symbols.length - 1];
    };
    
    const slotResults = [roll(), roll(), roll(), roll(), roll()];
    const slotIcons = slotResults.map(s => s.icon);
    
    let result = calculateWin(slotResults, betAmount, symbols);
    let winnings = result.amount;
    let isJackpot = result.isJackpot;
    let isMegaJackpot = result.isMegaJackpot;
    
    if (winnings === 0) {
      const counts = {};
      slotResults.forEach(s => {
        counts[s.name] = (counts[s.name] || 0) + 1;
      });
      
      for (const [name, count] of Object.entries(counts)) {
        if (count === 2) {
          winnings = Math.floor(betAmount * 0.5);
          break;
        }
      }
    }
    
    if (winnings === 0 && Math.random() < 0.15) {
      winnings = Math.floor(betAmount * 1.1);
    }
    
    if (winnings > 0) {
      stats.currentStreak++;
      if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }
    
    let comboMultiplier = 1;
    let displayMultiplier = 1;
    if (stats.currentStreak >= 2) { 
      comboMultiplier = Math.min(1 + (stats.currentStreak * 0.2), 3);
      displayMultiplier = comboMultiplier;
      winnings = Math.floor(winnings * comboMultiplier);
    }
    
    const cloverCount = slotResults.filter(s => s.name === "purple").length;
    let bonusAmount = 0;
    if (cloverCount >= 2) {
      bonusAmount = Math.floor(betAmount * cloverCount * 0.3);
      winnings += bonusAmount;
    }
    
    let freeSpin = false;
    if (!isJackpot && Math.random() < 0.10) {
      freeSpin = true;
      stats.spinsUsed--;
    }
    
    if (winnings > 0) {
      userData.money += winnings;
      stats.totalWon += winnings;
      if (winnings > stats.bestWin) stats.bestWin = winnings;
      if (isJackpot || isMegaJackpot) stats.jackpots++;
    } else {
      userData.money -= betAmount;
      stats.totalLost += betAmount;
    }

    await usersData.set(senderID, userData);
    
    const remainingSpins = SPIN_LIMIT - stats.spinsUsed;
    const msg = formatResult(slotIcons, winnings, betAmount, userData.money, getLang, {
      isJackpot,
      isMegaJackpot,
      comboMultiplier: stats.currentStreak >= 2 ? stats.currentStreak : 0,
      displayMultiplier: displayMultiplier,
      bonusAmount,
      freeSpin,
      streak: stats.currentStreak,
      remainingSpins: remainingSpins,
      spinLimit: SPIN_LIMIT,
      mercyWin: winnings > 0 && result.amount === 0 && !result.isJackpot && !result.isMegaJackpot,
      nextResetTime: stats.nextResetTime
    });

    return message.reply(msg);
  },
};

function parseShortcutAmount(input) {
  const multipliers = {
    'k': 1000,
    'm': 1000000,
    'b': 1000000000,
    't': 1000000000000
  };
  
  const match = input.match(/^(\d+\.?\d*)([kmbt]?)$/i);
  if (!match) return NaN;
  
  const number = parseFloat(match[1]);
  const suffix = match[2].toLowerCase();
  
  if (suffix && multipliers[suffix]) {
    return Math.floor(number * multipliers[suffix]);
  }
  
  return Math.floor(number);
}

function calculateWin(slots, betAmount, symbolData) {
  const counts = {};
  slots.forEach(s => {
    counts[s.name] = (counts[s.name] || 0) + 1;
  });
  
  for (const [name, count] of Object.entries(counts)) {
    if (count === 5) {
      if (name === "banana") {
        return { amount: betAmount * 100, isJackpot: true, isMegaJackpot: true };
      }
      return { amount: betAmount * 50, isJackpot: true, isMegaJackpot: false };
    }
  }
  
  for (const [name, count] of Object.entries(counts)) {
    if (count === 4) {
      return { amount: betAmount * 10, isJackpot: false, isMegaJackpot: false };
    }
  }
  
  for (const [name, count] of Object.entries(counts)) {
    if (count === 3) {
      return { amount: betAmount * 5, isJackpot: false, isMegaJackpot: false };
    }
  }

  return { amount: 0, isJackpot: false, isMegaJackpot: false };
}

function formatResult(slots, winnings, betAmount, balance, getLang, options) {
  const { isJackpot, isMegaJackpot, comboMultiplier, displayMultiplier, bonusAmount, freeSpin, streak, remainingSpins, spinLimit, mercyWin, nextResetTime } = options;
  
  const slotLine = `【 ${slots.join(" | ")} 】`;
  
  let display = slotLine + "\n";
  
  if (isMegaJackpot) {
    display += "🔥 𝐌𝐄𝐆𝐀 𝐉𝐀𝐂𝐊𝐏𝐎𝐓!! 𝐘𝐨𝐮 𝐰𝐨𝐧 $" + formatNumber(winnings) + "!\n";
  } else if (isJackpot) {
    display += "🎉 𝐉𝐀𝐂𝐊𝐏𝐎𝐓!! 𝐘𝐨𝐮 𝐰𝐨𝐧 $" + formatNumber(winnings) + "!\n";
  } else if (mercyWin) {
    display += "✨ 𝐋𝐮𝐜𝐤𝐲 𝐖𝐢𝐧! 𝐘𝐨𝐮 𝐰𝐨𝐧 $" + formatNumber(winnings) + "!\n";
  } else if (winnings > 0) {
    display += "✅ 𝐘𝐨𝐮 𝐰𝐨𝐧 $" + formatNumber(winnings) + "!\n";
  } else {
    display += "❌ 𝐘𝐨𝐮 𝐥𝐨𝐬𝐭 $" + formatNumber(betAmount) + "!\n";
  }
  
  if (comboMultiplier > 0) {
    display += "⚡ " + comboMultiplier + "x 𝐂𝐎𝐌𝐁𝐎! 𝐌𝐮𝐥𝐭𝐢𝐩𝐥𝐢𝐞𝐫 x" + displayMultiplier.toFixed(1) + "\n";
  }
  
  if (bonusAmount > 0) {
    display += "🎁 𝐁𝐎𝐍𝐔𝐒! 𝐄𝐱𝐭𝐫𝐚 $" + formatNumber(bonusAmount) + "\n";
  }
  
  if (streak > 0) {
    display += "🔥 𝐖𝐢𝐧 𝐒𝐭𝐫𝐞𝐚𝐤: " + streak + "\n";
  }
  
  display += "💰 𝐁𝐚𝐥𝐚𝐧𝐜𝐞: $" + formatNumber(balance) + "\n";
  display += "🎰 𝐒𝐩𝐢𝐧𝐬: " + remainingSpins + "/" + spinLimit;
  
  if (freeSpin) {
    display += "\n🔄 𝐅𝐑𝐄𝐄 𝐒𝐏𝐈𝐍! (𝐍𝐨 𝐥𝐢𝐦𝐢𝐭 𝐮𝐬𝐞𝐝)";
  }
  
  if (nextResetTime && remainingSpins < spinLimit) {
    const now = Date.now();
    const timeLeft = nextResetTime - now;
    if (timeLeft > 0) {
      const hours = Math.floor(timeLeft / (60 * 60 * 1000));
      const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
      display += "\n⏰ 𝐑𝐞𝐬𝐞𝐭 𝐢𝐧: " + hours + "h " + minutes + "m";
    }
  }

  return display;
}

async function showStats(senderID, usersData, message, getLang) {
  const userData = await usersData.get(senderID);
  
  let stats = {
    totalSpins: 0, 
    totalWon: 0, 
    totalLost: 0, 
    jackpots: 0, 
    bestWin: 0, 
    maxStreak: 0, 
    spinsUsed: 0, 
    lastResetTime: 0, 
    nextResetTime: 0
  };
  
  if (userData && userData.data && userData.data.slotStats) {
    stats = userData.data.slotStats;
  }
  
  stats.totalSpins = parseInt(stats.totalSpins) || 0;
  stats.totalWon = parseInt(stats.totalWon) || 0;
  stats.totalLost = parseInt(stats.totalLost) || 0;
  stats.jackpots = parseInt(stats.jackpots) || 0;
  stats.bestWin = parseInt(stats.bestWin) || 0;
  stats.maxStreak = parseInt(stats.maxStreak) || 0;
  stats.spinsUsed = parseInt(stats.spinsUsed) || 0;
  stats.nextResetTime = parseInt(stats.nextResetTime) || 0;

  const winRate = stats.totalSpins > 0 
    ? ((stats.totalWon / (stats.totalWon + stats.totalLost)) * 100).toFixed(1) 
    : 0;

  const SPIN_LIMIT = 100;
  const currentTime = Date.now();
  const remainingSpins = SPIN_LIMIT - stats.spinsUsed;
  
  let timeStatus = "✅ 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞";
  if (remainingSpins <= 0) {
    const remainingTime = stats.nextResetTime - currentTime;
    if (remainingTime > 0) {
      const hours = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      timeStatus = `⏳ ${hours}h ${minutes}m`;
    } else {
      timeStatus = "✅ 𝐑𝐞𝐚𝐝𝐲 (𝐏𝐥𝐚𝐲 𝐭𝐨 𝐫𝐞𝐟𝐫𝐞𝐬𝐡)";
    }
  }

  const msg = `📊 𝐒𝐋𝐎𝐓 𝐒𝐓𝐀𝐓𝐒 📊

🎰 𝐓𝐨𝐭𝐚𝐥 𝐒𝐩𝐢𝐧𝐬: ${stats.totalSpins}
💰 𝐓𝐨𝐭𝐚𝐥 𝐖𝐨𝐧: $${formatNumber(stats.totalWon)}
💸 𝐓𝐨𝐭𝐚𝐥 𝐋𝐨𝐬𝐭: $${formatNumber(stats.totalLost)}
🏆 𝐉𝐚𝐜𝐤𝐩𝐨𝐭𝐬: ${stats.jackpots}
⭐ 𝐁𝐞𝐬𝐭 𝐖𝐢𝐧: $${formatNumber(stats.bestWin)}
🔥 𝐌𝐚𝐱 𝐒𝐭𝐫𝐞𝐚𝐤: ${stats.maxStreak}
📈 𝐖𝐢𝐧 𝐑𝐚𝐭𝐞: ${winRate}%
🎰 𝐒𝐩𝐢𝐧𝐬 𝐋𝐞𝐟𝐭: ${remainingSpins}/${SPIN_LIMIT}
⏰ 𝐍𝐞𝐱𝐭 𝐑𝐞𝐬𝐞𝐭: ${timeStatus}`;

  return message.reply(msg);
}

function formatNumber(num) {
  if (!num || isNaN(num)) return "0";
  if (num >= 1000000000000) return (num / 1000000000000).toFixed(1) + "𝐓";
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "𝐁";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "𝐌";
  if (num >= 1000) return (num / 1000).toFixed(1) + "𝐊";
  return num.toString();
}
