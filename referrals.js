const { button, inlineKeyboard } = require("./telegram-ui");

async function handleReferrals(bot, call) {
  const chatId = call.message.chat.id;
  const msg = `
🚀 *Earn 20% SOL From Every Friend You Invite!*

Invite your friends, and once they start using *Bundle Coins Bot*, you earn *20% of their deposit* instantly.

━━━━━━━━━━━━━━━━

🔍 *Here's how it works:*
1. Share your unique referral link.
2. Friend deposits and starts *Bundle Coins Bot*.
3. You receive *20% of their deposit* to your wallet automatically.

━━━━━━━━━━━━━━━━

🔥 *No limits. No waiting.*
Keep inviting, keep stacking *SOL*.

🔗 [Your Referral Link](https://t.me/BundleCoinsBot?start=${chatId})
📤 *Copy & Start Earning*

_P.S. Rewards auto-claim. The more friends, the fatter your SOL stack._
`;

  await bot.sendMessage(chatId, msg, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
    ...inlineKeyboard([[button("❌ Close", "close_referrals")]])
  });
}

async function handleCloseReferrals(bot, call) {
  try {
    await bot.deleteMessage(call.message.chat.id, call.message.message_id);
  } catch (_) {
    // Ignore Telegram delete failures.
  }
}

module.exports = {
  handleCloseReferrals,
  handleReferrals
};
