const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const fontUrl = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/font.json";
const categoryUrl = "https://raw.githubusercontent.com/Azadwebapi/Azadx69x-bm-store/main/category.json";

let fontMap = {};
let categoryMap = {};
let isLoading = false;

async function loadFont() {
  try {
    const res = await axios.get(fontUrl, { timeout: 5000 });
    fontMap = res.data || {};
  } catch (err) {
    console.error("❌ Font load failed:", err.message);
  }
}

async function loadCategory() {
  if (isLoading) return;
  isLoading = true;
  
  try {
    const res = await axios.get(categoryUrl, { timeout: 5000 });
    const rawData = res.data || {};
    categoryMap = {};
    
    Object.keys(rawData).forEach(key => {
      categoryMap[key.toLowerCase().trim()] = rawData[key];
    });
    
    console.log("✅ Categories loaded:", Object.keys(categoryMap).length);
  } catch (err) {
    console.error("❌ Category load failed:", err.message);
    categoryMap = {};
  } finally {
    isLoading = false;
  }
}

function toBold(text) {
  if (!text) return "";
  return text.split("").map(ch => fontMap[ch] || ch).join("");
}

function getCategoryEmoji(category) {
  if (Object.keys(categoryMap).length === 0 && !isLoading) {
    loadCategory();
  }
  
  const cat = (category || "").toLowerCase().trim();
  return categoryMap[cat] || "📁";
}

module.exports = {
  config: {
    name: "help",
    version: "0.0.7",
    author: "Azadx69x",
    role: 0,
    countDown: 5,
    description: { 
      en: "📚 Show command list or command details" 
    },
    category: "Info",
    guide: {
      en: "{pn} [command_name]"
    }
  },

  onStart: async function ({ message, args, event, role }) {
    if (Object.keys(fontMap).length === 0) await loadFont();
    if (Object.keys(categoryMap).length === 0) await loadCategory();
    
    const prefix = getPrefix(event.threadID);
    const input = args[0]?.toLowerCase();

    let cmd = null;
    
    if (input) {
      if (commands.has(input)) {
        cmd = commands.get(input);
      } else if (aliases.has(input)) {
        cmd = commands.get(aliases.get(input));
      } else {
        return message.reply(
`❌ 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗
🔍 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: "${input}"`
        );
      }
    }
    
    if (cmd) {
      const cfg = cmd.config;
      const desc = typeof cfg.description === "string" ? cfg.description : cfg.description?.en || "❌ 𝗡𝗼 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻";
      const usage = typeof cfg.guide?.en === "string" ? 
        cfg.guide.en.replace(/\{pn\}/g, prefix + cfg.name) : 
        `${prefix}${cfg.name}`;

      const aliasesList = cfg.aliases ? 
        cfg.aliases.map(a => `${prefix}${a}`).join(", ") : 
        "❌ 𝗡𝗼𝗻𝗲";

      const helpMessage = `┍━━━[ 📚 ${toBold("X69X HELP")} ]━━━◊
┋➥ 📛 ${toBold("Name")}: ${prefix}${cfg.name}
┋➥ 🗂️ ${toBold("Category")}: ${getCategoryEmoji(cfg.category)} ${cfg.category || "❌ 𝗨𝗻𝗰𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝘇𝗲𝗱"}
┋➥ 📄 ${toBold("Description")}: ${desc}
┋➥ ⚙️ ${toBold("Version")}: ${cfg.version || "1.0"}
┋➥ ⏳ ${toBold("Cooldown")}: ${cfg.countDown || 1}s
┋➥ 🔒 ${toBold("Role")}: ${cfg.role === 0 ? "👤 𝗔𝗹𝗹" : cfg.role === 1 ? "👑 𝗔𝗱𝗺𝗶𝗻" : "⚡ 𝗢𝘄𝗻𝗲𝗿"}
┋➥ 👑 ${toBold("Author")}: ${cfg.author || "❌ 𝗨𝗻𝗸𝗻𝗼𝘄𝗻"}
┋➥ 🔤 ${toBold("Aliases")}: ${aliasesList}
┍━━━[ 📘 ${toBold("USAGE")} ]━━━◊
${usage.split('\n').map(line => `┋➥ ${line}`).join('\n')}
┍━━━[ 💡 ${toBold("NOTES")} ]━━━◊
┋➥ <text> = Replaceable content
┋➥ [a|b] = Choose option a or b
┋➥ ( ) = Optional parameter
┋➥ {pn} = Bot prefix
┕━━━━━━━━━━━━━━━━◊`;
        
      try {
        await message.reply({
          body: helpMessage,
          attachment: await global.utils.getStreamFromURL("https://i.ibb.co/5X9T2dDN/image0.gif")
        });
      } catch (error) {
        console.log("GIF attachment failed, sending text only:", error);
        await message.reply(helpMessage);
      }
      return;
    }
      
    const categories = {};
    for (const [, c] of commands) {
      if (c.config.role > role) continue;
      const cat = c.config.category || "Uncategorized";
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(c.config.name);
    }

    let msg = `┍━━━[ 📚 ${toBold("X69X MENU")} ]━━━◊\n`;
      
    const sortedCategories = Object.keys(categories).sort();
    
    for (const cat of sortedCategories) {
      const categoryName = toBold(cat.toUpperCase());
      const commandsList = categories[cat].sort();
      const emoji = getCategoryEmoji(cat);
      
      msg += `┍━━━[ ${emoji} ${categoryName} ]━━━◊\n`;
        
      for (let i = 0; i < commandsList.length; i += 2) {
        const cmd1 = commandsList[i];
        const cmd2 = commandsList[i + 1];
        
        const line = cmd2 ? 
          `┋➥ ${cmd1.padEnd(15)} ${cmd2}` :
          `┋➥ ${cmd1}`;
        
        msg += line + "\n";
      }
      
      msg += "┕━━━━━━━━━━━━━━━━━◊\n";
    }

    msg += `┍━━━[ 🚀 ${toBold("INFO")} ]━━━◊
┋➥ ${toBold("Welcome to X69X Bot!")}
┋➥ ${toBold("Prefix")}: [ ${prefix} ]
┋➥ ${toBold("Developer")}: Azadx69x
┋➥ ${toBold("Use")}: ${prefix}help <command>
┕━━━━━━━━━━━━━━━━◊`;
      
    try {
      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL("https://i.ibb.co/5X9T2dDN/image0.gif")
      });
    } catch (error) {
      console.log("GIF attachment failed, sending text only:", error);
      await message.reply(msg);
    }
  }
};
