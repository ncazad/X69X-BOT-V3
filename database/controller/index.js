const { graphQlQueryToJson } = require("graphql-query-to-json");
const ora = require("ora");
const { log, getText } = global.utils;
const { config } = global.GoatBot;
const databaseType = config.database.type;

function fakeGraphql(query, data, obj = {}) {
        if (typeof query != "string" && typeof query != "object")
                throw new Error(`The "query" argument must be of type string or object, got ${typeof query}`);
        if (query == "{}" || !data)
                return data;
        if (typeof query == "string")
                query = graphQlQueryToJson(query).query;
        const keys = query ? Object.keys(query) : [];
        for (const key of keys) {
                if (typeof query[key] === 'object') {
                        if (!Array.isArray(data[key]))
                                obj[key] = data.hasOwnProperty(key) ? fakeGraphql(query[key], data[key] || {}, obj[key]) : null;
                        else
                                obj[key] = data.hasOwnProperty(key) ? data[key].map(item => fakeGraphql(query[key], item, {})) : null;
                }
                else
                        obj[key] = data.hasOwnProperty(key) ? data[key] : null;
        }
        return obj;
}

module.exports = async function (api) {
        var threadModel, userModel, dashBoardModel, globalModel, sequelize = null;

        switch (databaseType) {
                case "mongodb": {
                        const spin = ora({
                                text: getText('indexController', 'connectingMongoDB'),
                                spinner: {
                                        interval: 80,
                                        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
                                }
                        });
                        const defaultClearLine = process.stderr.clearLine;
                        process.stderr.clearLine = function () { };
                        spin.start();
                        try {
                                var mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_URI || config.database.uriMongodb;
                                var { threadModel, userModel, dashBoardModel, globalModel } = await require("../connectDB/connectMongoDB.js")(mongoUri);
                                spin.stop();
                                process.stderr.clearLine = defaultClearLine;
                                log.info("MONGODB", getText("indexController", "connectMongoDBSuccess"));
                        }
                        catch (err) {
                                spin.stop();
                                process.stderr.clearLine = defaultClearLine;
                                log.err("MONGODB", getText("indexController", "connectMongoDBError"), err);
                                process.exit();
                        }
                        break;
                }
                case "sqlite": {
                        const spin = ora({
                                text: getText('indexController', 'connectingMySQL'),
                                spinner: {
                                        interval: 80,
                                        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
                                }
                        });
                        const defaultClearLine = process.stderr.clearLine;
                        process.stderr.clearLine = function () { };
                        spin.start();
                        try {
                                var { threadModel, userModel, dashBoardModel, globalModel, sequelize } = await require("../connectDB/connectSqlite.js")();
                                process.stderr.clearLine = defaultClearLine;
                                spin.stop();
                                log.info("SQLITE", getText("indexController", "connectMySQLSuccess"));
                        }
                        catch (err) {
                                process.stderr.clearLine = defaultClearLine;
                                spin.stop();
                                log.err("SQLITE", getText("indexController", "connectMySQLError"), err);
                                process.exit();
                        }
                        break;
                }
                default:
                        log.err("DATABASE", `Unknown database type: ${databaseType}`);
                        process.exit();
                        break;
        }

        let usersData;
        try {
                const usersDataModule = require("./usersData.js");
                usersData = typeof usersDataModule === 'function'
                        ? await usersDataModule(databaseType, userModel, api, fakeGraphql)
                        : createEmergencyUsersData(api);
        } catch (error) {
                log.err("DATABASE", "Failed to load usersData:", error);
                usersData = createEmergencyUsersData(api);
        }

        let threadsData, dashBoardData, globalData;

        try {
                const threadsDataModule = require("./threadsData.js");
                threadsData = typeof threadsDataModule === 'function'
                        ? await threadsDataModule(databaseType, threadModel, api, fakeGraphql)
                        : createEmergencyThreadsData(api);
        } catch (error) {
                log.err("DATABASE", "Failed to load threadsData:", error);
                threadsData = createEmergencyThreadsData(api);
        }

        try {
                const dashBoardDataModule = require("./dashBoardData.js");
                dashBoardData = typeof dashBoardDataModule === 'function'
                        ? await dashBoardDataModule(databaseType, dashBoardModel, fakeGraphql)
                        : createEmergencyDashBoardData();
        } catch (error) {
                log.err("DATABASE", "Failed to load dashBoardData:", error);
                dashBoardData = createEmergencyDashBoardData();
        }

        try {
                const globalDataModule = require("./globalData.js");
                globalData = typeof globalDataModule === 'function'
                        ? await globalDataModule(databaseType, globalModel, fakeGraphql)
                        : createEmergencyGlobalData();
        } catch (error) {
                log.err("DATABASE", "Failed to load globalData:", error);
                globalData = createEmergencyGlobalData();
        }

        if (usersData) {
                if (!usersData.getName || typeof usersData.getName !== 'function') {
                        log.warn("DATABASE", "usersData.getName missing — adding fallback");
                        usersData.getName = async (userID) => {
                                try {
                                        if (userModel?.findOne) {
                                                const user = await userModel.findOne({ where: { userID: userID.toString() } });
                                                if (user?.name) return user.name;
                                        }
                                        if (api?.getUserInfo) {
                                                const info = await api.getUserInfo(userID);
                                                return info[userID]?.name || `User_${userID}`;
                                        }
                                } catch { }
                                return `User_${userID}`;
                        };
                } else {
                        const originalGetName = usersData.getName;
                        usersData.getName = async function (userID) {
                                try {
                                        return await originalGetName.call(this, userID);
                                } catch (error) {
                                        try {
                                                if (api?.getUserInfo) {
                                                        const info = await api.getUserInfo(userID);
                                                        return info[userID]?.name || `User_${userID}`;
                                                }
                                        } catch { }
                                        return `User_${userID}`;
                                }
                        };
                }

                const essentialMethods = ['get', 'set', 'getAll', 'create'];
                for (const method of essentialMethods) {
                        if (!usersData[method] || typeof usersData[method] !== 'function') {
                                usersData[method] = async () => null;
                        }
                }
        } else {
                usersData = createEmergencyUsersData(api);
        }

        global.db = {
                ...global.db,
                threadModel,
                userModel,
                dashBoardModel,
                globalModel,
                threadsData,
                usersData,
                dashBoardData,
                globalData,
                sequelize
        };

        return {
                threadModel,
                userModel,
                dashBoardModel,
                globalModel,
                threadsData,
                usersData,
                dashBoardData,
                globalData,
                sequelize,
                databaseType
        };
};

