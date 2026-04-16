const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "adduser",
    version: "1.5",
    author: "NTKhang",// fixed by Azadx69x 
    countDown: 5,
    role: 1,
    description: {
      vi: "Thêm thành viên vào box chat của bạn",
      en: "Add user to box chat of you"
    },
    category: "box chat",
    guide: {
      en: "{pn} [link profile | uid]"
    }
  },

  langs: {
    vi: {
      alreadyInGroup: "Đã có trong nhóm",
      successAdd: "- Đã thêm thành công %1 thành viên vào nhóm",
      failedAdd: "- Không thể thêm %1 thành viên vào nhóm",
      approve: "- Đã thêm %1 thành viên vào danh sách phê duyệt",
      invalidLink: "Vui lòng nhập link facebook hợp lệ",
      cannotGetUid: "Không thể lấy được uid của người dùng này",
      linkNotExist: "Profile url này không tồn tại",
      cannotAddUser: "Bot bị chặn tính năng hoặc người dùng này chặn người lạ thêm vào nhóm"
    },
    en: {
      alreadyInGroup: "Already in group",
      successAdd: "- Successfully added %1 members to the group",
      failedAdd: "- Failed to add %1 members to the group",
      approve: "- Added %1 members to the approval list",
      invalidLink: "Please enter a valid facebook link",
      cannotGetUid: "Cannot get uid of this user",
      linkNotExist: "This profile url does not exist",
      cannotAddUser: "Bot is blocked or this user blocked strangers from adding to the group"
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    const success = [
      { type: "success", users: [] },
      { type: "waitApproval", users: [] }
    ];
    const failed = [];

    function checkErrorAndPush(messageError, user) {
      const findType = failed.find(err => err.type === messageError);
      if (findType) findType.users.push(user);
      else failed.push({ type: messageError, users: [user] });
    }

    const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;

    for (const item of args) {
      let uid;
      let userName = item;
      let continueLoop = false;

      if (isNaN(item) && regExMatchFB.test(item)) {
        for (let i = 0; i < 10; i++) {
          try {
            uid = await findUid(item);
            const member = members.find(m => m.userID == uid);
            if (member) userName = member.name || item;
            break;
          } catch (err) {
            if (err.name === "SlowDown" || err.name === "CannotGetData") {
              await sleep(1000);
              continue;
            } else {
              checkErrorAndPush(
                err.name === "InvalidLink" ? getLang("invalidLink") :
                err.name === "CannotGetData" ? getLang("cannotGetUid") :
                err.name === "LinkNotExist" ? getLang("linkNotExist") :
                err.message,
                { uid: item, name: item }
              );
              continueLoop = true;
              break;
            }
          }
        }
      } else if (!isNaN(item)) {
        uid = item;
      } else continue;

      if (continueLoop) continue;

      if (members.some(m => m.userID == uid && m.inGroup)) {
        checkErrorAndPush(getLang("alreadyInGroup"), { uid, name: userName });
      } else {
        try {
          await api.addUserToGroup(uid, event.threadID);
          const userObj = { uid, name: userName };
          if (approvalMode === true && !adminIDs.includes(botID))
            success[1].users.push(userObj);
          else
            success[0].users.push(userObj);
        } catch (err) {
          checkErrorAndPush(getLang("cannotAddUser"), { uid, name: userName });
        }
      }
    }
    
    let msg = "";

    if (success[0].users.length) {
      msg += `✅ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀:\n`;
      success[0].users.forEach(u => {
        msg += `🎀 𝗡𝗮𝗺𝗲: ${u.name}\n🪪 𝗨𝗜𝗗: ${u.uid}\n`;
      });
    }

    if (success[1].users.length) {
      msg += `\n⏳ 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹 𝗟𝗶𝘀𝘁:\n`;
      success[1].users.forEach(u => {
        msg += `🎀 𝗡𝗮𝗺𝗲: ${u.name}\n🪪 𝗨𝗜𝗗: ${u.uid}\n`;
      });
    }

    if (failed.length) {
      msg += `\n❌ 𝗙𝗮𝗶𝗹𝗲𝗱:\n`;
      failed.forEach(errItem => {
        errItem.users.forEach(u => {
          msg += `🎀 𝗡𝗮𝗺𝗲: ${u.name}\n🪪 𝗨𝗜𝗗: ${u.uid}\n✖ 𝗘𝗿𝗿𝗼𝗿 𝗠𝘀𝗴: ${errItem.type}\n`;
        });
      });
    }

    await message.reply(msg);
  }
};
