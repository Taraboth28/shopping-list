<script setup>
import { useTheme } from '../../composables/useTheme';
import { state, updateSettings } from '../../stores/shoppingStore';
import { CURRENCIES, CURRENCY_SYMBOLS } from '../../utils/money';
import AppIcon from '../ui/AppIcon.vue';

const { isDark, toggleTheme } = useTheme();
const appName = window.__APP_CONFIG__?.name ?? 'Shopping List';
</script>

<template>
    <div class="min-h-screen">
        <header class="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur">
            <div class="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
                <RouterLink to="/" class="flex items-center gap-2 font-semibold text-ink">
                    <span class="grid size-9 place-items-center rounded-xl bg-accent-soft text-accent">
                        <AppIcon name="shoppingCart" :size="20" />
                    </span>
                    <span class="hidden sm:inline">{{ appName }}</span>
                </RouterLink>

                <div class="ml-auto flex items-center gap-1">
                    <div class="mr-1 flex rounded-full border border-line-strong p-0.5" role="group" aria-label="Display currency">
                        <button
                            v-for="currency in CURRENCIES"
                            :key="currency"
                            type="button"
                            class="rounded-full px-3 py-1 text-xs font-semibold transition"
                            :class="state.settings.displayCurrency === currency ? 'bg-ink text-surface' : 'text-ink-muted hover:text-ink'"
                            :aria-pressed="state.settings.displayCurrency === currency"
                            @click="updateSettings({ displayCurrency: currency })"
                        >
                            {{ CURRENCY_SYMBOLS[currency] }} {{ currency }}
                        </button>
                    </div>
                    <button type="button" class="btn btn-ghost" :aria-label="isDark ? 'Switch to day mode' : 'Switch to night mode'" @click="toggleTheme">
                        <AppIcon :name="isDark ? 'sun' : 'moon'" :size="18" />
                    </button>
                    <RouterLink to="/settings" class="btn btn-ghost" aria-label="Settings">
                        <AppIcon name="settings" :size="18" />
                    </RouterLink>
                </div>
            </div>
        </header>

        <main class="mx-auto max-w-5xl px-4 py-6 sm:py-8">
            <slot />
        </main>
    </div>
</template>
