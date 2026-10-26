import { toUsd } from './money';

/** Budget usage at or above this share shows a warning. */
export const BUDGET_WARN_RATIO = 0.8;

export function itemTotalUsd(item, khrPerUsd) {
    return toUsd(item.qty * item.unitPrice, item.currency, khrPerUsd);
}

/**
 * Summary of one list, all amounts in USD.
 * status: 'none' (no budget) | 'ok' | 'warn' (≥ 80% used) | 'over'
 */
export function listTotals(list, khrPerUsd) {
    let total = 0;
    let bought = 0;
    let boughtCount = 0;

    for (const item of list.items) {
        const line = itemTotalUsd(item, khrPerUsd);
        total += line;

        if (item.bought) {
            bought += line;
            boughtCount++;
        }
    }

    const budget = list.budget > 0 ? toUsd(list.budget, list.budgetCurrency, khrPerUsd) : 0;
    const ratio = budget > 0 ? total / budget : 0;

    let status = 'none';
    if (budget > 0) {
        status = ratio > 1 ? 'over' : ratio >= BUDGET_WARN_RATIO ? 'warn' : 'ok';
    }

    return {
        total,
        bought,
        remaining: total - bought,
        itemCount: list.items.length,
        boughtCount,
        budget,
        ratio,
        overBy: Math.max(0, total - budget),
        leftInBudget: Math.max(0, budget - total),
        status,
    };
}
