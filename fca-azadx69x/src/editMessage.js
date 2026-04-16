
// fixed by @Azadx69x 
"use strict";

const log = require("npmlog");

function generateOfflineThreadingID() {
  
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return (timestamp * 100000 + random).toString();
}

module.exports = function (defaultFuncs, api, ctx) {
  
  
  if (!ctx.pendingEdits) {
    ctx.pendingEdits = new Map();
  }
  if (typeof ctx.wsReqNumber !== 'number') {
    ctx.wsReqNumber = 1;
  }
  if (typeof ctx.wsTaskNumber !== 'number') {
    ctx.wsTaskNumber = 1;
  }

  
  let offlineIdGen;
  try {
    const utils = require('../utils');
    offlineIdGen = utils.generateOfflineThreadingID || generateOfflineThreadingID;
  } catch (e) {
    offlineIdGen = generateOfflineThreadingID;
  }

  
  function scheduleEditAckWatch(messageID, settings, ctx, callback) {
    const { 
      ackTimeoutMs = 12000, 
      maxResendAttempts = 2, 
      editTTLms = 300000 
    } = settings;

    const timer = setTimeout(() => {
      const rec = ctx.pendingEdits.get(messageID);
      
      
      if (!rec) {
        return;
      }

      const age = Date.now() - rec.ts;
      
      
      if (age > editTTLms) {
        ctx.pendingEdits.delete(messageID);
        if (ctx.health) {
          ctx.health.removePendingEdit(messageID);
          ctx.health.incPendingEditExpired();
        }
        
        if (callback && !rec.notified) {
          rec.notified = true;
          callback(new Error('Edit message timeout - no acknowledgment received'));
        }
        return;
      }

      
      if (rec.attempts >= maxResendAttempts) {
        ctx.pendingEdits.delete(messageID);
        if (ctx.health) {
          ctx.health.markEditFailed(messageID);
        }
        if (callback && !rec.notified) {
          rec.notified = true;
          callback(new Error('Edit message failed after max retry attempts'));
        }
        return;
      }

      
      try {
        rec.attempts++;
        
        if (ctx.health) {
          ctx.health.markEditResent(messageID);
        }

        
        ctx.wsReqNumber += 1;
        ctx.wsTaskNumber += 1;

        const queryPayload = { 
          message_id: messageID, 
          text: rec.text 
        };
        
        const query = {
          failure_count: null,
          label: '742',
          payload: JSON.stringify(queryPayload),
          queue_name: 'edit_message',
          task_id: ctx.wsTaskNumber
        };
        
        const context = {
          app_id: '2220391788200892',
          payload: JSON.stringify({
            data_trace_id: null,
            epoch_id: parseInt(offlineIdGen()),
            tasks: [query],
            version_id: '6903494529735864'
          }),
          request_id: ctx.wsReqNumber,
          type: 3
        };

        ctx.mqttClient.publish(
          '/ls_req', 
          JSON.stringify(context), 
          { qos: 1, retain: false },
          (err) => {
            if (err) {
              if (ctx.health) ctx.health.onError('edit_resend_publish_fail');
              
            }
          }
        );

        
        scheduleEditAckWatch(messageID, settings, ctx, callback);

      } catch (e) {
        if (ctx.health) ctx.health.onError('edit_resend_exception');
        ctx.pendingEdits.delete(messageID);
        if (callback && !rec.notified) {
          rec.notified = true;
          callback(new Error('Edit resend failed: ' + e.message));
        }
      }
    }, ackTimeoutMs);

    
    const rec = ctx.pendingEdits.get(messageID);
    if (rec) {
      rec.timer = timer;
    }
  }

  
  function acknowledgeEdit(messageID, success = true) {
    const rec = ctx.pendingEdits.get(messageID);
    if (!rec) return false;

    
    if (rec.timer) {
      clearTimeout(rec.timer);
    }

    ctx.pendingEdits.delete(messageID);
    
    if (ctx.health) {
      ctx.health.removePendingEdit(messageID);
      if (success) {
        ctx.health.markEditSuccess(messageID);
      }
    }

    return true;
  }

  
  ctx.acknowledgeEdit = acknowledgeEdit;

  
  function cleanupOldEdits(maxAge = 300000) {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [msgID, rec] of ctx.pendingEdits.entries()) {
      if (now - rec.ts > maxAge) {
        if (rec.timer) clearTimeout(rec.timer);
        ctx.pendingEdits.delete(msgID);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  
  if (!ctx.editCleanupInterval) {
    ctx.editCleanupInterval = setInterval(() => {
      cleanupOldEdits();
    }, 300000);
  }

  
  return function editMessage(text, messageID, callback) {
    
    let promise;
    let resolved = false;
    
    if (typeof callback !== 'function') {
      promise = new Promise((resolve, reject) => {
        callback = (err, data) => {
          if (resolved) return; 
          resolved = true;
          err ? reject(err) : resolve(data);
        };
      });
    } else {
      
      const originalCb = callback;
      callback = (err, data) => {
        if (resolved) return;
        resolved = true;
        originalCb(err, data);
      };
    }

    
    callback = callback || function() {};

    
    if (!ctx.mqttClient) {
      callback(new Error('Not connected to MQTT'));
      return promise;
    }

    if (!messageID || typeof messageID !== 'string') {
      callback(new Error('Invalid messageID: must be a non-empty string'));
      return promise;
    }

    if (typeof text !== 'string') {
      callback(new Error('Invalid text: must be a string'));
      return promise;
    }

    if (text.length > 20000) {
      callback(new Error('Text too long: maximum 20000 characters'));
      return promise;
    }

    
    const settings = ctx.globalOptions.editSettings || { 
      maxPendingEdits: 200, 
      editTTLms: 300000, 
      ackTimeoutMs: 12000, 
      maxResendAttempts: 2 
    };

    
    if (ctx.pendingEdits.has(messageID)) {
      const existing = ctx.pendingEdits.get(messageID);
      
      existing.text = text;
      existing.ts = Date.now();
      existing.attempts = 0;
      if (existing.timer) {
        clearTimeout(existing.timer);
      }
      
      if (ctx.health) {
        ctx.health.incEditUpdated(messageID);
      }
      
      log.verbose("editMessage", `Updated pending edit for ${messageID}`);
    } else {
      
      if (ctx.pendingEdits.size >= settings.maxPendingEdits) {
        const firstKey = ctx.pendingEdits.keys().next().value;
        if (firstKey) { 
          const old = ctx.pendingEdits.get(firstKey);
          if (old && old.timer) clearTimeout(old.timer);
          ctx.pendingEdits.delete(firstKey); 
          if (ctx.health) ctx.health.incPendingEditDropped(); 
          log.warn("editMessage", `Dropped oldest pending edit: ${firstKey}`);
        }
      }

      
      const now = Date.now();
      ctx.pendingEdits.set(messageID, { 
        text, 
        ts: now, 
        attempts: 0,
        notified: false
      });
      
      if (ctx.health) {
        ctx.health.addPendingEdit(messageID, text);
      }
    }

    
    ctx.wsReqNumber += 1;
    ctx.wsTaskNumber += 1;

    
    const queryPayload = { 
      message_id: messageID, 
      text: text 
    };
    
    const query = {
      failure_count: null,
      label: '742',
      payload: JSON.stringify(queryPayload),
      queue_name: 'edit_message',
      task_id: ctx.wsTaskNumber
    };
    
    const context = {
      app_id: '2220391788200892',
      payload: JSON.stringify({
        data_trace_id: null,
        epoch_id: parseInt(offlineIdGen()),
        tasks: [query],
        version_id: '6903494529735864'
      }),
      request_id: ctx.wsReqNumber,
      type: 3
    };

    
    try {
      ctx.mqttClient.publish(
        '/ls_req', 
        JSON.stringify(context), 
        { qos: 1, retain: false }, 
        (err) => {
          if (err) {
            if (ctx.health) ctx.health.onError('edit_publish_fail');
            
            
            const rec = ctx.pendingEdits.get(messageID);
            if (rec && rec.timer) clearTimeout(rec.timer);
            ctx.pendingEdits.delete(messageID);
            if (ctx.health) ctx.health.removePendingEdit(messageID);
            
            return callback(new Error('Failed to publish edit: ' + err.message));
          }
          
          
          scheduleEditAckWatch(messageID, settings, ctx, callback);
          
          
          callback(null, { 
            success: true,
            queued: true, 
            messageID: messageID,
            requestId: ctx.wsReqNumber
          });
        }
      );
    } catch (e) {
      if (ctx.health) ctx.health.onError('edit_exception');
      
      
      const rec = ctx.pendingEdits.get(messageID);
      if (rec && rec.timer) clearTimeout(rec.timer);
      ctx.pendingEdits.delete(messageID);
      if (ctx.health) ctx.health.removePendingEdit(messageID);
      
      callback(new Error('Edit message exception: ' + e.message));
    }

    return promise;
  };
};
