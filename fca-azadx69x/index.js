"use strict";

/**
 * fca-azadx69x
 * fixed by @Azadx69x
 */

const utils = require("./utils");
const fs = require("fs");
const cron = require("node-cron");

let globalOptions = {};
let ctx = null;
let _defaultFuncs = null;
let api = null;
let region;

const errorRetrieving = "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify.";

let request = require("request").defaults({ jar: true });

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomDelay(min = 1000, max = 5000) {
  await sleep(getRandomInt(min, max));
}

class RequestThrottler {
  constructor() {
    this.lastRequestTime = 0;
    this.minDelay = 2000; 
    this.maxDelay = 8000; 
  }

  async throttle() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const requiredDelay = getRandomInt(this.minDelay, this.maxDelay);
    
    if (timeSinceLastRequest < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastRequest;
      await sleep(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }
}

const requestThrottler = new RequestThrottler();

async function setOptions(globalOptions_from, options = {}) {
  Object.keys(options).map((key) => {
    switch (key) {
      case 'online':
        globalOptions_from.online = Boolean(options.online);
        break;
      case 'selfListen':
        globalOptions_from.selfListen = Boolean(options.selfListen);
        break;
      case 'selfListenEvent':
        globalOptions_from.selfListenEvent = options.selfListenEvent;
        break;
      case 'listenEvents':
        globalOptions_from.listenEvents = Boolean(options.listenEvents);
        break;
      case 'pageID':
        globalOptions_from.pageID = options.pageID.toString();
        break;
      case 'updatePresence':
        globalOptions_from.updatePresence = Boolean(options.updatePresence);
        break;
      case 'forceLogin':
        globalOptions_from.forceLogin = Boolean(options.forceLogin);
        break;
      case 'userAgent':
        globalOptions_from.userAgent = options.userAgent;
        break;
      case 'autoMarkDelivery':
        globalOptions_from.autoMarkDelivery = Boolean(options.autoMarkDelivery);
        break;
      case 'autoMarkRead':
        globalOptions_from.autoMarkRead = Boolean(options.autoMarkRead);
        break;
      case 'listenTyping':
        globalOptions_from.listenTyping = Boolean(options.listenTyping);
        break;
      case 'proxy':
        if (typeof options.proxy != "string") {
          delete globalOptions_from.proxy;
          utils.setProxy();
        } else {
          globalOptions_from.proxy = options.proxy;
          utils.setProxy(globalOptions_from.proxy);
        }
        break;
      case 'autoReconnect':
        globalOptions_from.autoReconnect = Boolean(options.autoReconnect);
        break;
      case 'emitReady':
        globalOptions_from.emitReady = Boolean(options.emitReady);
        break;
      case 'randomUserAgent':
        globalOptions_from.randomUserAgent = Boolean(options.randomUserAgent);
        if (globalOptions_from.randomUserAgent) {
          globalOptions_from.userAgent = utils.randomUserAgent();
          utils.warn("Random user agent enabled. This is an EXPERIMENTAL feature.");
        }
        break;
      case 'bypassRegion':
        globalOptions_from.bypassRegion = options.bypassRegion;
        break;
      default:
        break;
    }
  });
  globalOptions = globalOptions_from;
}

async function updateDTSG(res, appstate, userId) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'i_user') || appstate.find(i => i.key == 'c_user'));
    const UID = userId || (appstateCUser ? appstateCUser.value : null);
    
    if (!res || !res.body) {
      utils.warn("updateDTSG: Invalid response, skipping token update");
      return res;
    }
    
    if (!UID) {
      utils.warn("updateDTSG: Could not find user ID, skipping token update");
      return res;
    }
    
    const fb_dtsg = utils.getFrom(res.body, '["DTSGInitData",[],{"token":"', '","');
    const jazoest = utils.getFrom(res.body, 'jazoest=', '",');
    
    if (fb_dtsg && jazoest) {
      const filePath = 'fb_dtsg_data.json';
      let existingData = {};
      try {
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          existingData = JSON.parse(fileContent);
        }
      } catch (readError) {
        utils.warn("updateDTSG: Error reading existing data, creating new file");
        existingData = {};
      }
      
      existingData[UID] = {
        fb_dtsg,
        jazoest,
        updatedAt: new Date().toISOString()
      };
      
      try {
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
        utils.log(`fb_dtsg updated successfully for user ${UID}`);
      } catch (writeError) {
        utils.error(`updateDTSG: Error writing to file: ${writeError.message}`);
      }
    } else {
      utils.warn("updateDTSG: Could not extract fb_dtsg or jazoest from response");
    }
    
    return res;
  } catch (error) {
    utils.error(`Error updating DTSG: ${error.message}`);
    return res;
  }
}

