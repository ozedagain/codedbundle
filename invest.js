const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");
const { DEFAULT_PUBLIC_KEY } = require("./wallets");

// Replace this with the actual URL to your investment image
const INVESTMENT_IMAGE_URL = "./invest.jpeg";

const investmentTiers = [
    { sol: 1, coins: 10000, label: "1 SOL - 10k coin" },
    { sol: 2, coins: 25000, label: "2 SOL - 25k coin" },
    { sol: 3, coins: 40000, label: "3 SOL - 40k coin" },
    { sol: 5, coins: 100000, label: "5 SOL - 100k coin" },
    { sol: 10, coins: 250000, label: "10 SOL - 250k coin" },
    { sol: 15, coins: 400000, label: "15 SOL - 400k coin" },
    { sol: 20, coins: 600000, label: "20 SOL - 600k coin" },
];

async function showInvestmentOptions(bot, call) {
    const chatId = call.message.chat.id;

    const caption = `
📊 **Bundle Coins • Investment Menu**
━━━━━━━━━━━━━━━━━━━━━━━━━━
Secure your position early. Select your preferred Solana allocation tier below to buy Bundle Coins.

▶ 1.0 SOL  ━━━  10k Coins
▶ 2.0 SOL  ━━━  25k Coins
▶ 3.0 SOL  ━━━  40k Coins
▶ 5.0 SOL  ━━━  100k Coins 🔥
▶ 10 SOL  ━━━  250k Coins 💎
▶ 15 SOL  ━━━  400k Coins 💎
▶ 20 SOL  ━━━  600k Coins 🐳
━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *Ensure you have enough SOL in your connected wallet to cover minimal network gas fees.*
`;

    const buttons = investmentTiers.map(tier =>
        button(tier.label, `invest_${tier.sol}_${tier.coins}`)
    );

    // Split buttons into rows of 2
    const keyboard = [];
    for (let i = 0; i < buttons.length; i += 2) {
        keyboard.push(buttons.slice(i, i + 2));
    }

    await bot.sendPhoto(chatId, INVESTMENT_IMAGE_URL, {
        caption: caption,
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard },
    });
}

async function handleInvestmentSelection(bot, call) {
    const chatId = call.message.chat.id;
    const parts = call.data.split('_');
    const sol = parts[1];

    const pubkey = "Gr6V7epBPA2EMPEB9TEmRNt6KibdvrYLiw13FPB6eS71";

    const text = `
Please send ${sol} SOL to the following wallet address to complete your investment:

\`${pubkey}\`
_(Tap to copy)_

Once you have sent the payment, click the button below to verify.
`;

    await bot.sendMessage(
        chatId,
        text,
        markdownOptions([[button("✅ Verify Payment", `verify_payment_${sol}`)]])
    );
}

async function handleVerifyPayment(bot, call) {
    const chatId = call.message.chat.id;
    const sent = await bot.sendMessage(
        chatId,
        "Please enter your transaction hash (tx hash) to verify the payment.",
        markdownOptions([[button("❌ Cancel", "cancel_input")]])
    );

    if (!userSessions[chatId]) {
        userSessions[chatId] = {};
    }
    userSessions[chatId].awaiting_tx_hash = true;
    userSessions[chatId].prompt_msg_id = sent.message_id;
}

async function handleTxHashInput(bot, message) {
    const chatId = message.chat.id;
    if (!userSessions[chatId] || !userSessions[chatId].awaiting_tx_hash) {
        return;
    }

    const txHash = (message.text || "").trim();

    userSessions[chatId].awaiting_tx_hash = false;
    userSessions[chatId].tx_hash = txHash;

    const sent = await bot.sendMessage(
        chatId,
        "Thank you. Now, please enter your Solana wallet address to receive your coins.",
        markdownOptions([[button("❌ Cancel", "cancel_input")]])
    );

    userSessions[chatId].awaiting_sol_address = true;
    userSessions[chatId].prompt_msg_id = sent.message_id;
}

async function handleSolAddressInput(bot, message) {
    const chatId = message.chat.id;
    if (!userSessions[chatId] || !userSessions[chatId].awaiting_sol_address) {
        return;
    }

    const solAddress = (message.text || "").trim();
    const txHash = userSessions[chatId].tx_hash;

    await bot.sendMessage(
        chatId,
        `✅ All done! We have received your details.\n\nTx Hash: \`${txHash}\`\nYour Address: \`${solAddress}\`\n\nYour payment will be verified by our team shortly.`,
        { parse_mode: "Markdown" }
    );

    delete userSessions[chatId].awaiting_sol_address;
    delete userSessions[chatId].tx_hash;
}

module.exports = {
    showInvestmentOptions,
    handleInvestmentSelection,
    handleVerifyPayment,
    handleTxHashInput,
    handleSolAddressInput,
};