<script setup>
import { ref } from 'vue';
import AppIcon from '../components/ui/AppIcon.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import { exportData, importData, resetAll, state, updateSettings } from '../stores/shoppingStore';
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