let isBehavior = false;
let behaviorRetryCount = 0;
const MAX_BEHAVIOR_RETRIES = 3;

async function bypassAutoBehavior(resp, jar, appstate, ID) {
  try {
    
    if (behaviorRetryCount >= MAX_BEHAVIOR_RETRIES) {
      utils.warn(`Max behavior bypass retries (${MAX_BEHAVIOR_RETRIES}) reached. Waiting before next attempt...`);
      await sleep(300000); 
      behaviorRetryCount = 0;
    }

    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'));
    const UID = ID || (appstateCUser ? appstateCUser.value : 'unknown');
    
    if (!resp || !resp.request || !resp.request.uri) {
      return resp;
    }

    if (resp.request.uri.href && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
      if (resp.request.uri.href.includes('601051028565049')) {
        utils.warn(`Automated behavior detected on account ${UID}. Handling gracefully...`);
        
        
        await randomDelay(3000, 8000);
        
        const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
        const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
        const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");
        
        if (fb_dtsg && jazoest) {
          behaviorRetryCount++;
          
          const FormBypass = {
            av: UID,
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "FBScrapingWarningMutation",
            variables: JSON.stringify({}),
            server_timestamps: true,
            doc_id: 6339492849481770,
            fb_dtsg,
            jazoest,
            lsd
          };
          
          
          await requestThrottler.throttle();
          
          return utils.post("https://www.facebook.com/api/graphql/", jar, FormBypass, globalOptions)
            .then(utils.saveCookies(jar))
            .then(res => {
              utils.log(`Behavior bypass attempt ${behaviorRetryCount}/${MAX_BEHAVIOR_RETRIES} completed`);
              if (!isBehavior) isBehavior = true;
              
              setTimeout(() => { behaviorRetryCount = 0; }, 600000);
              return res;
            })
            .catch(err => {
              utils.error("bypassAutoBehavior: Error posting to graphql:", err.message);
              return resp;
            });
        } else {
          utils.warn("bypassAutoBehavior: Missing tokens, cannot bypass");
          return resp;
        }
      }
    }
    return resp;
  } catch (e) {
    utils.error("bypassAutoBehavior error:", e.message);
    return resp;
  }
}

async function checkIfSuspended(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'));
    const UID = appstateCUser?.value;
    const suspendReasons = {};
    
    if (resp && resp.request && resp.request.uri) {
      if (resp.request.uri.href && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('1501092823525282')) {
          const daystoDisable = resp.body?.match(/"log_out_uri":"(.*?)","title":"(.*?)"/);
          if (daystoDisable && daystoDisable[2]) {
            suspendReasons.durationInfo = daystoDisable[2];
            utils.error(`Suspension time remaining:`, suspendReasons.durationInfo);
          }
          const reasonDescription = resp.body?.match(/"reason_section_body":"(.*?)"/);
          if (reasonDescription && reasonDescription[1]) {
            suspendReasons.longReason = reasonDescription?.[1];
            const reasonReplace = suspendReasons?.longReason?.toLowerCase()?.replace("your account, or activity on it, doesn't follow our community standards on ", "");
            suspendReasons.shortReason = reasonReplace?.substring(0, 1).toUpperCase() + reasonReplace?.substring(1);
            utils.error(`Alert on ${UID}:`, `Account has been suspended!`);
            utils.error(`Why suspended:`, suspendReasons.longReason);
            utils.error(`Reason on suspension:`, suspendReasons.shortReason);
          }
          ctx = null;
          return {
            suspended: true,
            suspendReasons
          };
        }
      }
    }
    return null;
  } catch (error) {
    utils.error("checkIfSuspended error:", error.message);
    return null;
  }
}

async function checkIfLocked(resp, appstate) {
  try {
    const appstateCUser = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'));
    const UID = appstateCUser?.value;
    const lockedReasons = {};
    
    if (resp && resp.request && resp.request.uri) {
      if (resp.request.uri.href && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
        if (resp.request.uri.href.includes('828281030927956')) {
          const lockDesc = resp.body.match(/"is_unvetted_flow":true,"title":"(.*?)"/);
          if (lockDesc && lockDesc[1]) {
            lockedReasons.reason = lockDesc[1];
            utils.error(`Alert on ${UID}:`, lockedReasons.reason);
          }
          ctx = null;
          return {
            locked: true,
            lockedReasons
          };
        }
      }
    }
    return null;
  } catch (e) {
    utils.error("checkIfLocked error:", e.message);
    return null;
  }
}

