<script setup>
import { computed, ref, watch } from 'vue';
import { state } from '../../stores/shoppingStore';
import { isTelegramReady, sendTelegramMessage } from '../../stores/telegram';
import { buildListReport } from '../../utils/report';
import AppIcon from '../ui/AppIcon.vue';
import BaseModal from '../ui/BaseModal.vue';

/** Previews a list's report and sends it to the user's Telegram through their bot. */
const props = defineProps({
    open: { type: Boolean, default: false },
    list: { type: Object, required: true },
});

const emit = defineEmits(['close']);

/** Telegram rejects messages longer than this. */
const TELEGRAM_MAX_LENGTH = 4096;

const report = computed(() => buildListReport(props.list, state.settings));
const tooLong = computed(() => report.value.length > TELEGRAM_MAX_LENGTH);

/** 'idle' | 'sending' | 'sent' | 'error' */
const status = ref('idle');
const error = ref('');
const copied = ref(false);

watch(
    () => props.open,
    () => {
        status.value = 'idle';
        error.value = '';
        copied.value = false;
    },
);

async function send() {
    status.value = 'sending';
    error.value = '';

    try {
        await sendTelegramMessage(report.value);
        status.value = 'sent';
    } catch (err) {
        status.value = 'error';
        error.value = err.message;
    }
}

async function copy() {
    try {
        await navigator.clipboard.writeText(report.value);
        copied.value = true;
    } catch {
        copied.value = false;
    }
}
</script>

<template>
    <BaseModal :open="open" title="Send to Telegram" description="This report will be sent to your Telegram." icon="send" @close="emit('close')">
        <pre class="max-h-72 overflow-y-auto rounded-xl border border-line bg-surface-muted/60 p-4 font-sans text-sm whitespace-pre-wrap text-ink">{{ report }}</pre>

        <p v-if="tooLong" class="field-error mt-2">This report is longer than Telegram allows in one message ({{ TELEGRAM_MAX_LENGTH }} characters).</p>

        <div v-if="!isTelegramReady()" class="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Connect your Telegram bot first.
            <RouterLink to="/settings" class="font-semibold underline" @click="emit('close')">Go to Settings</RouterLink>
        </div>
        <p v-else-if="status === 'sent'" class="mt-4 flex items-center gap-2 rounded-xl bg-accent-soft px-4 py-3 text-sm font-medium text-accent" role="status">
            <AppIcon name="circleCheck" :size="16" /> Sent to your Telegram.
        </p>
        <p v-else-if="status === 'error'" class="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300" role="alert">{{ error }}</p>

        <div class="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="btn btn-secondary" @click="copy">
                <AppIcon :name="copied ? 'check' : 'copy'" :size="16" />
                {{ copied ? 'Copied' : 'Copy text' }}
            </button>
            <button v-if="status === 'sent'" type="button" class="btn btn-primary" @click="emit('close')">Done</button>
            <button
                v-else
                type="button"
                class="btn bg-sky-500 text-white hover:bg-sky-600 focus-visible:outline-sky-500"
                :disabled="!isTelegramReady() || tooLong || status === 'sending'"
                @click="send"
            >
                <AppIcon name="send" :size="16" />
                {{ status === 'sending' ? 'Sending…' : status === 'error' ? 'Try again' : 'Send to my Telegram' }}
            </button>
        </div>
    </BaseModal>
</template>
