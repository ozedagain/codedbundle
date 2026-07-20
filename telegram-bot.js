const fs = require("node:fs");
const path = require("node:path");

class TelegramBot {
  constructor(token) {
    this.token = token;
    this.apiBase = `https://api.telegram.org/bot${token}`;
    this.handlers = {
      message: [],
      callback_query: []
    };
  }

  on(event, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event].push(handler);
  }

  async processUpdate(update) {
    if (update.message) {
      await this.#emit("message", update.message);
    }
    if (update.callback_query) {
      await this.#emit("callback_query", update.callback_query);
    }
  }

  async sendMessage(chatId, text, options = {}) {
    return this.#call("sendMessage", {
      chat_id: chatId,
      text,
      ...options
    });
  }

  async sendAnimation(chatId, animation, options = {}) {
    return this.#call("sendAnimation", {
      chat_id: chatId,
      animation,
      ...options
    });
  }

  async sendPhoto(chatId, photo, options = {}) {
    // If 'photo' is a local file path, send it as a file upload.
    if (typeof photo === 'string' && (photo.startsWith('./') || path.isAbsolute(photo))) {
      if (!fs.existsSync(photo)) {
        throw new Error(`File not found: ${photo}`);
      }
      const formData = new FormData();
      formData.append('chat_id', String(chatId));
      formData.append('photo', new Blob([fs.readFileSync(photo)]), path.basename(photo));

      for (const [key, value] of Object.entries(options)) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
      return this.#call('sendPhoto', formData);
    }

    // Otherwise, treat it as a URL or file_id.
    return this.#call("sendPhoto", { chat_id: chatId, photo, ...options });
  }

  async deleteMessage(chatId, messageId) {
    return this.#call("deleteMessage", {
      chat_id: chatId,
      message_id: messageId
    });
  }

  async forwardMessage(chatId, fromChatId, messageId) {
    return this.#call("forwardMessage", {
      chat_id: chatId,
      from_chat_id: fromChatId,
      message_id: messageId
    });
  }

  async setWebHook(url) {
    return this.#call("setWebhook", { url });
  }

  async deleteWebhook() {
    return this.#call("deleteWebhook", {});
  }

  async getUpdates(offset = 0, timeout = 10) {
    return this.#call("getUpdates", { offset, timeout });
  }

  async startPolling({ intervalMs = 3000, timeout = 10 } = {}) {
    this.polling = true;
    let offset = 0;

    const loop = async () => {
      if (!this.polling) {
        return;
      }

      try {
        const updates = await this.getUpdates(offset, timeout);
        for (const update of updates) {
          offset = update.update_id + 1;
          await this.processUpdate(update);
        }
      } catch (error) {
        console.error(`[Polling Error] ${error.message}`);
      }

      setTimeout(() => {
        loop().catch(() => undefined);
      }, intervalMs);
    };

    await loop();
  }

  stopPolling() {
    this.polling = false;
  }

  async #emit(event, payload) {
    const handlers = this.handlers[event] || [];
    for (const handler of handlers) {
      await handler(payload);
    }
  }

  async #call(method, payload) {
    const isFormData = payload instanceof FormData;

    const headers = {};
    if (!isFormData) {
      headers['content-type'] = 'application/json';
    }

    const response = await fetch(`${this.apiBase}/${method}`, {
      method: "POST",
      headers,
      body: isFormData ? payload : JSON.stringify(payload)
    });

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || `${method} failed`);
    }

    return data.result;
  }
}

module.exports = TelegramBot;
