<script setup>
import { ref } from 'vue';
import AppIcon from '../components/ui/AppIcon.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import { exportData, importData, resetAll, state, updateSettings } from '../stores/shoppingStore';
import { findLatestChat, sendTelegramMessage, telegram } from '../stores/telegram';
import { CURRENCIES } from '../utils/money';

const rate = ref(state.settings.khrPerUsd);
const rateError = ref('');
const message = ref('');
const confirmReset = ref(false);
const fileInput = ref(null);

function flash(text) {
    message.value = text;
    setTimeout(() => {
        if (message.value === text) {
            message.value = '';
        }
    }, 3000);
}

function saveRate() {
    if (!(Number(rate.value) > 0)) {
        rateError.value = 'Enter a rate above 0.';

        return;
    }

    rateError.value = '';
    updateSettings({ khrPerUsd: Number(rate.value) });
    flash('Exchange rate saved.');
}

const tgForm = ref({ botToken: telegram.botToken, chatId: telegram.chatId });
const tgError = ref('');
const tgBusy = ref(false);

async function telegramAction(action) {
    tgError.value = '';
    tgBusy.value = true;

    try {
        await action();
    } catch (error) {
        tgError.value = error.message;
    } finally {
        tgBusy.value = false;
    }
}

function findChat() {
    return telegramAction(async () => {
        if (!tgForm.value.botToken.trim()) {
            throw new Error('Paste your bot token first.');
        }

        const chat = await findLatestChat(tgForm.value.botToken.trim());
        tgForm.value.chatId = chat.id;
        flash(`Found chat: ${chat.name || chat.id}. Press Save to keep it.`);
    });
}

function saveTelegram() {
    return telegramAction(async () => {
        const botToken = tgForm.value.botToken.trim();
        const chatId = String(tgForm.value.chatId).trim();

        if (!botToken || !chatId) {
            throw new Error('Enter both the bot token and the chat ID.');
        }

        await sendTelegramMessage('✅ Shopping List is connected. Your reports will arrive here.', { botToken, chatId });
        Object.assign(telegram, { botToken, chatId });
        flash('Telegram connected. A test message was sent.');
    });
}

function disconnectTelegram() {
    Object.assign(telegram, { botToken: '', chatId: '' });
    tgForm.value = { botToken: '', chatId: '' };
    tgError.value = '';
    flash('Telegram disconnected.');
}

