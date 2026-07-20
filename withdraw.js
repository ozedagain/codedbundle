const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");
const { DEFAULT_PUBLIC_KEY } = require("./wallets");

async function handleWithdraw(bot, call) {
  const chatId = call.message.chat.id;
  const pubkey = userSessions[chatId]?.pubkey || DEFAULT_PUBLIC_KEY;

  const msg = `❌ *Cannot Withdraw*
Your current balance is *insufficient*.

━━━━━━━━━━━━━━━━

🔑 *Main Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.0 SOL ($0.0)\`

━━━━━━━━━━━━━━━━

💡 _Please fund your wallet to make withdrawals._
`;

  await bot.sendMessage(
    chatId,
    msg,
    markdownOptions([[button("❌ Close", "close_withdraw")]])
  );
}

async function handleCloseWithdraw(bot, call) {
  try {
    await bot.deleteMessage(call.message.chat.id, call.message.message_id);
  } catch (error) {
    console.log(`Could not delete withdraw message: ${error.message}`);
  }
}

module.exports = {
  handleCloseWithdraw,
  handleWithdraw
};
