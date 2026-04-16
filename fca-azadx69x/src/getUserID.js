/**
 * fca-azadx69x
 * fixed by @Azadx69x
 */

"use strict";

const utils = require("../utils");
const log = require("npmlog");
const axios = require("axios");

function formatUserData(data) {
  return {
    userID: utils.formatID(data.uid?.toString() || ""),
    name: data.text || "",
    photoUrl: data.photo || "",
    profileUrl: data.path || "",
    indexRank: data.index_rank || 0,
    isVerified: data.is_verified || false,
    category: data.category || "",
    score: data.score || 0,
    type: data.type || ""
  };
}

module.exports = function(defaultFuncs, api, ctx) {
  return function getUserID(name, callback) {
    
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = (err, result) => {
        if (err) return rejectFunc(err);
        resolveFunc(result);
      };
    }

    if (!name) {
      const err = new Error("Name parameter is required");
      log.error("getUserID", err);
      return callback(err);
    }

    
    const form = {
      value: name.toLowerCase(),
      viewer: ctx.userID,
      rsp: "search",
      context: "search",
      path: "/home.php",
      request_id: ctx.clientId
    };

    
    defaultFuncs
      .get("https://www.facebook.com/ajax/typeahead/search.php", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(resData => {
        if (resData.error) throw resData;

        const entries = resData.payload?.entries || [];
        const formatted = entries.map(formatUserData);

        callback(null, formatted);
      })
      .catch(err => {
        log.error("getUserID", err);
        callback(err);
      });

    return returnPromise;
  };
};