function createEmergencyUsersData(api) {
        return {
                getAll: async () => [],
                getName: async (userID) => {
                        try {
                                if (api?.getUserInfo) {
                                        const info = await api.getUserInfo(userID);
                                        return info[userID]?.name || `User_${userID}`;
                                }
                        } catch { }
                        return `User_${userID}`;
                },
                get: async () => null,
                set: async (userID, data = {}) => ({ userID, name: data.name || 'User' }),
                update: async () => null,
                delete: async () => false,
                count: async () => 0,
                find: async () => [],
                getMoney: async () => 0,
                addMoney: async () => null,
                subtractMoney: async () => null,
                refreshInfo: async () => null,
                deleteKey: async () => null,
                remove: async () => true,
                existsSync: () => false,
                create: async () => null
        };
}

function createEmergencyThreadsData() {
        return {
                getAll: async () => [],
                getName: async (threadID) => `Thread_${threadID}`,
                get: async () => null,
                create: async (threadID, data) => ({ threadID, threadName: data?.threadName || 'Thread' }),
                set: async () => null,
                refreshInfo: async () => null
        };
}

function createEmergencyDashBoardData() {
        return {
                getAll: async () => [],
                get: async () => null,
                set: async () => null
        };
}

function createEmergencyGlobalData() {
        return {
                getAll: async () => [],
                get: async () => null,
                set: async () => null
        };
}