async function simulateHumanActivity(jar) {
  try {
    
    const pages = [
      'https://www.facebook.com/',
      'https://www.facebook.com/notifications',
      'https://www.facebook.com/messages',
      'https://www.facebook.com/friends'
    ];
    
    const randomPage = pages[getRandomInt(0, pages.length - 1)];
    await randomDelay(5000, 15000); 
    
    await requestThrottler.throttle();
    await utils.get(randomPage, jar, null, globalOptions, { noRef: true });
    
    utils.log(`Simulated human activity: visited ${randomPage}`);
  } catch (e) {
    
  }
}

function buildAPI(html, jar) {
  let fb_dtsg;
  let userID;
  const tokenMatch = html.match(/DTSGInitialData.*?token":"(.*?)"/);
  if (tokenMatch) {
    fb_dtsg = tokenMatch[1];
  }
  
  let cookie = jar.getCookies("https:
  let primary_profile = cookie.filter(function(val) {
    return val.cookieString().split("=")[0] === "c_user";
  });
  let secondary_profile = cookie.filter(function(val) {
    return val.cookieString().split("=")[0] === "i_user";
  });
  
  if (primary_profile.length === 0 && secondary_profile.length === 0) {
    throw {
      error: errorRetrieving,
    };
  } else {
    if (html.indexOf("/checkpoint/block/?next") > -1) {
      return utils.warn(
        "login",
        "Checkpoint detected. Please log in with a browser to verify."
      );
    }
    if (secondary_profile[0] && secondary_profile[0].cookieString().includes('i_user')) {
      userID = secondary_profile[0].cookieString().split("=")[1].toString();
    } else {
      userID = primary_profile[0].cookieString().split("=")[1].toString();
    }
  }
  
  utils.log("Logged in!");
  const clientID = (Math.random() * 2147483648 | 0).toString(16);
  
  const CHECK_MQTT = {
    oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
    newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
    legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/)
  };
  
  let Slot = Object.keys(CHECK_MQTT);
  let mqttEndpoint, irisSeqID;
  
  Object.keys(CHECK_MQTT).map((MQTT) => {
    if (globalOptions.bypassRegion) return;
    if (CHECK_MQTT[MQTT] && !region) {
      switch (Slot.indexOf(MQTT)) {
        case 0: {
          irisSeqID = CHECK_MQTT[MQTT][1];
          mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
        case 1: {
          irisSeqID = CHECK_MQTT[MQTT][2];
          mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
        case 2: {
          mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\
          region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
          break;
        }
      }
      return;
    }
  });
  
  if (globalOptions.bypassRegion)
    region = globalOptions.bypassRegion.toUpperCase();
  else if (!region)
    region = ["prn", "pnb", "vll", "hkg", "sin", "ftw", "ash"][Math.random() * 5 | 0].toUpperCase();
  
  if (globalOptions.bypassRegion || !mqttEndpoint)
    mqttEndpoint = "wss://edge-chat.facebook.com/chat?region=" + region;
  
  ctx = {
    userID,
    jar,
    clientID,
    globalOptions,
    loggedIn: true,
    access_token: 'NONE',
    clientMutationId: 0,
    mqttClient: undefined,
    lastSeqId: irisSeqID,
    syncToken: undefined,
    mqttEndpoint,
    wsReqNumber: 0,
    wsTaskNumber: 0,
    reqCallbacks: {},
    region,
    firstListen: true,
    fb_dtsg
  };
  
  
  let lastSaveTime = 0;
  const saveAppState = async () => {
    try {
      const now = Date.now();
      
      if (now - lastSaveTime < 60000) return;
      
      if (api && typeof api.getAppState === 'function') {
        const currentAppState = api.getAppState();
        if (currentAppState && currentAppState.length > 0) {
          const appStatePath = `${process.cwd()}/appstate_backup_${userID}.json`;
          fs.writeFileSync(appStatePath, JSON.stringify(currentAppState, null, 2), 'utf8');
          lastSaveTime = now;
          utils.log(`AppState auto-saved for user ${userID}`);
        }
      }
    } catch (e) {
      utils.warn(`AppState save error: ${e.message}`);
    }
  };

  
  const scheduleKeepAlive = () => {
    
    const randomHour = getRandomInt(8, 20);
    const randomMinute = getRandomInt(0, 59);
    
    cron.schedule(`${randomMinute} ${randomHour}/12 * * *`, async () => {
      try {
        await requestThrottler.throttle();
        await utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true });
        utils.log(`Keep-alive ping sent for user ${userID}`);
        
        
        if (Math.random() > 0.7) {
          await simulateHumanActivity(jar);
        }
        
        await saveAppState();
      } catch (e) {
        utils.warn(`Keep-alive ping failed: ${e.message}`);
      }
    }, { timezone: 'Asia/Dhaka', scheduled: true });
  };

  
  const scheduleTokenRefresh = () => {
    const randomHour = getRandomInt(0, 23);
    const randomMinute = getRandomInt(0, 59);
    
    cron.schedule(`${randomMinute} ${randomHour}/8 * * *`, async () => {
      try {
        const filePath = 'fb_dtsg_data.json';
        if (!fs.existsSync(filePath)) {
          utils.warn(`Token refresh: No fb_dtsg data file found for user ${userID}`);
          return;
        }
        
        let fbDtsgData;
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          fbDtsgData = JSON.parse(fileContent);
        } catch (parseError) {
          utils.error(`Token refresh: Error parsing fb_dtsg data file: ${parseError.message}`);
          return;
        }
        
        if (!fbDtsgData || !fbDtsgData[userID]) {
          utils.warn(`Token refresh: No fb_dtsg data found for user ${userID}`);
          return;
        }
        
        const userFbDtsg = fbDtsgData[userID];
        
        
        const tokenAge = new Date() - new Date(userFbDtsg.updatedAt);
        if (tokenAge < 43200000) { 
          utils.log(`Token for ${userID} is still fresh, skipping refresh`);
          return;
        }
        
        if (api && typeof api.refreshFb_dtsg === 'function') {
          try {
            await requestThrottler.throttle();
            await api.refreshFb_dtsg(userFbDtsg);
            utils.log(`Fb_dtsg refreshed successfully for user ${userID}.`);
            await saveAppState();
          } catch (refreshError) {
            utils.error(`Error during Fb_dtsg refresh for user ${userID}: ${refreshError.message}`);
          }
        } else {
          utils.warn(`Token refresh: api.refreshFb_dtsg is not available yet, skipping refresh`);
        }
      } catch (error) {
        utils.error(`Token refresh cron error: ${error.message}`);
      }
    }, {
      timezone: 'Asia/Dhaka',
      scheduled: true
    });
  };
  
  
  setTimeout(() => {
    scheduleTokenRefresh();
    scheduleKeepAlive();
  }, 10000); 
  
  let defaultFuncs = utils.makeDefaults(html, userID, ctx);
  return [ctx, defaultFuncs];
}

