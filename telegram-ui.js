function inlineKeyboard(rows) {
  return {
    reply_markup: {
      inline_keyboard: rows
    }
  };
}

function button(text, callbackData) {
  return { text, callback_data: callbackData };
}

function urlButton(text, url) {
  return { text, url };
}

function markdownOptions(rows, extra = {}) {
  return {
    parse_mode: "Markdown",
    ...inlineKeyboard(rows),
    ...extra
  };
}

module.exports = {
  button,
  inlineKeyboard,
  markdownOptions,
  urlButton
};
