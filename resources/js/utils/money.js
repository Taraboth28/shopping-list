/**
 * Money helpers. Every total is computed in USD (the common base) and converted
 * to the display currency only when shown.
 */
export const CURRENCIES = ['USD', 'KHR'];

export const CURRENCY_SYMBOLS = { USD: '$', KHR: '៛' };

export function toUsd(amount, currency, khrPerUsd) {
    return currency === 'KHR' ? amount / khrPerUsd : amount;
}

export function fromUsd(usd, currency, khrPerUsd) {
    return currency === 'KHR' ? usd * khrPerUsd : usd;
}

export function otherCurrency(currency) {
    return currency === 'KHR' ? 'USD' : 'KHR';
}

const usdFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const khrFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/**
 * KHR has no coins, so converted riel amounts are rounded to the nearest 100 ៛
 * (pass roundKhr: false to show an entered price exactly).
 */
export function formatMoney(amount, currency, { roundKhr = true } = {}) {
    if (currency === 'KHR') {
        const riel = roundKhr ? Math.round(amount / 100) * 100 : Math.round(amount);

        return `${khrFormat.format(riel)} ៛`;
    }

    return usdFormat.format(amount);
}