async function loginHelper(appState, email, password, apiCustomized = {}, callback) {
  let mainPromise = null;
  const jar = request.jar();
  utils.log('Logging in...');
  
  
  await randomDelay(1000, 3000);
  
  if (appState) {
    if (utils.getType(appState) === 'Array' && appState.some(c => c.name)) {
      appState = appState.map(c => {
        c.key = c.name;
        delete c.name;
        return c;
      });
    } else if (utils.getType(appState) === 'String') {
      const arrayAppState = [];
      appState.split(';').forEach(c => {
        const [key, value] = c.split('=');
        arrayAppState.push({
          key: (key || "").trim(),
          value: (value || "").trim(),
          domain: ".facebook.com",
          path: "/",
          expires: new Date().getTime() + 1000 * 60 * 60 * 24 * 365
        });
      });
      appState = arrayAppState;
    }

    const oneYearFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toUTCString();
    appState.map(c => {
      const expiry = c.expires || oneYearFromNow;
      const str = c.key + "=" + c.value + "; expires=" + expiry + "; domain=" + c.domain + "; path=" + c.path + ";";
      jar.setCookie(str, "http://" + c.domain);
    });

    mainPromise = utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
      .then(utils.saveCookies(jar));
  } else if (email && password) {
    throw { error: "Credentials method is not implemented to fca yet." };
  } else {
    throw { error: "Please provide either appState or credentials." };
  }

  api = {
    setOptions: setOptions.bind(null, globalOptions),
    getAppState() {
      const appState = utils.getAppState(jar);
      if (!Array.isArray(appState)) return [];
      const uniqueAppState = appState.filter((item, index, self) => {
        return self.findIndex((t) => t.key === item.key) === index;
      });
      return uniqueAppState.length > 0 ? uniqueAppState : appState;
    },
    
    logout: function(callback) {
      return utils.logout(jar, ctx, callback);
    },
    
    clearSession: function() {
      return utils.clearSession(jar, ctx);
    },
    
    getContext: function() {
      return ctx;
    },
    
    throttle: () => requestThrottler.throttle()
  };
  
  mainPromise = mainPromise
    .then(async res => {
      await requestThrottler.throttle();
      return bypassAutoBehavior(res, jar, appState);
    })
    .then(async res => {
      await requestThrottler.throttle();
      return updateDTSG(res, appState);
    })
    .then(async (res) => {
      await requestThrottler.throttle();
      const resp = await utils.get(`https://www.facebook.com/home.php`, jar, null, globalOptions);
      const html = resp?.body;
      const stuff = await buildAPI(html, jar);
      ctx = stuff[0];
      _defaultFuncs = stuff[1];
      
      api.addFunctions = (directory) => {
        const folder = directory.endsWith("/") ? directory : (directory + "/");
        fs.readdirSync(folder)
          .filter(v => v.endsWith('.js'))
          .map(v => {
            api[v.replace('.js', '')] = require(folder + v)(_defaultFuncs, api, ctx);
          });
      };
      
      api.addFunctions(__dirname + '/src');
      api.listen = api.listenMqtt;
      api.ws3 = {
        ...apiCustomized
      };
      
      
      try {
        await requestThrottler.throttle();
        if (api.getBotInitialData) {
          const bi = await api.getBotInitialData();
          if (!bi.error) {
            utils.log("Hello,", bi.name);
            utils.log("My User ID:", bi.uid);
            ctx.userName = bi.name;
          } else {
            utils.warn(bi.error);
            utils.warn(`WARNING: Failed to fetch account info. Proceeding to log in for user ${ctx.userID}`);
          }
        }
      } catch (e) {
        utils.warn(`Could not fetch bot initial data: ${e.message}`);
      }
      
      utils.log("Connected to server region:", region || "UNKNOWN");
      return res;
    });
    
  if (globalOptions.pageID) {
    mainPromise = mainPromise
      .then(async function() {
        await requestThrottler.throttle();
        return utils
          .get('https://www.facebook.com/' + ctx.globalOptions.pageID + '/messages/?section=messages&subsection=inbox', ctx.jar, null, globalOptions);
      })
      .then(async function(resData) {
        await requestThrottler.throttle();
        let url = utils.getFrom(resData.body, 'window.location.replace("https:\\/\\/www.facebook.com\\', '");').split('\\').join('');
        url = url.substring(0, url.length - 1);
        return utils
          .get('https://www.facebook.com' + url, ctx.jar, null, globalOptions);
      });
  }

  mainPromise
    .then(async (res) => {
      const detectLocked = await checkIfLocked(res, appState);
      if (detectLocked) throw detectLocked;
      
      const detectSuspension = await checkIfSuspended(res, appState);
      if (detectSuspension) throw detectSuspension;
      
      utils.log("Successfully logged in.");
      
      return callback(null, api);
    }).catch(e => {
      utils.error("Login error:", e.error || e.message || e);
      callback(e);
    });
}

