import { reactive, watch } from 'vue';
import { CURRENCIES } from '../utils/money';

/**
 * The single source of truth for lists and settings, persisted to localStorage.
 * Bump the key's version if the stored shape changes incompatibly.
 */
const STORAGE_KEY = 'shopping-list:v1';

const DEFAULT_KHR_PER_USD = 4100;

function defaults() {
    return {
        settings: { displayCurrency: 'USD', khrPerUsd: DEFAULT_KHR_PER_USD },
        lists: [],
    };
}

export function uid() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toNumber(value, fallback = 0) {
    const number = Number(value);

    return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function toCurrency(value) {
    return CURRENCIES.includes(value) ? value : 'USD';
}

function normalizeItem(raw) {
    return {
        id: String(raw?.id ?? uid()),
        name: String(raw?.name ?? '').trim() || 'Untitled item',
        qty: toNumber(raw?.qty, 1),
        unit: String(raw?.unit ?? '').trim(),
        unitPrice: toNumber(raw?.unitPrice),
        currency: toCurrency(raw?.currency),
        bought: Boolean(raw?.bought),
        note: String(raw?.note ?? '').trim(),
    };
}

function normalizeList(raw) {
    return {
        id: String(raw?.id ?? uid()),
        name: String(raw?.name ?? '').trim() || 'Untitled list',
        budget: toNumber(raw?.budget),
        budgetCurrency: toCurrency(raw?.budgetCurrency),
        createdAt: raw?.createdAt ?? new Date().toISOString(),
        items: Array.isArray(raw?.items) ? raw.items.map(normalizeItem) : [],
    };
}

/** Coerces stored or imported data into the expected shape; throws on anything unusable. */
export function normalize(data) {
    if (!data || typeof data !== 'object' || !Array.isArray(data.lists)) {
        throw new Error('This file is not a shopping list backup.');
    }

    const base = defaults();

    return {
        settings: {
            displayCurrency: toCurrency(data.settings?.displayCurrency),
            khrPerUsd: toNumber(data.settings?.khrPerUsd) || base.settings.khrPerUsd,
        },
        lists: data.lists.map(normalizeList),
    };
}

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        return raw ? normalize(JSON.parse(raw)) : defaults();
    } catch {
        return defaults();
    }
}

export const state = reactive(load());

watch(
    state,
    () => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Storage unavailable or full: changes last for this visit only.
        }
    },
    { deep: true },
);

// Keep several open tabs in sync.
window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) {
        return;
    }

    try {
        Object.assign(state, event.newValue ? normalize(JSON.parse(event.newValue)) : defaults());
    } catch {
        // Ignore malformed writes from elsewhere.
    }
});

/* Lists */

export function findList(id) {
    return state.lists.find((list) => list.id === id) ?? null;
}

export function createList({ name, budget = 0, budgetCurrency = state.settings.displayCurrency }) {
    const list = normalizeList({ id: uid(), name, budget, budgetCurrency, createdAt: new Date().toISOString(), items: [] });
    state.lists.unshift(list);

    return list;
}

export function updateList(id, changes) {
    const list = findList(id);

    if (list) {
        Object.assign(list, normalizeList({ ...list, ...changes }), { id: list.id, items: list.items });
    }
}

export function deleteList(id) {
    state.lists = state.lists.filter((list) => list.id !== id);
}

export function duplicateList(id) {
    const source = findList(id);

    if (!source) {
        return null;
    }

    const copy = normalizeList({
        ...source,
        id: uid(),
        name: `${source.name} (copy)`,
        createdAt: new Date().toISOString(),
        items: source.items.map((item) => ({ ...item, id: uid(), bought: false })),
    });
    state.lists.splice(state.lists.indexOf(source), 0, copy);

    return copy;
}

/* Items */

export function addItem(listId, fields) {
    const list = findList(listId);

    if (list) {
        list.items.push(normalizeItem({ ...fields, id: uid(), bought: false }));
    }
}

export function updateItem(listId, itemId, changes) {
    const item = findList(listId)?.items.find((entry) => entry.id === itemId);

    if (item) {
        Object.assign(item, normalizeItem({ ...item, ...changes }), { id: item.id });
    }
}

export function deleteItem(listId, itemId) {
    const list = findList(listId);

    if (list) {
        list.items = list.items.filter((item) => item.id !== itemId);
    }
}

export function toggleBought(listId, itemId) {
    const item = findList(listId)?.items.find((entry) => entry.id === itemId);

    if (item) {
        item.bought = !item.bought;
    }
}

export function resetBought(listId) {
    findList(listId)?.items.forEach((item) => {
        item.bought = false;
    });
}

/* Settings & backup */

export function updateSettings(changes) {
    Object.assign(state.settings, normalize({ settings: { ...state.settings, ...changes }, lists: [] }).settings);
}

export function exportData() {
    return JSON.stringify({ app: 'shopping-list', version: 1, exportedAt: new Date().toISOString(), ...state }, null, 2);
}

export function importData(json) {
    Object.assign(state, normalize(JSON.parse(json)));
}

export function resetAll() {
    Object.assign(state, defaults());
}
