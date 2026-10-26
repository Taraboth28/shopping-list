<script setup>
import AppIcon from '../ui/AppIcon.vue';
import BudgetBar from '../ui/BudgetBar.vue';
import MoneyText from '../ui/MoneyText.vue';

/** Totals for one list: estimate, bought, remaining to pay and budget state. */
defineProps({
    totals: { type: Object, required: true },
});

const emit = defineEmits(['edit-budget']);
</script>

<template>
    <section class="space-y-3" aria-label="Totals">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div class="card col-span-2 p-4 lg:col-span-1">
                <p class="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
                    <AppIcon name="receipt" :size="14" /> Estimated total
                </p>
                <MoneyText :usd="totals.total" class="mt-1 text-2xl font-bold text-ink" />
            </div>
            <div class="card p-4">
                <p class="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
                    <AppIcon name="circleCheck" :size="14" /> Bought
                </p>
                <MoneyText :usd="totals.bought" class="mt-1 text-lg font-semibold text-ink" />
                <p class="text-xs text-ink-muted">{{ totals.boughtCount }} of {{ totals.itemCount }} items</p>
            </div>
            <div class="card p-4">
                <p class="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
                    <AppIcon name="hourglass" :size="14" /> Still to pay
                </p>
                <MoneyText :usd="totals.remaining" class="mt-1 text-lg font-semibold text-ink" />
            </div>
            <div class="card col-span-2 p-4 lg:col-span-1">
                <div class="flex items-center justify-between">
                    <p class="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-muted uppercase">
                        <AppIcon name="wallet" :size="14" /> Budget
                    </p>
                    <button type="button" class="text-xs font-medium text-accent hover:underline" @click="emit('edit-budget')">
                        {{ totals.status === 'none' ? 'Set' : 'Edit' }}
                    </button>
                </div>
                <template v-if="totals.status !== 'none'">
                    <MoneyText :usd="totals.budget" :secondary="false" class="mt-1 text-lg font-semibold text-ink" />
                    <BudgetBar :ratio="totals.ratio" :status="totals.status" class="mt-2" />
                    <p class="mt-1 text-xs text-ink-muted">{{ Math.round(totals.ratio * 100) }}% used</p>
                </template>
                <p v-else class="mt-2 text-sm text-ink-muted">No budget set</p>
            </div>
        </div>

        <div
            v-if="totals.status === 'over'"
            class="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200"
            role="alert"
        >
            <AppIcon name="alertTriangle" :size="18" class="mt-0.5 shrink-0" />
            <p>
                Over budget by <strong><MoneyText :usd="totals.overBy" :secondary="false" /></strong>. Remove or reduce some items to stay
                within your limit.
            </p>
        </div>
        <div
            v-else-if="totals.status === 'warn'"
            class="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
            role="status"
        >
            <AppIcon name="alertTriangle" :size="18" class="mt-0.5 shrink-0" />
            <p>Close to your budget, with <strong><MoneyText :usd="totals.leftInBudget" :secondary="false" /></strong> left.</p>
        </div>
    </section>
</template>
