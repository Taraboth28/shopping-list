<script setup>
import { computed } from 'vue';
import { state } from '../../stores/shoppingStore';
import { formatMoney, fromUsd, otherCurrency } from '../../utils/money';

/** A USD amount shown in the display currency, with the other currency underneath. */
const props = defineProps({
    usd: { type: Number, required: true },
    secondary: { type: Boolean, default: true },
});

const primaryCurrency = computed(() => state.settings.displayCurrency);
const secondaryCurrency = computed(() => otherCurrency(primaryCurrency.value));

const primary = computed(() => formatMoney(fromUsd(props.usd, primaryCurrency.value, state.settings.khrPerUsd), primaryCurrency.value));
const other = computed(() => formatMoney(fromUsd(props.usd, secondaryCurrency.value, state.settings.khrPerUsd), secondaryCurrency.value));
</script>

<template>
    <span class="inline-flex flex-col leading-tight">
        <span class="tabular-nums">{{ primary }}</span>
        <span v-if="secondary" class="text-xs font-normal text-ink-muted tabular-nums">≈ {{ other }}</span>
    </span>
</template>
