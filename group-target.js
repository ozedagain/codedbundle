const fs = require("fs");
const path = require("path");
const { GROUP_CHAT_ID } = require("./config");

const storagePath = path.join(__dirname, "group-target.json");
let additionalGroupChatIds = [];

try {
  const savedTarget = JSON.parse(fs.readFileSync(storagePath, "utf8"));
  if (Array.isArray(savedTarget.additionalGroupChatIds)) {
    additionalGroupChatIds = savedTarget.additionalGroupChatIds.filter(Number.isFinite);
  } else if (Number.isFinite(savedTarget.chatId) && savedTarget.chatId !== GROUP_CHAT_ID) {
    additionalGroupChatIds = [savedTarget.chatId];
  }
} catch (_) {
  // Use the configured group until /tgadd registers additional destinations.
}

function getGroupChatIds() {
  return [...new Set([GROUP_CHAT_ID, ...additionalGroupChatIds])];
}

function saveAdditionalGroups() {
  fs.writeFileSync(storagePath, JSON.stringify({ additionalGroupChatIds }, null, 2));
}

function addGroupChatId(chatId) {
  if (chatId !== GROUP_CHAT_ID && !additionalGroupChatIds.includes(chatId)) {
    additionalGroupChatIds.push(chatId);
    saveAdditionalGroups();
    return true;
  }
  return false;
}

function removeGroupChatId(chatId) {
  const originalLength = additionalGroupChatIds.length;
  additionalGroupChatIds = additionalGroupChatIds.filter((id) => id !== chatId);
  if (additionalGroupChatIds.length !== originalLength) {
    saveAdditionalGroups();
    return true;
  }
  return false;
}

module.exports = {
  addGroupChatId,
  getGroupChatIds,
  removeGroupChatId
};
