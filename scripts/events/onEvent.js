module.exports = {
    config: {
        name: "onEvent",
        version: "1.1",
        author: "NTKhang",
        description: "Loop to all event in global.GoatBot.onEvent and run when have new event",
        category: "events"
    },

    onStart: async ({ api, args, message, event, threadsData, usersData, dashBoardData, threadModel, userModel, dashBoardModel, role, commandName }) => {
        // Move access inside function to avoid undefined errors
        const allOnEvent = global.GoatBot?.onEvent || [];

        for (const item of allOnEvent) {
            if (typeof item === "string") continue; // skip command names
            if (typeof item.onStart === "function") {
                await item.onStart({
                    api,
                    args,
                    message,
                    event,
                    threadsData,
                    usersData,
                    threadModel,
                    userModel,
                    dashBoardData,
                    dashBoardModel,
                    role,
                    commandName
                });
            }
        }
    }
};
