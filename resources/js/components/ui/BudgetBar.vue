<script setup>
import { computed } from 'vue';

/** Budget usage bar: green → amber at 80% → red when over. */
const props = defineProps({
    ratio: { type: Number, required: true },
    status: { type: String, required: true },
});

const width = computed(() => `${Math.min(100, Math.round(props.ratio * 100))}%`);

const color = computed(
    () =>
        ({
            ok: 'bg-emerald-500',
            warn: 'bg-amber-500',
            over: 'bg-rose-500',
        })[props.status] ?? 'bg-emerald-500',
);
</script>

<template>
    <div
        class="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        :aria-valuenow="Math.round(ratio * 100)"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Budget used"
    >
        <div class="h-full rounded-full transition-all duration-500" :class="color" :style="{ width }" />
    </div>
</template>
