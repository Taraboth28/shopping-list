<script setup>
import AppIcon from './AppIcon.vue';

defineProps({
    icon: { type: String, default: 'shoppingCart' },
    title: { type: String, required: true },
    message: { type: String, default: '' },
});
</script>

<template>
    <div class="card flex flex-col items-center px-6 py-12 text-center">
        <span class="mb-4 grid size-14 place-items-center rounded-full bg-accent-soft text-accent">
            <AppIcon :name="icon" :size="26" />
        </span>
        <h2 class="text-base font-semibold text-ink">{{ title }}</h2>
        <p v-if="message" class="mt-1 max-w-sm text-sm text-ink-muted">{{ message }}</p>
        <div class="mt-5"><slot /></div>
    </div>
</template>
