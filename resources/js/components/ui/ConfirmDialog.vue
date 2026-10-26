<script setup>
import BaseModal from './BaseModal.vue';

defineProps({
    open: { type: Boolean, default: false },
    title: { type: String, required: true },
    message: { type: String, default: '' },
    confirmLabel: { type: String, default: 'Delete' },
});

const emit = defineEmits(['confirm', 'close']);
</script>

<template>
    <BaseModal :open="open" :title="title" @close="emit('close')">
        <p class="text-sm">{{ message }}</p>
        <div class="mt-6 flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="emit('close')">Cancel</button>
            <button type="button" class="btn btn-danger" @click="emit('confirm')">{{ confirmLabel }}</button>
        </div>
    </BaseModal>
</template>
