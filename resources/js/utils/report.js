import { formatMoney, fromUsd, otherCurrency } from './money';
import { itemTotalUsd, listTotals } from './totals';

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

/** Plain-text summary of one list, for pasting into a chat (Telegram shares plain text only). */
export function buildListReport(list, settings, now = new Date()) {
    const { displayCurrency, khrPerUsd } = settings;
    const money = (usd) => formatMoney(fromUsd(usd, displayCurrency, khrPerUsd), displayCurrency);
    const moneyBoth = (usd) => `${money(usd)} (≈ ${formatMoney(fromUsd(usd, otherCurrency(displayCurrency), khrPerUsd), otherCurrency(displayCurrency))})`;
    const totals = listTotals(list, khrPerUsd);

    // Names picked from the quick chips already start with an emoji.
    const title = /^\p{Extended_Pictographic}/u.test(list.name) ? list.name : `🛒 ${list.name}`;
    const lines = [title, `📅 ${dateFormat.format(now)}`, ''];

    if (list.items.length) {
        lines.push(`Items (${totals.boughtCount}/${totals.itemCount} bought):`);

        for (const item of list.items) {
            const qty = `${+item.qty.toFixed(3)}${item.unit ? ` ${item.unit}` : ''}`;
            const price = formatMoney(item.unitPrice, item.currency, { roundKhr: false });
            const note = item.note ? ` (${item.note})` : '';

            lines.push(`${item.bought ? '✅' : '⬜'} ${item.name}${note} — ${qty} × ${price} = ${money(itemTotalUsd(item, khrPerUsd))}`);
        }
    } else {
        lines.push('No items yet.');
    }

    lines.push(
        '',
        `🧾 Estimated total: ${moneyBoth(totals.total)}`,
        `✔️ Bought: ${money(totals.bought)}`,
        `⏳ Still to pay: ${moneyBoth(totals.remaining)}`,
    );

    if (totals.status === 'over') {
        lines.push(`🚨 Budget: ${money(totals.budget)} — over by ${money(totals.overBy)}`);
    } else if (totals.status !== 'none') {
        const warn = totals.status === 'warn' ? '⚠️' : '💰';
        lines.push(`${warn} Budget: ${money(totals.budget)} — ${Math.round(totals.ratio * 100)}% used, ${money(totals.leftInBudget)} left`);
    }

    return lines.join('\n');
}
