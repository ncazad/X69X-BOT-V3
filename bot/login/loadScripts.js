const { readdirSync, readFileSync, writeFileSync, existsSync } = require("fs-extra");
const path = require("path");
const exec = (cmd, options) => new Promise((resolve, reject) => {
        require("child_process").exec(cmd, options, (err, stdout) => {
                if (err)
                        return reject(err);
                resolve(stdout);
        });
});
const { log, loading, getText, colors, removeHomeDir } = global.utils;
const { GoatBot } = global;
const { configCommands } = GoatBot;
const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
const packageAlready = [];
const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinCount = 0;

function padEnd(str, len) {
        const stripped = str.replace(/\u001b\[[0-9;]*m/g, '').replace(/[^\x00-\x7E]/g, '  ');
        const pad = Math.max(0, len - stripped.length);
        return str + ' '.repeat(pad);
}

function printGrid(items, cols = 3) {
        const rows = Math.ceil(items.length / cols);
        const colWidth = 24;
        for (let r = 0; r < rows; r++) {
                let line = '  ';
                for (let c = 0; c < cols; c++) {
                        const idx = r + c * rows;
                        if (idx < items.length) {
                                line += padEnd(items[idx], colWidth);
                        }
                }
                console.log(line);
        }
}

module.exports = async function (api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, createLine) {
        const aliasesData = await globalData.get('setalias', 'data', []);
        if (aliasesData) {
                for (const data of aliasesData) {
                        const { aliases, commandName } = data;
                        for (const alias of aliases)
                                if (GoatBot.aliases.has(alias))
                                        throw new Error(`❌ Alias "${alias}" already exists in command "${commandName}"`);
                                else
                                        GoatBot.aliases.set(alias, commandName);
                }
        }

        const folders = ["cmds", "events"];
        let text, setMap, typeEnvCommand;

        for (const folderModules of folders) {
                const isCmd = folderModules === "cmds";
                const sectionLabel = isCmd ? "📂 LOAD COMMANDS" : "📂 LOAD COMMANDS EVENT";
                console.log(colors.hex("#f5ab00")(createLine(sectionLabel)));

                text = isCmd ? "command" : "event command";
                typeEnvCommand = isCmd ? "envCommands" : "envEvents";
                setMap = isCmd ? "commands" : "eventCommands";

                const fullPathModules = path.normalize(process.cwd() + `/scripts/${folderModules}`);
                const Files = readdirSync(fullPathModules).filter(file =>
                        file.endsWith(".js") &&
                        !file.endsWith("eg.js") &&
                        (process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
                        !configCommands[isCmd ? "commandUnload" : "commandEventUnload"]?.includes(file)
                );

                const commandError = [];
                const commandSuccess = [];
                let commandLoadSuccess = 0;

                for (const file of Files) {
                        const pathCommand = path.normalize(fullPathModules + "/" + file);
                        const cmdLabel = file.replace(/\.js$/, '');

                        const watingSpinner = setInterval(() => {
                                process.stdout.write(`\r  ${colors.hex("#aaaaaa")(spinner[spinCount % spinner.length])} ${colors.hex("#cccccc")(`Loading ${cmdLabel}...`)}   `);
                                spinCount++;
                        }, 80);

                        try {
                                // CHECK PACKAGE
                                const contentFile = readFileSync(pathCommand, "utf8");
                                let allPackage = contentFile.match(regExpCheckPackage);
                                if (allPackage) {
                                        allPackage = allPackage.map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
                                                .filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
                                        for (let packageName of allPackage) {
                                                if (packageName.startsWith('@'))
                                                        packageName = packageName.split('/').slice(0, 2).join('/');
                                                else
                                                        packageName = packageName.split('/')[0];

                                                if (!packageAlready.includes(packageName)) {
                                                        packageAlready.push(packageName);
                                                        if (!existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
                                                                clearInterval(watingSpinner);
                                                                process.stdout.write('\r\x1b[K');
                                                                const pkgWaiting = setInterval(() => {
                                                                        process.stdout.write(`\r  ${colors.yellow(spinner[spinCount % spinner.length])} ${colors.yellow(`Installing: ${packageName}`)}   `);
                                                                        spinCount++;
                                                                }, 80);
                                                                try {
                                                                        await exec(`npm install ${packageName} --${pathCommand.endsWith('.dev.js') ? 'no-save' : 'save'}`);
                                                                        clearInterval(pkgWaiting);
                                                                        process.stdout.write('\r\x1b[K');
                                                                        console.log(`  ${colors.green('✔')} ${colors.green(`Installed:`)} ${colors.yellow(packageName)}`);
                                                                } catch (err) {
                                                                        clearInterval(pkgWaiting);
                                                                        process.stdout.write('\r\x1b[K');
                                                                        console.log(`  ${colors.red('✘')} ${colors.red(`Failed to install:`)} ${colors.yellow(packageName)}`);
                                                                        throw new Error(`Can't install package ${packageName}`);
                                                                }
                                                        }
                                                }
                                        }
                                }

                                global.temp.contentScripts[folderModules][file] = contentFile;

                                const command = require(pathCommand);
                                command.location = pathCommand;
                                const configCommand = command.config;
                                const commandName = configCommand.name;

                                if (!configCommand)
                                        throw new Error(`⚠️ config of ${text} undefined`);
                                if (!configCommand.category)
                                        throw new Error(`⚠️ category of ${text} undefined`);
                                if (!commandName)
                                        throw new Error(`⚠️ name of ${text} undefined`);
                                if (!command.onStart)
                                        throw new Error(`⚠️ onStart of ${text} undefined`);
                                if (typeof command.onStart !== "function")
                                        throw new Error(`⚠️ onStart of ${text} must be a function`);
                                if (GoatBot[setMap].has(commandName))
                                        throw new Error(`❌ ${text} "${commandName}" already exists with file "${removeHomeDir(GoatBot[setMap].get(commandName).location || "")}"`);

                                const { onFirstChat, onChat, onLoad, onEvent, onAnyEvent } = command;
                                const { envGlobal, envConfig, aliases } = configCommand;

                                const validAliases = [];
                                if (aliases) {
                                        if (!Array.isArray(aliases))
                                                throw new Error("⚠️ The value of \"config.aliases\" must be array!");
                                        for (const alias of aliases) {
                                                if (aliases.filter(item => item == alias).length > 1)
                                                        throw new Error(`❌ alias "${alias}" duplicate in ${text} "${commandName}"`);
                                                if (GoatBot.aliases.has(alias))
                                                        throw new Error(`❌ alias "${alias}" already exists in ${text} "${GoatBot.aliases.get(alias)}"`);
                                                validAliases.push(alias);
                                        }
                                        for (const alias of validAliases)
                                                GoatBot.aliases.set(alias, commandName);
                                }

                                if (envGlobal) {
                                        if (typeof envGlobal != "object" || Array.isArray(envGlobal))
                                                throw new Error("⚠️ the value of \"envGlobal\" must be object");
                                        for (const i in envGlobal) {
                                                if (!configCommands.envGlobal[i]) {
                                                        configCommands.envGlobal[i] = envGlobal[i];
                                                } else {
                                                        const readCommand = readFileSync(pathCommand, "utf-8").replace(envGlobal[i], configCommands.envGlobal[i]);
                                                        writeFileSync(pathCommand, readCommand);
                                                }
                                        }
                                }

                                if (envConfig) {
                                        if (typeof envConfig != "object" || Array.isArray(envConfig))
                                                throw new Error("⚠️ The value of \"envConfig\" must be object");
                                        if (!configCommands[typeEnvCommand])
                                                configCommands[typeEnvCommand] = {};
                                        if (!configCommands[typeEnvCommand][commandName])
                                                configCommands[typeEnvCommand][commandName] = {};
                                        for (const [key, value] of Object.entries(envConfig)) {
                                                if (!configCommands[typeEnvCommand][commandName][key])
                                                        configCommands[typeEnvCommand][commandName][key] = value;
                                                else {
                                                        const readCommand = readFileSync(pathCommand, "utf-8").replace(value, configCommands[typeEnvCommand][commandName][key]);
                                                        writeFileSync(pathCommand, readCommand);
                                                }
                                        }
                                }

                                if (onLoad) {
                                        if (typeof onLoad != "function")
                                                throw new Error("⚠️ The value of \"onLoad\" must be function");
                                        await onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });
                                }

                                if (onChat) GoatBot.onChat.push(commandName);
                                if (onFirstChat) GoatBot.onFirstChat.push({ commandName, threadIDsChattedFirstTime: [] });
                                if (onEvent) GoatBot.onEvent.push(commandName);
                                if (onAnyEvent) GoatBot.onAnyEvent.push(commandName);

                                GoatBot[setMap].set(commandName.toLowerCase(), command);
                                commandLoadSuccess++;
                                commandSuccess.push(commandName);

                                global.GoatBot[isCmd ? "commandFilesPath" : "eventCommandsFilesPath"].push({
                                        filePath: path.normalize(pathCommand),
                                        commandName: [commandName, ...validAliases]
                                });

                                clearInterval(watingSpinner);
                                process.stdout.write('\r\x1b[K');

                        } catch (error) {
                                clearInterval(watingSpinner);
                                process.stdout.write('\r\x1b[K');
                                commandError.push({ name: file, error });
                        }
                }

                // Print success grid
                if (commandSuccess.length > 0) {
                        const gridItems = commandSuccess.map(name => `${colors.green('✔')} ${colors.hex("#90ee90")(name)}`);
                        printGrid(gridItems, 3);
                }

                // Print errors inline
                if (commandError.length > 0) {
                        console.log();
                        for (const item of commandError) {
                                const shortName = item.name.replace(/\.js$/, '');
                                console.log(`  ${colors.red('✘')} ${colors.red(shortName)}: ${colors.hex("#ff9999")(item.error.message)}`);
                        }
                }

                // Summary line
                console.log();
                const successPart = colors.green(`✔ ${commandLoadSuccess} loaded`);
                const failPart = commandError.length > 0 ? `  ${colors.red(`✘ ${commandError.length} failed`)}` : '';
                console.log(`  ${successPart}${failPart}`);
                console.log(colors.hex("#555555")(createLine()));
        }
};
