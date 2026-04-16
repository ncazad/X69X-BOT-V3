/**
 * fca-azadx69x
 * fixed by @Azadx69x
 */

"use strict";

module.exports = function(defaultFuncs, api, ctx) {
  return function getCurrentUserID() {
    return ctx.userID;
  };
};
