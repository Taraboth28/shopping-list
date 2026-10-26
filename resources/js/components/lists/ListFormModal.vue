<script setup>
import { nextTick, reactive, ref, watch } from 'vue';
import { state } from '../../stores/shoppingStore';
import { CURRENCIES } from '../../utils/money';
import AppIcon from '../ui/AppIcon.vue';
import BaseModal from '../ui/BaseModal.vue';

/** Create or edit a list's name and optional budget. */
const props = defineProps({
    open: { type: Boolean, default: false },
    list: { type: Object, default: null },
});

const emit = defineEmits(['submit', 'close']);

/** One-tap names offered when creating a list. */
const NAME_SUGGESTIONS = ['🛒 Groceries', '🥬 Market', '🏠 Household', '🎉 Party', '💊 Pharmacy'];

const form = reactive({ name: '', budget: null, budgetCurrency: 'USD' });
const errors = reactive({ name: '', budget: '' });
const nameInput = ref(null);

watch(
    () => props.open,
    async (open) => {
        if (open) {
            Object.assign(form, {
                name: props.list?.name ?? '',
                budget: props.list?.budget || null,
                budgetCurrency: props.list?.budgetCurrency ?? state.settings.displayCurrency,
            });
            Object.assign(errors, { name: '', budget: '' });

            // `autofocus` doesn't fire on elements inserted after page load.
            await nextTick();
            nameInput.value?.focus();
        }
    },
);

function pickName(name) {
    form.name = name;
    errors.name = '';
    nameInput.value?.focus();
}

function submit() {
    errors.name = form.name.trim() ? '' : 'Give the list a name.';
    errors.budget = form.budget !== null && form.budget !== '' && Number(form.budget) < 0 ? 'Budget cannot be negative.' : '';

    if (errors.name || errors.budget) {
        return;
    }

    emit('submit', { name: form.name.trim(), budget: Number(form.budget) || 0, budgetCurrency: form.budgetCurrency });
}
</script>

<template>
    <BaseModal
        :open="open"
        :title="list ? 'Edit list' : 'New shopping list'"
        :description="list ? 'Rename it or change the budget.' : 'Name it, set a budget if you like, then start adding items.'"
        :icon="list ? 'pencil' : 'shoppingCart'"
        @close="emit('close')"
    >
        <form novalidate class="space-y-5" @submit.prevent="submit">
            <div>
                <label class="label" for="list-name">List name</label>
                <input
                    id="list-name"
                    ref="nameInput"
                    v-model="form.name"
                    class="input py-2.5 text-base"
                    :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30': errors.name }"
                    placeholder="e.g. Groceries"
                    maxlength="80"
                    @input="errors.name = ''"
                />
                <p v-if="errors.name" class="field-error">{{ errors.name }}</p>

                <div v-if="!list" class="mt-3 flex flex-wrap gap-2">
                    <button
                        v-for="suggestion in NAME_SUGGESTIONS"
                        :key="suggestion"
                        type="button"
                        class="rounded-full border px-3 py-1 text-xs font-medium transition"
                        :class="
                            form.name === suggestion
                                ? 'border-emerald-500 bg-accent-soft text-accent'
                                : 'border-line-strong text-ink-soft hover:border-emerald-400 hover:bg-surface-muted'
                        "
                        @click="pickName(suggestion)"
                    >
                        {{ suggestion }}
                    </button>
                </div>
            </div>

            <div class="rounded-xl border border-line bg-surface-muted/60 p-4">
                <div class="mb-2 flex items-center justify-between gap-3">
                    <label class="label mb-0" for="list-budget">Budget <span class="font-normal text-ink-muted">(optional)</span></label>
                    <div class="flex rounded-full border border-line-strong bg-surface p-0.5" role="radiogroup" aria-label="Budget currency">
                        <button
                            v-for="currency in CURRENCIES"
                            :key="currency"
                            type="button"
                            role="radio"
                            :aria-checked="form.budgetCurrency === currency"
                            class="rounded-full px-3 py-0.5 text-xs font-semibold transition"
                            :class="form.budgetCurrency === currency ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink'"
                            @click="form.budgetCurrency = currency"
                        >
                            {{ currency }}
                        </button>
                    </div>
                </div>
                <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-ink-muted">
                        {{ form.budgetCurrency === 'KHR' ? '៛' : '$' }}
                    </span>
                    <input
                        id="list-budget"
                        v-model.number="form.budget"
                        type="number"
                        min="0"
                        step="any"
                        inputmode="decimal"
                        class="input py-2.5 pl-8 text-base"
                        :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30': errors.budget }"
                        placeholder="No limit"
                    />
                </div>
                <p v-if="errors.budget" class="field-error">{{ errors.budget }}</p>
                <p v-else class="mt-2 text-xs text-ink-muted">You'll get a warning when the estimate reaches 80% of the budget.</p>
            </div>

            <div class="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
                <button type="button" class="btn btn-secondary" @click="emit('close')">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <AppIcon :name="list ? 'check' : 'plus'" :size="16" />
                    {{ list ? 'Save' : 'Create list' }}
                </button>
            </div>
        </form>
    </BaseModal>
</template>
