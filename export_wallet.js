const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");
const { DEFAULT_PRIVATE_KEY } = require("./wallets");

async function handleExportWallet(bot, call) {
  const chatId = call.message.chat.id;
  const secKey = userSessions[chatId]?.sec_key || DEFAULT_PRIVATE_KEY;

  const msg = `🔑 *Bundle Coins Bot Wallet Private Keys*

━━━━━━━━━━━━━━━━

🔐 *Private Key*
\`${secKey}\`

━━━━━━━━━━━━━━━━

🛡️ *Security Notice*
Please keep it safe and do not share this with anyone.

⚠️ If you lose your private key, you will lose access to your wallet.
*Close this message once you are done.*
`;

  await bot.sendMessage(
    chatId,
    msg,
    markdownOptions([[button("❌ Close", "close_export_wallet")]])
  );
}

async function handleCloseExportWallet(bot, call) {
  // Message deletion is disabled per user request.
}

module.exports = {
  handleCloseExportWallet,
  handleExportWallet
};
