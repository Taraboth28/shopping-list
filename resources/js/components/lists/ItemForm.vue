<script setup>
import { computed, reactive, ref, useId } from 'vue';
import { state } from '../../stores/shoppingStore';
import { CURRENCIES, formatMoney } from '../../utils/money';
import AppIcon from '../ui/AppIcon.vue';

/**
 * Item fields with a live line-total preview. Used inline to add items and in a modal to edit one.
 * After adding, the form clears but keeps the chosen currency for the next item.
 */
const props = defineProps({
    item: { type: Object, default: null },
    submitLabel: { type: String, default: 'Add item' },
});

const emit = defineEmits(['submit', 'cancel']);

const UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'pack', 'box', 'bottle', 'dozen'];

function blank() {
    return { name: '', qty: 1, unit: 'pcs', unitPrice: null, currency: state.settings.displayCurrency, note: '' };
}

const form = reactive(props.item ? { ...props.item } : blank());
const errors = reactive({});
const nameInput = ref(null);
const fid = useId();

const lineTotal = computed(() => (Number(form.qty) || 0) * (Number(form.unitPrice) || 0));

function validate() {
    errors.name = form.name.trim() ? '' : 'Enter an item name.';
    errors.qty = Number(form.qty) > 0 ? '' : 'Quantity must be more than 0.';
    errors.unitPrice = form.unitPrice === null || form.unitPrice === '' || Number(form.unitPrice) < 0 ? 'Enter a price (0 or more).' : '';

    return !errors.name && !errors.qty && !errors.unitPrice;
}

function submit() {
    if (!validate()) {
        return;
    }

    emit('submit', { ...form, qty: Number(form.qty), unitPrice: Number(form.unitPrice) });

    if (!props.item) {
        Object.assign(form, blank(), { currency: form.currency });
        nameInput.value?.focus();
    }
}
</script>

<template>
    <form novalidate @submit.prevent="submit">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-12">
            <div class="col-span-2 sm:col-span-4">
                <label class="label" :for="fid + '-name'">Item</label>
                <input :id="fid + '-name'" ref="nameInput" v-model="form.name" class="input" placeholder="e.g. Rice, Eggs, Milk" autocomplete="off" />
                <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
            </div>

            <div class="sm:col-span-2">
                <label class="label" :for="fid + '-qty'">Qty</label>
                <input :id="fid + '-qty'" v-model.number="form.qty" type="number" min="0" step="any" inputmode="decimal" class="input" />
                <p v-if="errors.qty" class="field-error">{{ errors.qty }}</p>
            </div>

            <div class="sm:col-span-2">
                <label class="label" :for="fid + '-unit'">Unit</label>
                <input :id="fid + '-unit'" v-model="form.unit" class="input" :list="fid + '-units'" placeholder="pcs" />
                <datalist :id="fid + '-units'">
                    <option v-for="unit in UNITS" :key="unit" :value="unit" />
                </datalist>
            </div>

            <div class="col-span-2 sm:col-span-4">
                <label class="label" :for="fid + '-price'">Unit price</label>
                <div class="flex">
                    <input
                        :id="fid + '-price'"
                        v-model.number="form.unitPrice"
                        type="number"
                        min="0"
                        step="any"
                        inputmode="decimal"
                        class="input rounded-r-none"
                        placeholder="0.00"
                    />
                    <select v-model="form.currency" class="input w-24 shrink-0 rounded-l-none border-l-0" aria-label="Price currency">
                        <option v-for="currency in CURRENCIES" :key="currency" :value="currency">{{ currency }}</option>
                    </select>
                </div>
                <p v-if="errors.unitPrice" class="field-error">{{ errors.unitPrice }}</p>
            </div>

            <div v-if="item" class="col-span-2 sm:col-span-12">
                <label class="label" :for="fid + '-note'">Note <span class="font-normal text-ink-muted">(optional)</span></label>
                <input :id="fid + '-note'" v-model="form.note" class="input" placeholder="Brand, size, store…" />
            </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm">
                Line total:
                <span class="font-semibold text-ink tabular-nums">{{ formatMoney(lineTotal, form.currency, { roundKhr: false }) }}</span>
            </p>
            <div class="flex gap-2">
                <button v-if="item" type="button" class="btn btn-secondary" @click="emit('cancel')">Cancel</button>
                <button type="submit" class="btn btn-primary">
                    <AppIcon :name="item ? 'check' : 'plus'" :size="16" />
                    {{ submitLabel }}
                </button>
            </div>
        </div>
    </form>
</template>