function download() {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `shopping-lists-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
}

async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
        return;
    }

    try {
        importData(await file.text());
        rate.value = state.settings.khrPerUsd;
        flash(`Imported ${state.lists.length} lists.`);
    } catch (error) {
        flash(error instanceof SyntaxError ? 'That file is not valid JSON.' : error.message);
    }
}

function reset() {
    resetAll();
    rate.value = state.settings.khrPerUsd;
    confirmReset.value = false;
    flash('All data cleared.');
}
</script>

<template>
    <div class="mx-auto max-w-2xl space-y-6">
        <h1 class="text-2xl font-bold text-ink sm:text-3xl">Settings</h1>

        <p v-if="message" class="rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent" role="status">{{ message }}</p>

        <section class="card space-y-4 p-5">
            <h2 class="font-semibold text-ink">Currency</h2>
            <div>
                <span class="label">Show totals in</span>
                <div class="flex gap-2">
                    <button
                        v-for="currency in CURRENCIES"
                        :key="currency"
                        type="button"
                        class="btn"
                        :class="state.settings.displayCurrency === currency ? 'btn-primary' : 'btn-secondary'"
                        @click="updateSettings({ displayCurrency: currency })"
                    >
                        {{ currency }}
                    </button>
                </div>
            </div>
            <form novalidate @submit.prevent="saveRate">
                <label class="label" for="rate">Exchange rate</label>
                <div class="flex flex-wrap items-center gap-2">
                    <span class="text-sm">1 USD =</span>
                    <input id="rate" v-model.number="rate" type="number" min="1" step="any" inputmode="decimal" class="input w-36" />
                    <span class="text-sm">KHR</span>
                    <button type="submit" class="btn btn-secondary">Save</button>
                </div>
                <p v-if="rateError" class="field-error">{{ rateError }}</p>
                <p v-else class="mt-1 text-xs text-ink-muted">Used to add up prices entered in different currencies.</p>
            </form>
        </section>

        <section class="card space-y-4 p-5">
            <div class="flex items-center justify-between gap-3">
                <h2 class="font-semibold text-ink">Telegram</h2>
                <span
                    class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="telegram.botToken && telegram.chatId ? 'bg-accent-soft text-accent' : 'bg-surface-muted text-ink-muted'"
                >
                    {{ telegram.botToken && telegram.chatId ? 'Connected' : 'Not connected' }}
                </span>
            </div>

            <ol class="list-decimal space-y-1 pl-5 text-sm text-ink-muted">
                <li>In Telegram, open <a href="https://t.me/BotFather" target="_blank" rel="noopener" class="font-medium text-accent underline">@BotFather</a>, send <code>/newbot</code> and follow the steps. Copy the token it gives you.</li>
                <li>Open your new bot and press <strong>Start</strong> (or send it any message).</li>
                <li>Paste the token below, press <strong>Find my chat</strong>, then <strong>Save</strong>.</li>
            </ol>

            <form novalidate class="space-y-3" @submit.prevent="saveTelegram">
                <div>
                    <label class="label" for="tg-token">Bot token</label>
                    <input id="tg-token" v-model="tgForm.botToken" type="password" autocomplete="off" class="input font-mono" placeholder="123456789:AA…" />
                </div>
                <div>
                    <label class="label" for="tg-chat">Chat ID</label>
                    <div class="flex gap-2">
                        <input id="tg-chat" v-model="tgForm.chatId" inputmode="numeric" autocomplete="off" class="input font-mono" placeholder="e.g. 123456789" />
                        <button type="button" class="btn btn-secondary shrink-0" :disabled="tgBusy" @click="findChat">Find my chat</button>
                    </div>
                </div>
                <p v-if="tgError" class="field-error">{{ tgError }}</p>
                <div class="flex flex-wrap gap-2">
                    <button type="submit" class="btn btn-primary" :disabled="tgBusy">
                        <AppIcon name="send" :size="16" /> {{ tgBusy ? 'Checking…' : 'Save & send test' }}
                    </button>
                    <button v-if="telegram.botToken" type="button" class="btn btn-ghost hover:text-rose-600" @click="disconnectTelegram">Disconnect</button>
                </div>
            </form>
            <p class="text-xs text-ink-muted">The token is saved in this browser only and is never included in backups.</p>
        </section>

        <section class="card space-y-3 p-5">
            <h2 class="font-semibold text-ink">Backup</h2>
            <p class="text-sm text-ink-muted">Your lists are saved in this browser only. Export a backup to keep them safe or move them to another device.</p>
            <div class="flex flex-wrap gap-2">
                <button type="button" class="btn btn-secondary" @click="download"><AppIcon name="download" :size="16" /> Export JSON</button>
                <button type="button" class="btn btn-secondary" @click="fileInput.click()"><AppIcon name="upload" :size="16" /> Import JSON</button>
                <input ref="fileInput" type="file" accept="application/json,.json" class="hidden" @change="upload" />
            </div>
            <p class="text-xs text-ink-muted">Importing replaces the lists in this browser.</p>
        </section>

        <section class="card space-y-3 border-rose-200 p-5 dark:border-rose-950">
            <h2 class="font-semibold text-ink">Reset</h2>
            <p class="text-sm text-ink-muted">Delete every list and restore the default settings.</p>
            <button type="button" class="btn btn-danger" @click="confirmReset = true"><AppIcon name="trash" :size="16" /> Delete all data</button>
        </section>

        <ConfirmDialog
            :open="confirmReset"
            title="Delete all data?"
            message="Every shopping list in this browser will be deleted. Export a backup first if you might need them."
            confirm-label="Delete everything"
            @confirm="reset"
            @close="confirmReset = false"
        />
    </div>
</template>
