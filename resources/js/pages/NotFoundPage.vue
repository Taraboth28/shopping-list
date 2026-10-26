<script setup>
import EmptyState from '../components/ui/EmptyState.vue';
</script>

<template>
    <EmptyState icon="alertTriangle" title="Page not found" message="The page you're looking for doesn't exist.">
        <RouterLink to="/" class="btn btn-primary">Back to my lists</RouterLink>
    </EmptyState>
</template>
