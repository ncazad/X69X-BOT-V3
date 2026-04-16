
// fixed by @Azadx69x 
"use strict";

const log = require("npmlog");
const utils = require("../utils");

module.exports = function (defaultFuncs, api, ctx) {
  
  
  if (typeof ctx.wsReqNumber !== 'number') {
    ctx.wsReqNumber = 1;
  }
  if (typeof ctx.typingCounters === 'undefined') {
    ctx.typingCounters = new Map();
  }

  
  function generateOfflineThreadingID() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 4294967295);
    return (timestamp * 1000 + random).toString();
  }

  
  async function sendTypingMQTT(sendTyping, threadID, isGroup) {
    return new Promise((resolve, reject) => {
      if (!ctx.mqttClient || !ctx.mqttClient.connected) {
        return reject(new Error('MQTT client not connected'));
      }

      
      const reqId = ++ctx.wsReqNumber;

      const payload = {
        thread_key: threadID.toString(),
        is_group_thread: isGroup ? 1 : 0,
        is_typing: sendTyping ? 1 : 0,
        attribution: 0, 
        
        timestamp: Date.now()
      };

      const wsContent = {
        app_id: "2220391788200892",
        payload: JSON.stringify({
          label: "3",
          payload: JSON.stringify(payload),
          version: "5849951561777440"
        }),
        request_id: reqId,
        type: 4
      };

      log.verbose("sendTypingIndicatorV2", 
        `Sending typing=${sendTyping} to ${threadID} (req: ${reqId})`);

      ctx.mqttClient.publish(
        '/ls_req',
        JSON.stringify(wsContent),
        { qos: 1, retain: false },
        (err) => {
          if (err) {
            log.error("sendTypingIndicatorV2", "MQTT publish failed:", err);
            return reject(err);
          }
          resolve({ success: true, requestId: reqId, method: 'mqtt' });
        }
      );
    });
  }

  
  async function sendTypingHTTP(sendTyping, threadID, isGroup) {
    const form = {
      av: ctx.userID,
      fb_dtsg: ctx.fb_dtsg || ctx.globalOptions?.fb_dtsg || '',
      jazoest: ctx.jazoest || '',
      __a: 1,
      __req: 't',
      __be: 1,
      dpr: 1.5,
      
      
      fb_api_caller_class: "RelayModern",
      fb_api_req_friendly_name: "ChatTypingMutation",
      doc_id: "2822256701439905", 
      
      variables: JSON.stringify({
        input: {
          thread_id: isGroup ? threadID : `user:${threadID}`,
          is_group_thread: isGroup,
          is_typing: sendTyping,
          actor_id: ctx.userID,
          client_mutation_id: Math.round(Math.random() * 1000000).toString()
        }
      })
    };

    try {
      const res = await defaultFuncs.post(
        "https://www.facebook.com/api/graphql/",
        ctx.jar,
        form
      );

      
      const jsonRes = typeof res === 'string' ? JSON.parse(res.replace(/^for.*;/, '')) : res;
      
      if (jsonRes.errors) {
        throw new Error(jsonRes.errors[0].message || 'GraphQL error');
      }

      return { success: true, method: 'http', data: jsonRes };
    } catch (err) {
      log.error("sendTypingIndicatorV2", "HTTP fallback failed:", err);
      throw err;
    }
  }

  
  async function sendTypingLegacy(sendTyping, threadID, isGroup) {
    return new Promise((resolve, reject) => {
      if (!ctx.mqttClient || !ctx.mqttClient.connected) {
        return reject(new Error('MQTT not connected'));
      }

      const topic = isGroup ? '/thread_typing' : '/orca_typing_notifications';
      
      const payload = {
        type: 'typ',
        thread_key: threadID.toString(),
        is_group_thread: isGroup,
        is_typing: sendTyping,
        sender_fbid: ctx.userID,
        timestamp: Date.now()
      };

      ctx.mqttClient.publish(
        topic,
        JSON.stringify(payload),
        { qos: 1 },
        (err) => {
          if (err) return reject(err);
          resolve({ success: true, method: 'legacy' });
        }
      );
    });
  }

  
  return async function sendTypingIndicatorV2(sendTyping, threadID, callback, options = {}) {
    
    if (typeof sendTyping !== 'boolean' && typeof sendTyping !== 'number') {
      throw new Error('sendTyping must be boolean (true/false) or 0/1');
    }

    if (!threadID) {
      throw new Error('threadID is required');
    }

    
    const isTyping = !!sendTyping;
    const threadKey = threadID.toString();
    const isGroup = threadKey.length >= 16 || options.isGroup || false;

    
    let resolveFunc, rejectFunc;
    const returnPromise = new Promise((resolve, reject) => {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (typeof callback !== 'function') {
      callback = (err, data) => err ? rejectFunc(err) : resolveFunc(data);
    }

    const safeCallback = (err, data) => {
      try {
        callback(err, data);
      } catch (e) {
        log.error("sendTypingIndicatorV2", "Callback error:", e);
      }
    };

    
    const autoStopDuration = options.autoStop || 10000;
    
    
    if (ctx.typingCounters.has(threadKey)) {
      const existing = ctx.typingCounters.get(threadKey);
      if (existing.timer) {
        clearTimeout(existing.timer);
      }
    }

    try {
      
      let result;
      try {
        result = await sendTypingMQTT(isTyping, threadKey, isGroup);
      } catch (mqttErr) {
        log.warn("sendTypingIndicatorV2", "MQTT failed, trying HTTP:", mqttErr.message);
        
        
        try {
          result = await sendTypingHTTP(isTyping, threadKey, isGroup);
        } catch (httpErr) {
          log.warn("sendTypingIndicatorV2", "HTTP failed, trying legacy:", httpErr.message);
          
          
          result = await sendTypingLegacy(isTyping, threadKey, isGroup);
        }
      }

      
      if (isTyping && autoStopDuration > 0) {
        const timer = setTimeout(async () => {
          try {
            log.verbose("sendTypingIndicatorV2", `Auto-stopping typing for ${threadKey}`);
            await sendTypingMQTT(false, threadKey, isGroup);
          } catch (e) {
            
          }
          ctx.typingCounters.delete(threadKey);
        }, autoStopDuration);

        ctx.typingCounters.set(threadKey, {
          timer: timer,
          startTime: Date.now(),
          autoStopDuration: autoStopDuration
        });
      } else if (!isTyping) {
        ctx.typingCounters.delete(threadKey);
      }

      safeCallback(null, {
        success: true,
        isTyping: isTyping,
        threadID: threadKey,
        isGroup: isGroup,
        method: result.method,
        autoStop: isTyping ? autoStopDuration : null
      });

    } catch (err) {
      log.error("sendTypingIndicatorV2", "All methods failed:", err);
      safeCallback(err);
    }

    return returnPromise;
  };
};
