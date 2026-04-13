import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "./store/auth";

const routes = [
  {
    path: "/login",
    component: () => import("./views/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/dashboard",
    redirect: "/",
  },
  {
    path: "/",
    component: () => import("./views/DashboardView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/editor/:id",
    component: () => import("./views/PageEditorView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/preview/:id",
    component: () => import("./views/PreviewView.vue"),
    meta: { public: true },
  },
  {
    path: "/ai-studio",
    component: () => import("./views/AIStudioView.vue"),
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to: any) => {
  // Authentication disabled for testing
  /*
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return "/login";
  }
  if (to.path === "/login" && auth.isAuthenticated) {
    return "/";
  }
  */
});

export default router;
