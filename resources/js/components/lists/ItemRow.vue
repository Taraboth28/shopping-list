<script setup>
import { computed } from 'vue';
import { state } from '../../stores/shoppingStore';
import { formatMoney } from '../../utils/money';
import { itemTotalUsd } from '../../utils/totals';
import AppIcon from '../ui/AppIcon.vue';
import MoneyText from '../ui/MoneyText.vue';

const props = defineProps({
    item: { type: Object, required: true },
});

const emit = defineEmits(['toggle', 'edit', 'delete']);

const qtyText = computed(() => `${+props.item.qty.toFixed(3)}${props.item.unit ? ` ${props.item.unit}` : ''}`);
const totalUsd = computed(() => itemTotalUsd(props.item, state.settings.khrPerUsd));
</script>

<template>
    <li class="flex items-center gap-3 px-4 py-3 sm:px-5" :class="item.bought && 'bg-surface-muted/60'">
        <button
            type="button"
            class="grid size-6 shrink-0 place-items-center rounded-md border-2 transition"
            :class="item.bought ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-line-strong hover:border-emerald-500'"
            role="checkbox"
            :aria-checked="item.bought"
            :aria-label="`Mark ${item.name} as ${item.bought ? 'not bought' : 'bought'}`"
            @click="emit('toggle')"
        >
            <AppIcon v-if="item.bought" name="check" :size="14" />
        </button>

        <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-ink" :class="item.bought && 'text-ink-muted line-through'">{{ item.name }}</p>
            <p class="truncate text-xs text-ink-muted tabular-nums">
                {{ qtyText }} × {{ formatMoney(item.unitPrice, item.currency, { roundKhr: false }) }}
                <span v-if="item.note"> · {{ item.note }}</span>
            </p>
        </div>

        <MoneyText :usd="totalUsd" class="shrink-0 text-right text-sm font-semibold text-ink" :class="item.bought && 'opacity-60'" />

        <div class="flex shrink-0">
            <button type="button" class="btn btn-ghost" :aria-label="`Edit ${item.name}`" @click="emit('edit')">
                <AppIcon name="pencil" :size="16" />
            </button>
            <button type="button" class="btn btn-ghost hover:text-rose-600" :aria-label="`Delete ${item.name}`" @click="emit('delete')">
                <AppIcon name="trash" :size="16" />
            </button>
        </div>
    </li>
</template>
