<script setup>
import { onBeforeUnmount, watch } from 'vue';
import AppIcon from './AppIcon.vue';

const props = defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
});

const emit = defineEmits(['close']);

function onKeydown(event) {
    if (event.key === 'Escape') {
        emit('close');
    }
}

watch(
    () => props.open,
    (open) => {
        document.body.style.overflow = open ? 'hidden' : '';
        window[open ? 'addEventListener' : 'removeEventListener']('keydown', onKeydown);
    },
);

onBeforeUnmount(() => {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
    <Teleport to="body">
        <Transition enter-from-class="opacity-0" leave-to-class="opacity-0" enter-active-class="transition" leave-active-class="transition">
            <!-- Centered dialog on every screen size. -->
            <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm dark:bg-black/70" @click.self="emit('close')">
                <div class="card modal-panel max-h-[90vh] w-full max-w-md overflow-y-auto shadow-2xl" role="dialog" aria-modal="true" :aria-label="title">
                    <div class="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                        <div class="flex items-center gap-3">
                            <span v-if="icon" class="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                                <AppIcon :name="icon" :size="20" />
                            </span>
                            <div>
                                <h2 class="text-lg font-semibold text-ink">{{ title }}</h2>
                                <p v-if="description" class="text-sm text-ink-muted">{{ description }}</p>
                            </div>
                        </div>
                        <button type="button" class="btn btn-ghost" aria-label="Close" @click="emit('close')">
                            <AppIcon name="close" :size="18" />
                        </button>
                    </div>
                    <div class="px-5 py-4">
                        <slot />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>
