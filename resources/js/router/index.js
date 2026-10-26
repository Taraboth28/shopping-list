import { createRouter, createWebHistory } from 'vue-router';
import ListsPage from '../pages/ListsPage.vue';

const appName = window.__APP_CONFIG__?.name ?? 'Shopping List';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'lists', component: ListsPage, meta: { title: 'My lists' } },
        { path: '/lists/:id', name: 'list', component: () => import('../pages/ListDetailPage.vue'), props: true, meta: { title: 'List' } },
        { path: '/settings', name: 'settings', component: () => import('../pages/SettingsPage.vue'), meta: { title: 'Settings' } },
        { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../pages/NotFoundPage.vue'), meta: { title: 'Not found' } },
    ],
    scrollBehavior: () => ({ top: 0 }),
});

router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · ${appName}` : appName;
});

export default router;
