const { button, markdownOptions } = require("./telegram-ui");

async function handleInfo(bot, call) {
  const chatId = call.message.chat.id;
  const infoText = `
🧠 *What is Bundle Coins Bot?*

━━━━━━━━━━━━━━━━

*Bundle Coins Bot* is an automated burn-and-swap platform that simplifies token migrations.

Users burn their old tokens, submit their wallet for verification, and receive the equivalent value in V2 tokens through a secure, transparent, and efficient process.
`;

  await bot.sendMessage(
    chatId,
    infoText,
    markdownOptions([[button("❌ Close", "close_info")]])
  );
}

async function handleCloseInfo(bot, call) {
  try {
    await bot.deleteMessage(call.message.chat.id, call.message.message_id);
  } catch (_) {
    // Ignore Telegram delete failures.
  }
}

module.exports = {
  handleCloseInfo,
  handleInfo
};
