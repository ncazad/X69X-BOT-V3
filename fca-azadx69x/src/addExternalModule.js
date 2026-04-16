// fixed by @Azadx69x 
"use strict";

const { getType } = require("../utils");
const log = require("npmlog");

module.exports = function(defaultFuncs, api, ctx) {
  
  
  if (!ctx.loadedModules) {
    ctx.loadedModules = new Map();
  }

  
  function validateModule(moduleObj, moduleName = "unnamed") {
    if (!moduleObj) {
      throw new Error(`Module "${moduleName}" is null or undefined`);
    }

    const type = getType(moduleObj);
    if (type !== "Object") {
      throw new Error(`Module "${moduleName}" must be an object, not ${type}!`);
    }

    
    if (moduleObj._meta) {
      const meta = moduleObj._meta;
      log.info("addExternalModule", `Loading module: ${meta.name || moduleName} v${meta.version || '1.0.0'}`);
      if (meta.description) {
        log.verbose("addExternalModule", `Description: ${meta.description}`);
      }
    }

    
    for (const [key, value] of Object.entries(moduleObj)) {
      
      if (key.startsWith('_')) continue;

      const valueType = getType(value);
      
      if (valueType !== "Function" && valueType !== "AsyncFunction") {
        throw new Error(
          `Export "${key}" in module "${moduleName}" must be a function, not ${valueType}!`
        );
      }
    }

    return true;
  }

  
  function checkConflicts(moduleObj, moduleName, options = {}) {
    const conflicts = [];
    const overwrite = options.overwrite || false;
    
    for (const apiName in moduleObj) {
      if (apiName.startsWith('_')) continue; 
      
      if (api[apiName] !== undefined) {
        conflicts.push(apiName);
        
        if (!overwrite) {
          log.warn("addExternalModule", 
            `API "${apiName}" already exists. Use { overwrite: true } to replace.`);
        }
      }
    }

    if (conflicts.length > 0 && !overwrite) {
      throw new Error(
        `Module "${moduleName}" conflicts with existing APIs: ${conflicts.join(', ')}. ` +
        `Use options.overwrite = true to force replace.`
      );
    }

    return conflicts;
  }

  
  function initializeFunction(fn, apiName, moduleName) {
    try {
      const initialized = fn(defaultFuncs, api, ctx);
      
      
      const initType = getType(initialized);
      if (initType !== "Function" && initType !== "AsyncFunction") {
        throw new Error(
          `Module "${moduleName}" export "${apiName}" must return a function, returned ${initType}`
        );
      }

      return initialized;
      
    } catch (err) {
      log.error("addExternalModule", 
        `Failed to initialize "${apiName}" from "${moduleName}":`, err);
      throw err;
    }
  }

  
  return function addExternalModule(moduleObj, options = {}) {
    const moduleName = options.name || moduleObj?._meta?.name || "unnamed_module";
    const startTime = Date.now();

    
    if (!defaultFuncs || !api || !ctx) {
      throw new Error("addExternalModule: Internal API context not available");
    }

    try {
      
      validateModule(moduleObj, moduleName);

      
      const conflicts = checkConflicts(moduleObj, moduleName, options);

      
      const loaded = {};
      const loadedCount = { success: 0, skipped: 0 };

      for (const apiName in moduleObj) {
        
        if (apiName.startsWith('_')) continue;

        try {
          
          if (api[apiName] !== undefined && !options.overwrite) {
            log.verbose("addExternalModule", `Skipping "${apiName}" (exists)`);
            loadedCount.skipped++;
            continue;
          }

          
          const initializedFn = initializeFunction(
            moduleObj[apiName], 
            apiName, 
            moduleName
          );

          
          api[apiName] = initializedFn;
          loaded[apiName] = initializedFn;
          loadedCount.success++;

          log.verbose("addExternalModule", `Loaded: ${apiName}`);

        } catch (initErr) {
          if (options.continueOnError) {
            log.error("addExternalModule", 
              `Failed to load "${apiName}", continuing...`, initErr);
            loadedCount.skipped++;
          } else {
            throw initErr;
          }
        }
      }

      
      const moduleInfo = {
        name: moduleName,
        loadedAt: new Date().toISOString(),
        exports: Object.keys(loaded),
        conflicts: conflicts,
        options: options,
        loadTime: Date.now() - startTime
      };

      ctx.loadedModules.set(moduleName, moduleInfo);

      
      if (moduleObj._onLoad && getType(moduleObj._onLoad) === "Function") {
        try {
          moduleObj._onLoad(defaultFuncs, api, ctx, loaded);
        } catch (hookErr) {
          log.warn("addExternalModule", `Module "${moduleName}" onLoad hook failed:`, hookErr);
        }
      }

      log.info("addExternalModule", 
        `Module "${moduleName}" loaded successfully (${loadedCount.success} exports, ${loadedCount.skipped} skipped) in ${moduleInfo.loadTime}ms`);

      return {
        success: true,
        module: moduleName,
        loaded: Object.keys(loaded),
        skipped: loadedCount.skipped,
        conflicts: conflicts,
        info: moduleInfo
      };

    } catch (err) {
      log.error("addExternalModule", `Failed to load module "${moduleName}":`, err);
      throw err;
    }
  };
};
