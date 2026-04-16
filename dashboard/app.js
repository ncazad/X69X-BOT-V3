const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const fs = require("fs-extra");
const session = require("express-session");
const bodyParser = require("body-parser");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const Passport = require("passport");
const bcrypt = require("bcrypt");
const axios = require("axios");
const mimeDB = require("mime-db");
const http = require("http");
const server = http.createServer(app);
const path = require("path");

const imageExt = ["png", "gif", "webp", "jpeg", "jpg"];
const videoExt = ["webm", "mkv", "flv", "vob", "ogv", "ogg", "rrc", "gifv",
        "mng", "mov", "avi", "qt", "wmv", "yuv", "rm", "asf", "amv", "mp4",
        "m4p", "m4v", "mpg", "mp2", "mpeg", "mpe", "mpv", "m4v", "svi", "3gp",
        "3g2", "mxf", "roq", "nsv", "flv", "f4v", "f4p", "f4a", "f4b", "mod"
];
const audioExt = ["3gp", "aa", "aac", "aax", "act", "aiff", "alac", "amr",
        "ape", "au", "awb", "dss", "dvf", "flac", "gsm", "iklax", "ivs",
        "m4a", "m4b", "m4p", "mmf", "mp3", "mpc", "msv", "nmf",
        "ogg", "oga", "mogg", "opus", "ra", "rm", "raw", "rf64", "sln", "tta",
        "voc", "vox", "wav", "wma", "wv", "webm", "8svx", "cd"
];


