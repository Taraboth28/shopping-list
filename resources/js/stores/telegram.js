import { reactive, watch } from 'vue';

/**
 * Telegram bot details, kept apart from the lists so they never end up in an
 * exported backup. The bot token stays in this browser's localStorage only.
 */
const STORAGE_KEY = 'shopping-list:telegram';

function load() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

        return { botToken: String(raw.botToken ?? ''), chatId: String(raw.chatId ?? '') };
    } catch {
        return { botToken: '', chatId: '' };
    }
}

export const telegram = reactive(load());

watch(telegram, () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(telegram));
    } catch {
        // Storage unavailable: the details last for this visit only.
    }
});

export function isTelegramReady() {
    return Boolean(telegram.botToken && telegram.chatId);
}

/** Calls a Bot API method. Form-encoded POST keeps it a "simple" CORS request (no preflight). */
async function callBot(token, method, params = {}) {
    let response;

    try {
        // Tokens look like 123456:ABC-xyz_; the colon must stay unencoded in the path.
        response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
            method: 'POST',
            body: new URLSearchParams(params),
        });
    } catch {
        throw new Error("Couldn't reach Telegram. Check your internet connection.");
    }

    const data = await response.json().catch(() => null);

    if (!data?.ok) {
        if (response.status === 401 || response.status === 404) {
            throw new Error('Telegram rejected the bot token. Copy it again from @BotFather.');
        }

        if (/chat not found/i.test(data?.description ?? '')) {
            throw new Error('Chat not found. Open your bot in Telegram and press Start, then try again.');
        }

        throw new Error(data?.description ? `Telegram: ${data.description}` : 'Telegram returned an error.');
    }

    return data.result;
}

export function sendTelegramMessage(text, { botToken, chatId } = telegram) {
    return callBot(botToken, 'sendMessage', { chat_id: chatId, text });
}

/** The most recent chat that messaged the bot, so the user doesn't have to look up their ID. */
export async function findLatestChat(botToken) {
    const updates = await callBot(botToken, 'getUpdates');
    const chat = [...updates].reverse().map((update) => (update.message ?? update.my_chat_member ?? update.channel_post)?.chat).find(Boolean);

    if (!chat) {
        throw new Error('No messages found. Open your bot in Telegram, press Start (or send it any message), then try again.');
    }

    return { id: String(chat.id), name: chat.title || [chat.first_name, chat.last_name].filter(Boolean).join(' ') || chat.username };
}