async function login(loginData, options, callback) {
  if (utils.getType(options) === 'Function' ||
    utils.getType(options) === 'AsyncFunction') {
    callback = options;
    options = {};
  }
  
  const globalOptions = {
    selfListen: false,
    selfListenEvent: false,
    listenEvents: true,
    listenTyping: false,
    updatePresence: false,
    forceLogin: false,
    autoMarkDelivery: false,
    autoMarkRead: true,
    autoReconnect: true,
    online: true,
    emitReady: false,
    userAgent: utils.defaultUserAgent,
    randomUserAgent: false
  };
  
  if (options) Object.assign(globalOptions, options);
  
  const loginws3 = () => {
    loginHelper(loginData?.appState, loginData?.email, loginData?.password, {
        async relogin() {
          
          const delay = Math.min(30000 * Math.pow(2, behaviorRetryCount), 300000);
          utils.warn(`Waiting ${delay/1000}s before relogin...`);
          await sleep(delay);
          loginws3();
        }
      },
      (loginError, loginApi) => {
        if (loginError) {
          if (isBehavior) {
            utils.warn("Failed after dismiss behavior, will relogin automatically...");
            isBehavior = false;
            
            setTimeout(() => loginws3(), getRandomInt(10000, 30000));
            return;
          }
          utils.error("login", loginError);
          return callback(loginError);
        }
        callback(null, loginApi);
      });
  };
  
  setOptions(globalOptions, options).then(_ => loginws3()).catch(err => {
    utils.error("Error setting options:", err.message);
    callback(err);
  });
  return;
}

module.exports = { login };
