const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");
const { DEFAULT_PUBLIC_KEY } = require("./wallets");

async function handleWallet(bot, call) {
  const chatId = call.message.chat.id;

  if (!userSessions[chatId]) {
    userSessions[chatId] = {};
  }

  const pubkey = userSessions[chatId].pubkey || DEFAULT_PUBLIC_KEY;
  const text = `
🚀 *Bundle Coins Bot Wallet*
_Your automated burn-and-swap partner_

━━━━━━━━━━━━━━━━

🔑 *Main Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.0 SOL\` \`($0.0)\`

━━━━━━━━━━━━━━━━

⚡ *Migration Engine*
Harness secure burn-and-swap workflows to simplify token migrations.
`;

  const sent = await bot.sendMessage(
    chatId,
    text,
    markdownOptions([
      [button("👛 Import Wallet", "import_wallet"), button("Export Wallet", "export_wallet")],
      [button("💸 Withdraw SOL", "withdraw_nexis"), button("❌ Close", "close_wallet_menu")]
    ])
  );

  userSessions[chatId].wallet_msg_id = sent.message_id;
}

async function handleCloseWallet(bot, call) {
  const chatId = call.message.chat.id;
  const msgId = userSessions[chatId]?.wallet_msg_id;

  if (msgId) {
    // Message deletion is disabled per user request.
  }
}

module.exports = {
  handleCloseWallet,
  handleWallet
};
