/**
 * fca-azadx69x
 * fixed by @Azadx69x
 */

"use strict";

const util = require("util");

module.exports = function () {
  return function getEmojiUrl(c, size, pixelRatio) {
    
    const baseUrl = "https://static.xx.fbcdn.net/images/emoji.php/v8/z%s/%s";
    pixelRatio = pixelRatio || "1.0";

    const ending = util.format(
      "%s/%s/%s.png",
      pixelRatio,
      size,
      c.codePointAt(0).toString(16),
    );
    let base = 317426846;
    for (let i = 0; i < ending.length; i++) {
      base = (base << 5) - base + ending.charCodeAt(i);
    }

    const hashed = (base & 255).toString(16);
    return util.format(baseUrl, hashed, ending);
  };
};
