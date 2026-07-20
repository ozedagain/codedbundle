const { button, markdownOptions } = require("./telegram-ui");

async function handlePositions(bot, call) {
  const chatId = call.message.chat.id;
  const text = `📉 *Bundle Coins Bot Positions*

━━━━━━━━━━━━━━━━

*You currently have no active positions.*

Once you start trading, your transactions will be displayed here.`;

  await bot.sendMessage(
    chatId,
    text,
    markdownOptions([[button("🚀 Invest", "StartNexisMEVRefresh"), button("❌ Close", "positions_close")]])
  );
}

async function handlePositionsCallback(bot, call) {
  if (call.data === "positions_close") {
    try {
      await bot.deleteMessage(call.message.chat.id, call.message.message_id);
    } catch (_) {
      // Ignore Telegram delete failures.
    }
  }
}

module.exports = {
  handlePositions,
  handlePositionsCallback
};
