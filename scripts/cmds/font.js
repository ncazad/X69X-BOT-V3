module.exports = {
  config: {
    name: "font",
    aliases: ["fonts"],
    version: "0.0.8",
    author: "Azadx69x",
    role: 0,
    shortDescription: "Convert text to global font",
    longDescription: "Generate the bot global font style",
    category: "utility",
    guide: {
      en: "{pn} <text> - Convert text"
    }
  },

  onStart: async function({ message, args }) {
    if (!args.length) {
      return message.reply("Usage: font <text>");
    }
    return message.reply(global.utils.toGlobalFontStyle(args.join(" ")));
  }
};
