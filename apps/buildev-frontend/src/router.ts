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
  {
    path: "/github/callback",
    component: () => import("./views/GitHubCallbackView.vue"),
    /** Público: debe cargar siempre tras redirect de GitHub; el POST exige Bearer en localStorage. */
    meta: { public: true },
  },
  {
    path: "/auth/github",
    component: () => import("./views/OAuthLoginCallbackView.vue"),
    meta: { public: true },
  },
  {
    path: "/auth/google",
    component: () => import("./views/OAuthLoginCallbackView.vue"),
    meta: { public: true },
  },
  {
    path: "/invite",
    component: () => import("./views/InviteAcceptView.vue"),
    meta: { public: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.public) {
    return true;
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  if (to.path === "/login" && auth.isAuthenticated) {
    return "/";
  }
  return true;
});

export default router;
