const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");

const VALID_VOICES = [
  "girls", "female", "woman", "girl", "f", "mahiya",
  "boys",  "male",   "man",   "boy",  "m", "babu"
];

const VOICE_MAP = {
  male: "boys",
  man: "boys",
  m: "boys",
  boy: "boys",
  babu: "boys",
  female: "girls",
  woman: "girls",
  f: "girls",
  girl: "girls",
  mahiya: "girls"
};

const LANG_MAP = {
  bn: "bn-BD", bangla: "bn-BD", bengali: "bn-BD",
  en: "en-US", english: "en-US",
  hi: "hi-IN", hindi: "hi-IN",
  ur: "ur-PK", urdu: "ur-PK",
  ar: "ar-SA", arabic: "ar-SA",
  es: "es-ES", spanish: "es-ES",
  fr: "fr-FR", french: "fr-FR",
  de: "de-DE", german: "de-DE",
  ja: "ja-JP", japanese: "ja-JP",
  ko: "ko-KR", korean: "ko-KR",
  zh: "zh-CN", chinese: "zh-CN",
  ru: "ru-RU", russian: "ru-RU",
  pt: "pt-BR", portuguese: "pt-BR",
  tr: "tr-TR", turkish: "tr-TR",
  vi: "vi-VN", vietnamese: "vi-VN",
  id: "id-ID", indonesian: "id-ID",
  th: "th-TH", thai: "th-TH"
};

const API_BASE = "https://azadx69x.is-a.dev";

module.exports = {
  config: {
    name: "say",
    version: "2.0.0",
    author: "Azadx69x",
    countDown: 5,
    role: 0,
    description: "Text to speech with random reply feature",
    category: "utility",
    guide: "{pn} <text> | [voice] | [language] | [format]"
  },

  parseInput: function(input) {
    const parts = input.split(/[\|\-]/).map(p => p.trim()).filter(Boolean);
    const mainText = parts[0] || "";
    const VALID_FORMATS = ["mp3", "mp4"];
    const VALID_LANGS = Object.keys(LANG_MAP);

    let voice = null, language = null, format = null;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].toLowerCase();

      if (!format && VALID_FORMATS.includes(part)) format = part;
      else if (!voice && VALID_VOICES.includes(part)) voice = part;
      else if (!language && VALID_LANGS.includes(part)) language = part;
    }

    return { mainText, voice, language, format };
  },

  generateTTS: async function(mainText, voice, language, format) {
    voice = VOICE_MAP[voice] || voice;
    const mappedLang = LANG_MAP[language.toLowerCase()] || language;

    const apiUrl = `${API_BASE}/api/voice-tts?text=${encodeURIComponent(mainText)}&voice=${encodeURIComponent(voice)}&language=${encodeURIComponent(mappedLang)}&format=${encodeURIComponent(format)}`;

    const res = await axios.get(apiUrl, {
      responseType: "arraybuffer",
      timeout: 30000
    });

    const file = path.join(os.tmpdir(), `tts_${Date.now()}.mp3`);
    fs.writeFileSync(file, Buffer.from(res.data));
    return file;
  },

  onStart: async function({ message, args }) {
    const text = args.join(" ");
    if (!text) return message.reply("❌ Please provide text!");

    let { mainText, voice, language, format } = this.parseInput(text);

    voice    = voice    || "girls";
    language = language || "bn";
    format   = format   || "mp3";

    if (!["mp3", "mp4"].includes(format)) {
      return message.reply("❌ Use mp3/mp4 only");
    }

    try {
      const file = await this.generateTTS(mainText, voice, language, format);

      await message.reply({
        body: "✅ Done!",
        attachment: fs.createReadStream(file)
      });

      setTimeout(() => {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      }, 10000);

    } catch (e) {
      return message.reply(`❌ Failed!\n💡 ${e.message}`);
    }
  },

  onChat: async function({ message, event, args }) {
    if (
      event.messageReply &&
      args[0] &&
      args[0].toLowerCase() === "say"
    ) {
      const text = event.messageReply.body;
      if (!text) return;

      const randomVoices = ["boys", "girls"];
      const voice = randomVoices[Math.floor(Math.random() * randomVoices.length)];

      const language = "bn";
      const format = "mp3";

      try {
        const file = await this.generateTTS(text, voice, language, format);

        await message.reply({
          body: `🎲 Random Voice: ${voice}`,
          attachment: fs.createReadStream(file)
        });

        setTimeout(() => {
          if (fs.existsSync(file)) fs.unlinkSync(file);
        }, 10000);

      } catch (e) {
        return message.reply(`❌ Failed!\n💡 ${e.message}`);
      }
    }
  }
};
