// fixed by @Azadx69x 
"use strict";

const log = require("npmlog");
const utils = require("../utils");

// Custom error class
class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || 'REFRESH_ERROR';
    this.name = 'CustomError';
  }
}

module.exports = function (defaultFuncs, api, ctx) {
  
  /**
   * Extract fb_dtsg from HTML response
   */
  function extractDtsg(html) {
    // Multiple patterns to find fb_dtsg
    const patterns = [
      /"DTSGInitialData",\[],\{"token":"([^"]+)"/,
      /"dtsg":{"token":"([^"]+)"/,
      /name="fb_dtsg" value="([^"]+)"/,
      /"fb_dtsg":"([^"]+)"/,
      /DTSGInitialData\.token\s*=\s*"([^"]+)"/,
      /\["DTSGInitialData",\[\],\{"token":"([^"]+)"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Extract jazoest from fb_dtsg
   */
  function generateJazoest(fbDtsg) {
    if (!fbDtsg) return "";
    let hash = 0;
    for (let i = 0; i < fbDtsg.length; i++) {
      hash = ((hash << 5) - hash) + fbDtsg.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  /**
   * Fetch fresh fb_dtsg from Facebook
   */
  async function fetchFreshDtsg() {
    try {
      // Method 1: Try to get from homepage
      const homeRes = await defaultFuncs.get(
        "https://www.facebook.com/home.php",
        ctx.jar,
        null,
        {
          headers: {
            'User-Agent': ctx.globalOptions.userAgent || 'Mozilla/5.0',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-US,en;q=0.9',
          }
        }
      );

      let dtsg = extractDtsg(homeRes.body || homeRes);
      
      if (dtsg) {
        log.verbose("refreshFb_dtsg", "Found fb_dtsg from homepage");
        return { fb_dtsg: dtsg, source: 'homepage' };
      }

      // Method 2: Try from settings page
      const settingsRes = await defaultFuncs.get(
        "https://www.facebook.com/settings",
        ctx.jar,
        null,
        {
          headers: {
            'User-Agent': ctx.globalOptions.userAgent || 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        }
      );

      dtsg = extractDtsg(settingsRes.body || settingsRes);
      
      if (dtsg) {
        log.verbose("refreshFb_dtsg", "Found fb_dtsg from settings");
        return { fb_dtsg: dtsg, source: 'settings' };
      }

      // Method 3: Try from messenger
      const messengerRes = await defaultFuncs.get(
        "https://www.facebook.com/messages/t",
        ctx.jar,
        null,
        {
          headers: {
            'User-Agent': ctx.globalOptions.userAgent || 'Mozilla/5.0',
            'Accept': 'text/html',
          }
        }
      );

      dtsg = extractDtsg(messengerRes.body || messengerRes);
      
      if (dtsg) {
        log.verbose("refreshFb_dtsg", "Found fb_dtsg from messenger");
        return { fb_dtsg: dtsg, source: 'messenger' };
      }

      throw new Error('Could not extract fb_dtsg from any page');

    } catch (err) {
      log.error("refreshFb_dtsg", "Fetch error:", err);
      throw err;
    }
  }

  /**
   * Validate current session without logout
   */
  async function validateSession() {
    try {
      // Quick check if session is still valid
      const checkRes = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        {
          av: ctx.userID,
          fb_dtsg: ctx.fb_dtsg || '',
          jazoest: generateJazoest(ctx.fb_dtsg || ''),
          query_id: '10153437257793629',
          variables: JSON.stringify({}),
          doc_id: '2587734751553713'
        }
      );

      // If we get here without redirect to login, session is valid
      return true;
    } catch (err) {
      // Check if it's a login redirect (session expired)
      if (err.message && (
        err.message.includes('login') || 
        err.message.includes('Not logged in') ||
        err.statusCode === 302
      )) {
        return false;
      }
      // Other errors might be network, assume session still valid
      return true;
    }
  }

  /**
   * Main refresh function
   */
  return function refreshFb_dtsg(obj, callback) {
    // Parameter handling
    if (typeof obj === "function") {
      callback = obj;
      obj = {};
    }

    if (!obj) obj = {};

    // Validation
    if (typeof obj !== "object" || Array.isArray(obj)) {
      const err = new CustomError(
        "The first parameter must be an object or a callback function",
        'INVALID_PARAM'
      );
      if (callback) callback(err);
      throw err;
    }

    // Promise setup
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = (err, data) => err ? rejectFunc(err) : resolveFunc(data);
    }

    // Wrap callback to prevent double invocation
    let called = false;
    const safeCallback = (err, data) => {
      if (called) return;
      called = true;
      callback(err, data);
    };

    // Main execution
    (async () => {
      try {
        // If obj contains manual values, use them (legacy support)
        if (Object.keys(obj).length > 0 && obj.fb_dtsg) {
          log.info("refreshFb_dtsg", "Using manually provided fb_dtsg");
          
          // Update context
          const oldDtsg = ctx.fb_dtsg;
          Object.assign(ctx, obj);
          
          // Generate jazoest if fb_dtsg changed
          if (ctx.fb_dtsg && ctx.fb_dtsg !== oldDtsg) {
            ctx.jazoest = generateJazoest(ctx.fb_dtsg);
          }

          safeCallback(null, {
            success: true,
            refreshed: Object.keys(obj),
            fb_dtsg: ctx.fb_dtsg ? '[REDACTED]' : null,
            source: 'manual',
            timestamp: new Date().toISOString()
          });
          return;
        }

        // Auto-fetch fresh fb_dtsg
        log.info("refreshFb_dtsg", "Auto-fetching fresh fb_dtsg...");

        // First validate current session
        const isValid = await validateSession();
        
        if (!isValid) {
          log.warn("refreshFb_dtsg", "Session appears invalid, but will try refresh anyway");
        }

        // Fetch fresh token
        const freshData = await fetchFreshDtsg();
        
        if (!freshData.fb_dtsg) {
          throw new CustomError(
            "Failed to extract fb_dtsg from Facebook pages",
            'EXTRACTION_FAILED'
          );
        }

        // Preserve old value for comparison
        const oldDtsg = ctx.fb_dtsg;
        const newDtsg = freshData.fb_dtsg;

        // Update context
        ctx.fb_dtsg = newDtsg;
        ctx.jazoest = generateJazoest(newDtsg);
        ctx.fb_dtsg_g = generateJazoest(newDtsg); // Some APIs use this
        
        // Update global options too
        if (ctx.globalOptions) {
          ctx.globalOptions.fb_dtsg = newDtsg;
          ctx.globalOptions.jazoest = ctx.jazoest;
        }

        const changed = oldDtsg !== newDtsg;
        
        log.info("refreshFb_dtsg", 
          `Token refreshed successfully (changed: ${changed}, source: ${freshData.source})`);

        safeCallback(null, {
          success: true,
          refreshed: ['fb_dtsg', 'jazoest'],
          changed: changed,
          source: freshData.source,
          timestamp: new Date().toISOString(),
          // Don't expose actual token in callback for security
          fb_dtsg_preview: newDtsg.substring(0, 10) + '...'
        });

      } catch (err) {
        log.error("refreshFb_dtsg", "Refresh failed:", err.message);
        
        // Don't logout on error - keep existing session
        safeCallback(new CustomError(
          `Failed to refresh fb_dtsg: ${err.message}`,
          err.code || 'REFRESH_FAILED'
        ));
      }
    })();

    return returnPromise;
  };
};
