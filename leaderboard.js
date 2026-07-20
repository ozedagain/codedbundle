const { button, markdownOptions } = require("./telegram-ui");

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
}

async function handleLeaderboard(bot, call) {
  const chatId = call.message.chat.id;
  const leaderboardText = `
🌟 *Daily Top Bundle Coins Bot Earners* 🌟

━━━━━━━━━━━━━━━━

🥇 *User #13813* - \`393.05 SOL\`
🥈 *User #18198* - \`380.65 SOL\`
🥉 *User #14394* - \`330.81 SOL\`
4️⃣ *User #12621* - \`313.02 SOL\`
5️⃣ *User #14307* - \`311.76 SOL\`
6️⃣ *User #11367* - \`276.83 SOL\`
7️⃣ *User #17301* - \`260.59 SOL\`
8️⃣ *User #14870* - \`249.87 SOL\`
9️⃣ *User #13914* - \`214.85 SOL\`
🔟 *User #17989* - \`185.71 SOL\`

━━━━━━━━━━━━━━━━

🕰️ *Last updated:* ${formatDate(new Date())}
`;

  await bot.sendMessage(
    chatId,
    leaderboardText,
    markdownOptions([[button("❌ Close", "leaderboard_close")]])
  );
}

async function handleLeaderboardClose(bot, call) {
  try {
    await bot.deleteMessage(call.message.chat.id, call.message.message_id);
  } catch (_) {
    // Ignore Telegram delete failures.
  }
}

module.exports = {
  handleLeaderboard,
  handleLeaderboardClose
};
