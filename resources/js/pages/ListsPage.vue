<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ListFormModal from '../components/lists/ListFormModal.vue';
import AppIcon from '../components/ui/AppIcon.vue';
import BudgetBar from '../components/ui/BudgetBar.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import MoneyText from '../components/ui/MoneyText.vue';
import { createList, state } from '../stores/shoppingStore';
import { listTotals } from '../utils/totals';

const router = useRouter();
const showCreate = ref(false);

const cards = computed(() => state.lists.map((list) => ({ list, totals: listTotals(list, state.settings.khrPerUsd) })));

const grandRemaining = computed(() => cards.value.reduce((sum, card) => sum + card.totals.remaining, 0));

function create(fields) {
    const list = createList(fields);
    showCreate.value = false;
    router.push({ name: 'list', params: { id: list.id } });
}
</script>

<template>
    <div class="space-y-6">
        <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 class="text-2xl font-bold text-ink sm:text-3xl">My shopping lists</h1>
                <p v-if="cards.length" class="mt-1 text-sm text-ink-muted">
                    {{ cards.length }} {{ cards.length === 1 ? 'list' : 'lists' }} · still to pay across all:
                    <MoneyText :usd="grandRemaining" :secondary="false" class="font-semibold text-ink" />
                </p>
            </div>
            <button v-if="cards.length" type="button" class="btn btn-primary" @click="showCreate = true">
                <AppIcon name="plus" :size="16" /> New list
            </button>
        </div>

        <EmptyState v-if="!cards.length" title="No shopping lists yet" message="Create a list, add items with their prices, and see how much you'll need to pay.">
            <button type="button" class="btn btn-primary" @click="showCreate = true">
                <AppIcon name="plus" :size="16" /> Create your first list
            </button>
        </EmptyState>

        <ul v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <li v-for="{ list, totals } in cards" :key="list.id">
                <RouterLink
                    :to="{ name: 'list', params: { id: list.id } }"
                    class="card flex h-full flex-col p-5 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-emerald-500"
                >
                    <div class="flex items-start justify-between gap-3">
                        <h2 class="truncate text-base font-semibold text-ink">{{ list.name }}</h2>
                        <span
                            v-if="totals.status === 'over'"
                            class="shrink-0 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        >
                            Over budget
                        </span>
                    </div>
                    <p class="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                        <AppIcon name="listChecks" :size="14" />
                        {{ totals.itemCount }} {{ totals.itemCount === 1 ? 'item' : 'items' }}
                        <template v-if="totals.itemCount">· {{ totals.boughtCount }} bought</template>
                    </p>

                    <div class="mt-4 flex-1">
                        <p class="text-xs text-ink-muted">Estimated total</p>
                        <MoneyText :usd="totals.total" class="text-xl font-bold text-ink" />
                    </div>

                    <div v-if="totals.status !== 'none'" class="mt-4">
                        <div class="mb-1 flex justify-between text-xs text-ink-muted">
                            <span>Budget</span>
                            <span>{{ Math.round(totals.ratio * 100) }}% of <MoneyText :usd="totals.budget" :secondary="false" /></span>
                        </div>
                        <BudgetBar :ratio="totals.ratio" :status="totals.status" />
                    </div>
                </RouterLink>
            </li>
        </ul>

        <ListFormModal :open="showCreate" @submit="create" @close="showCreate = false" />
    </div>
</template>