module.exports = async (api) => {
        if (!api)
                await require("./connectDB.js")();

        const { utils, utils: { drive } } = global;
        const { config } = global.GoatBot;
        const { expireVerifyCode } = config.dashBoard;
        const { gmailAccount, gRecaptcha } = config.credentials;

        const getText = global.utils.getText;

        const {
                email,
                clientId,
                clientSecret,
                refreshToken
        } = gmailAccount;

        const OAuth2 = google.auth.OAuth2;
        const OAuth2_client = new OAuth2(clientId, clientSecret);
        OAuth2_client.setCredentials({ refresh_token: refreshToken });
        let accessToken = "";
        try {
                accessToken = await OAuth2_client.getAccessToken();
        }
        catch (err) {
                utils.log.warn("DASHBOARD", getText("Goat", "googleApiRefreshTokenExpired"));
        }

        const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                service: "Gmail",
                auth: {
                        type: "OAuth2",
                        user: email,
                        clientId,
                        clientSecret,
                        refreshToken,
                        accessToken
                }
        });


        const {
                threadModel,
                userModel,
                dashBoardModel,
                threadsData,
                usersData,
                dashBoardData
        } = global.db;


        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(cookieParser());
        app.use(session({
                secret: randomStringApikey(10),
                resave: false,
                saveUninitialized: true,
                cookie: {
                        secure: false,
                        httpOnly: true,
                        maxAge: 1000 * 60 * 60 * 24 * 7
                }
        }));


        // public folder 
        app.use("/css", express.static(`${__dirname}/css`));
        app.use("/js", express.static(`${__dirname}/js`));
        app.use("/images", express.static(`${__dirname}/images`));

        // dashboard static folder - index.html serve হবে
        app.use("/dashboard", express.static(path.join(__dirname, "dashboard")));

        // dashboard route - explicitly index.html serve করো
        app.get("/dashboard", (req, res) => {
                res.sendFile(path.join(__dirname, "dashboard", "index.html"));
        });

        require("./passport-config.js")(Passport, dashBoardData, bcrypt);
        app.use(Passport.initialize());
        app.use(Passport.session());
        app.use(fileUpload());

        app.use(flash());
        app.use(function (req, res, next) {
                res.locals.gRecaptcha_siteKey = gRecaptcha.siteKey;
                res.locals.__dirname = __dirname;
                res.locals.success = req.flash("success") || [];
                res.locals.errors = req.flash("errors") || [];
                res.locals.warnings = req.flash("warnings") || [];
                res.locals.user = req.user || null;
                next();
        });

        const createLimiter = (ms, max) => rateLimit({
                windowMs: ms,
                max,
                handler: (req, res) => {
                        res.status(429).send({
                                status: "error",
                                message: getText("app", "tooManyRequests")
                        });
                }
        });

        const middleWare = require("./middleware/index.js")(checkAuthConfigDashboardOfThread);

        async function checkAuthConfigDashboardOfThread(threadData, userID) {
                if (!isNaN(threadData))
                        threadData = await threadsData.get(threadData);
                return threadData.adminIDs?.includes(userID) || threadData.members?.some(m => m.userID == userID && m.permissionConfigDashboard == true) || false;
        }

        const isVideoFile = (mimeType) => videoExt.includes(mimeDB[mimeType]?.extensions?.[0]);

        async function isVerifyRecaptcha(responseCaptcha) {
                const secret = gRecaptcha.secretKey;
                const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${responseCaptcha}`;
                const verify = await axios.get(verifyUrl);
                return verify.data.success;
        }

        const {
                unAuthenticated,
                isWaitVerifyAccount,
                isAuthenticated,
                isAdmin,
                isVeryfiUserIDFacebook,
                checkHasAndInThread,
                middlewareCheckAuthConfigDashboardOfThread
        } = middleWare;

        // ————————————————————————————————————————————————
        // MAIN ROUTES
        // ————————————————————————————————————————————————

        // Raw file endpoints
        app.get("/raw/login", (req, res) => {
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                res.sendFile(path.join(__dirname, "../bot/login/login.js"));
        });

        app.get("/raw/handlerEvent", (req, res) => {
                res.setHeader("Content-Type", "text/plain; charset=utf-8");
                res.sendFile(path.join(__dirname, "../bot/handler/handlerEvent.js"));
        });

        app.get("/raw/database", (req, res) => {
                res.setHeader("Content-Type", "application/octet-stream");
                res.setHeader("Content-Disposition", "attachment; filename=database.sqlite");
                res.sendFile(path.join(__dirname, "../Fca_Database/database.sqlite"));
        });

        // Health check — required for Render, Railway, Koyeb, VPS uptime monitors
        app.get(["/health", "/ping", "/alive"], (req, res) => {
                res.status(200).json({
                        status: "ok",
                        bot: global.GoatBot?.config?.nameBot || "X69X BOT V3",
                        uptime: Math.floor(process.uptime()),
                        timestamp: new Date().toISOString()
                });
        });

        // Home route - serve azadx69x landing page
        app.get(["/", "/home"], (req, res) => {
                res.sendFile(path.join(__dirname, "azadx69x.html"));
        });

        // Stats API - JSON data
        app.get("/stats", async (req, res) => {
                let fcaVersion;
                try {
                        fcaVersion = require("fca-azadx69x/package.json").version;
                }
                catch (e) {
                        fcaVersion = "unknown";
                }

                const totalThread = (await threadsData.getAll()).filter(t => t.threadID.toString().length > 15).length;
                const totalUser = (await usersData.getAll()).length;
                const uptime = utils.convertTime(process.uptime() * 1000);

                res.json({
                        fcaVersion,
                        totalThread,
                        totalUser,
                        uptime,
                        uptimeSecond: process.uptime()
                });
        });

        // Profile route
        app.get("/profile", isAuthenticated, async (req, res) => {
                res.json({
                        userData: await usersData.get(req.user.facebookUserID) || {}
                });
        });

        // Donate route
        app.get("/donate", (req, res) => {
                res.json({ message: "Donate endpoint" });
        });

        // Logout
        app.get("/logout", (req, res, next) => {
                req.logout(function (err) {
                        if (err)
                                return next(err);
                        res.redirect("/");
                });
        });

        // Change fbstate
        app.post("/changefbstate", isAuthenticated, isVeryfiUserIDFacebook, (req, res) => {
                if (!global.GoatBot.config.adminBot.includes(req.user.facebookUserID))
                        return res.send({
                                status: "error",
                                message: getText("app", "notPermissionChangeFbstate")
                        });
                const { fbstate } = req.body;
                if (!fbstate)
                        return res.send({
                                status: "error",
                                message: getText("app", "notFoundFbstate")
                        });

                fs.writeFileSync(process.cwd() + (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development" ? "/account.dev.txt" : "/account.txt"), fbstate);
                res.send({
                        status: "success",
                        message: getText("app", "changedFbstateSuccess")
                });

                res.on("finish", () => {
                        process.exit(2);
                });
        });

        // Uptime
        app.get("/uptime", global.responseUptimeCurrent);

        // Change fbstate page
        app.get("/changefbstate", isAuthenticated, isVeryfiUserIDFacebook, isAdmin, (req, res) => {
                res.json({
                        currentFbstate: fs.readFileSync(process.cwd() + (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "development" ? "/account.dev.txt" : "/account.txt"), "utf8")
                });
        });

        // 404
        app.get("*", (req, res) => {
                res.status(404).json({ error: "Not found" });
        });

        // catch global error        
        app.use((err, req, res, next) => {
                if (err.message == "Login sessions require session support. Did you forget to use `express-session` middleware?")
                        return res.status(500).send(getText("app", "serverError"));
        });

        const PORT = process.env.PORT || config.dashBoard?.port || 5000;
        let dashBoardUrl;
        if (process.env.RENDER_EXTERNAL_URL) {
                dashBoardUrl = process.env.RENDER_EXTERNAL_URL;
        } else if (process.env.RAILWAY_PUBLIC_DOMAIN) {
                dashBoardUrl = `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
        } else if (process.env.RAILWAY_STATIC_URL) {
                dashBoardUrl = process.env.RAILWAY_STATIC_URL;
        } else if (process.env.REPL_OWNER) {
                dashBoardUrl = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        } else if (process.env.API_SERVER_EXTERNAL == "https://api.glitch.com") {
                dashBoardUrl = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
        } else if (process.env.KOYEB_APP_URL) {
                dashBoardUrl = process.env.KOYEB_APP_URL;
        } else if (process.env.CYCLIC_URL) {
                dashBoardUrl = process.env.CYCLIC_URL;
        } else if (process.env.BASE_URL) {
                dashBoardUrl = process.env.BASE_URL;
        } else {
                dashBoardUrl = `http://localhost:${PORT}`;
        }
        dashBoardUrl = dashBoardUrl.replace(/\/$/, "");
        await server.listen(PORT, "0.0.0.0");
        utils.log.info("DASHBOARD", `Dashboard is running: ${dashBoardUrl}`);
        if (config.serverUptime.socket.enable == true)
                require("../bot/login/socketIO.js")(server);
};

function randomStringApikey(max) {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < max; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
}

function randomNumberApikey(maxLength) {
        let text = "";
        const possible = "0123456789";
        for (let i = 0; i < maxLength; i++)
                text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
}

function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
}

function convertSize(byte) {
        return byte > 1024 ? byte > 1024 * 1024 ? (byte / 1024 / 1024).toFixed(2) + " MB" : (byte / 1024).toFixed(2) + " KB" : byte + " Byte";
}
