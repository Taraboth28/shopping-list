<script setup>
import { reactive, watch } from 'vue';
import { state } from '../../stores/shoppingStore';
import { CURRENCIES } from '../../utils/money';
import BaseModal from '../ui/BaseModal.vue';

/** Create or edit a list's name and optional budget. */
const props = defineProps({
    open: { type: Boolean, default: false },
    list: { type: Object, default: null },
});

const emit = defineEmits(['submit', 'close']);

const form = reactive({ name: '', budget: null, budgetCurrency: 'USD' });
const errors = reactive({ name: '', budget: '' });

watch(
    () => props.open,
    (open) => {
        if (open) {
            Object.assign(form, {
                name: props.list?.name ?? '',
                budget: props.list?.budget || null,
                budgetCurrency: props.list?.budgetCurrency ?? state.settings.displayCurrency,
            });
            Object.assign(errors, { name: '', budget: '' });
        }
    },
);

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
    <BaseModal :open="open" :title="list ? 'Edit list' : 'New shopping list'" @close="emit('close')">
        <form novalidate class="space-y-4" @submit.prevent="submit">
            <div>
                <label class="label" for="list-name">List name</label>
                <input id="list-name" v-model="form.name" class="input" placeholder="e.g. Weekly groceries" autofocus />
                <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
            </div>

            <div>
                <label class="label" for="list-budget">Budget <span class="font-normal text-ink-muted">(optional)</span></label>
                <div class="flex">
                    <input
                        id="list-budget"
                        v-model.number="form.budget"
                        type="number"
                        min="0"
                        step="any"
                        inputmode="decimal"
                        class="input rounded-r-none"
                        placeholder="No limit"
                    />
                    <select v-model="form.budgetCurrency" class="input w-24 shrink-0 rounded-l-none border-l-0" aria-label="Budget currency">
                        <option v-for="currency in CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
                    </select>
                </div>
                <p v-if="errors.budget" class="field-error">{{ errors.budget }}</p>
                <p v-else class="mt-1 text-xs text-ink-muted">You'll get a warning when the estimate reaches 80% of the budget.</p>
            </div>

            <div class="flex justify-end gap-2 pt-2">
                <button type="button" class="btn btn-secondary" @click="emit('close')">Cancel</button>
                <button type="submit" class="btn btn-primary">{{ list ? 'Save' : 'Create list' }}</button>
            </div>
        </form>
    </BaseModal>
</template>
