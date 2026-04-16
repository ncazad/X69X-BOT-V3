const chalk = require('chalk');
const path = require('path');
const { log, getText } = global.utils;

const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
let spinIdx = 0;

function startSpinner(label) {
    spinIdx = 0;
    const interval = setInterval(() => {
        process.stdout.write(`\r  ${chalk.cyan(spinner[spinIdx % spinner.length])} ${chalk.hex('#cccccc')(label)}   `);
        spinIdx++;
    }, 80);
    return interval;
}

function stopSpinner(interval, icon, label, extra = '') {
    clearInterval(interval);
    process.stdout.write('\r\x1b[K');
    console.log(`  ${icon} ${label}${extra ? chalk.gray('  ' + extra) : ''}`);
}

module.exports = async function (api, createLine) {
    const startTime = Date.now();

    console.log(chalk.hex("#f5ab00")(createLine("📦 DATABASE")));

    // Step 1: Connect DB & load all data
    const spin1 = startSpinner('Connecting to database...');
    let controller;
    try {
        controller = await require(path.join(__dirname, '..', '..', 'database/controller/index.js'))(api);
        stopSpinner(spin1, chalk.green('✔'), chalk.green('Database connected'), `(${controller.databaseType || 'mongodb'})`);
    } catch (err) {
        stopSpinner(spin1, chalk.red('✘'), chalk.red('Database connection failed'));
        console.log(chalk.red(`    ${err.message}`));
        throw err;
    }

    const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, sequelize } = controller;

    if (!global.db?.allThreadData || !global.db?.allUserData) {
        console.log(chalk.red('  ✘ Database not properly initialized'));
        throw new Error('Database initialization failed');
    }

    // Step 2: Load thread & user data
    const spin2 = startSpinner('Loading threads & users...');
    await new Promise(r => setTimeout(r, 100));
    const validThreads = global.db.allThreadData.filter(t => t.threadID?.toString().length > 15);
    const totalUsers = global.db.allUserData.length;
    stopSpinner(spin2, chalk.green('✔'), chalk.green('Data loaded'));

    // Summary box
    const threadLine = `  ${chalk.hex('#888888')('├')} ${chalk.white('Threads:')} ${chalk.yellow(validThreads.length.toLocaleString())}`;
    const userLine   = `  ${chalk.hex('#888888')('└')} ${chalk.white('Users:  ')} ${chalk.yellow(totalUsers.toLocaleString())}`;
    console.log(threadLine);
    console.log(userLine);

    // Step 3: Auto sync (if enabled)
    if (api && global.GoatBot?.config?.database?.autoSyncWhenStart === true) {
        console.log(chalk.hex("#f5ab00")(createLine("🔄 AUTO SYNC")));

        const spin3 = startSpinner('Syncing thread data from Facebook...');
        const originalLogLevel = api.getOptions()?.logLevel || 'info';
        let created = 0, refreshed = 0, failed = 0, left = 0;

        try {
            api.setOptions({ logLevel: 'silent' });

            const allThreadInfo = await fetchAllThreads(api);
            const existingThreadMap = new Map(global.db.allThreadData.map(t => [t.threadID, t]));
            const threadDataWillSet = [];
            const batchSize = 50;
            const botID = api.getCurrentUserID();

            for (let i = 0; i < allThreadInfo.length; i += batchSize) {
                const batch = allThreadInfo.slice(i, i + batchSize);
                await Promise.all(batch.map(async (threadInfo) => {
                    if (!threadInfo?.threadID) return;
                    try {
                        const existing = existingThreadMap.get(threadInfo.threadID);
                        if (threadInfo.isGroup && !existing) {
                            const t = await threadsData.create(threadInfo.threadID, threadInfo);
                            threadDataWillSet.push(t);
                            created++;
                        } else if (existing) {
                            const t = await threadsData.refreshInfo(threadInfo.threadID, threadInfo);
                            threadDataWillSet.push(t);
                            existingThreadMap.delete(threadInfo.threadID);
                            refreshed++;
                        }
                        global.db.receivedTheFirstMessage[threadInfo.threadID] = true;
                    } catch { failed++; }
                }));
            }

            const remaining = Array.from(existingThreadMap.values());
            const activeIDs = new Set(allThreadInfo.map(t => t.threadID));
            for (const thread of remaining) {
                if (!activeIDs.has(thread.threadID)) {
                    const me = thread.members?.find(m => m.userID == botID);
                    if (me) {
                        me.inGroup = false;
                        try { await threadsData.set(thread.threadID, { members: thread.members }); left++; } catch { }
                    }
                }
            }

            global.db.allThreadData = threadDataWillSet;
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            stopSpinner(spin3, chalk.green('✔'), chalk.green('Sync complete'), `${duration}s`);

            if (created > 0)   console.log(`  ${chalk.hex('#888888')('├')} ${chalk.white('New threads: ')} ${chalk.cyan(created)}`);
            if (refreshed > 0) console.log(`  ${chalk.hex('#888888')('├')} ${chalk.white('Refreshed:   ')} ${chalk.cyan(refreshed)}`);
            if (left > 0)      console.log(`  ${chalk.hex('#888888')('├')} ${chalk.yellow('Left groups: ')} ${chalk.yellow(left)}`);
            if (failed > 0)    console.log(`  ${chalk.hex('#888888')('└')} ${chalk.red('Failed:      ')} ${chalk.red(failed)}`);

        } catch (err) {
            stopSpinner(spin3, chalk.red('✘'), chalk.red(`Sync failed: ${err.message}`));
        } finally {
            api.setOptions({ logLevel: originalLogLevel });
        }
    }

    console.log(chalk.hex("#f5ab00")(createLine("✅ READY")));

    return {
        threadModel: threadModel || null,
        userModel: userModel || null,
        dashBoardModel: dashBoardModel || null,
        globalModel: globalModel || null,
        threadsData,
        usersData,
        dashBoardData,
        globalData,
        sequelize
    };
};

async function fetchAllThreads(api, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const threads = await api.getThreadList(5000, null, 'INBOX');
            return threads.filter(t => t && t.threadID);
        } catch (err) {
            if (attempt === maxRetries) throw err;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}
