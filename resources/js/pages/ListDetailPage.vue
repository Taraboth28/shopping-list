<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import ItemForm from '../components/lists/ItemForm.vue';
import ItemRow from '../components/lists/ItemRow.vue';
import ListFormModal from '../components/lists/ListFormModal.vue';
import ListSummary from '../components/lists/ListSummary.vue';
import ShareReportModal from '../components/lists/ShareReportModal.vue';
import AppIcon from '../components/ui/AppIcon.vue';
import BaseModal from '../components/ui/BaseModal.vue';
import ConfirmDialog from '../components/ui/ConfirmDialog.vue';
import EmptyState from '../components/ui/EmptyState.vue';
import {
    addItem,
    deleteItem,
    deleteList,
    duplicateList,
    findList,
    resetBought,
    state,
    toggleBought,
    updateItem,
    updateList,
} from '../stores/shoppingStore';
import { listTotals } from '../utils/totals';

const props = defineProps({
    id: { type: String, required: true },
});

const router = useRouter();

const list = computed(() => findList(props.id));
const totals = computed(() => (list.value ? listTotals(list.value, state.settings.khrPerUsd) : null));

const showEditList = ref(false);
const editingItem = ref(null);
const itemToDelete = ref(null);
const confirmDeleteList = ref(false);
const showShare = ref(false);

function saveList(fields) {
    updateList(props.id, fields);
    showEditList.value = false;
}

function saveItem(fields) {
    updateItem(props.id, editingItem.value.id, fields);
    editingItem.value = null;
}

function removeItem() {
    deleteItem(props.id, itemToDelete.value.id);
    itemToDelete.value = null;
}

function removeList() {
    deleteList(props.id);
    router.push({ name: 'lists' });
}

function duplicate() {
    const copy = duplicateList(props.id);

    if (copy) {
        router.push({ name: 'list', params: { id: copy.id } });
    }
}
</script>

<template>
    <EmptyState v-if="!list" icon="alertTriangle" title="List not found" message="It may have been deleted, or it was saved in another browser.">
        <RouterLink to="/" class="btn btn-primary">Back to my lists</RouterLink>
    </EmptyState>

    <div v-else class="space-y-6">
        <div>
            <RouterLink to="/" class="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
                <AppIcon name="arrowLeft" :size="16" /> All lists
            </RouterLink>
            <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
                <h1 class="min-w-0 truncate text-2xl font-bold text-ink sm:text-3xl">{{ list.name }}</h1>
                <div class="flex flex-wrap gap-1">
                    <button type="button" class="btn btn-ghost hover:text-sky-600" @click="showShare = true">
                        <AppIcon name="send" :size="16" /> <span class="text-sm">Telegram</span>
                    </button>
                    <button type="button" class="btn btn-ghost" @click="showEditList = true">
                        <AppIcon name="pencil" :size="16" /> <span class="text-sm">Edit</span>
                    </button>
                    <button type="button" class="btn btn-ghost" @click="duplicate">
                        <AppIcon name="copy" :size="16" /> <span class="text-sm">Duplicate</span>
                    </button>
                    <button type="button" class="btn btn-ghost hover:text-rose-600" @click="confirmDeleteList = true">
                        <AppIcon name="trash" :size="16" /> <span class="text-sm">Delete</span>
                    </button>
                </div>
            </div>
        </div>

        <ListSummary :totals="totals" @edit-budget="showEditList = true" />

        <section class="card p-4 sm:p-5" aria-label="Add an item">
            <ItemForm @submit="(fields) => addItem(list.id, fields)" />
        </section>

        <section class="card overflow-hidden" aria-label="Items">
            <div class="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                <h2 class="text-sm font-semibold text-ink">Items ({{ list.items.length }})</h2>
                <button v-if="totals.boughtCount" type="button" class="btn btn-ghost text-xs" @click="resetBought(list.id)">
                    <AppIcon name="rotateCcw" :size="14" /> Untick all
                </button>
            </div>
            <ul v-if="list.items.length" class="divide-y divide-line">
                <ItemRow
                    v-for="item in list.items"
                    :key="item.id"
                    :item="item"
                    @toggle="toggleBought(list.id, item.id)"
                    @edit="editingItem = item"
                    @delete="itemToDelete = item"
                />
            </ul>
            <p v-else class="px-5 py-10 text-center text-sm text-ink-muted">No items yet. Add your first one above.</p>
        </section>

        <ShareReportModal :open="showShare" :list="list" @close="showShare = false" />

        <ListFormModal :open="showEditList" :list="list" @submit="saveList" @close="showEditList = false" />

        <BaseModal :open="!!editingItem" title="Edit item" @close="editingItem = null">
            <ItemForm v-if="editingItem" :key="editingItem.id" :item="editingItem" submit-label="Save" @submit="saveItem" @cancel="editingItem = null" />
        </BaseModal>

        <ConfirmDialog
            :open="!!itemToDelete"
            title="Delete item?"
            :message="`“${itemToDelete?.name}” will be removed from this list.`"
            @confirm="removeItem"
            @close="itemToDelete = null"
        />
        <ConfirmDialog
            :open="confirmDeleteList"
            title="Delete list?"
            :message="`“${list.name}” and its ${list.items.length} items will be deleted. This can't be undone.`"
            confirm-label="Delete list"
            @confirm="removeList"
            @close="confirmDeleteList = false"
        />
    </div>
</template>
