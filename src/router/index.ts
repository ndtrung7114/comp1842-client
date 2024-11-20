import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),

    },
    {
      path: '/posts',
      name: 'posts',
      component: () => import('../views/post/PostView.vue'),
      meta: { requiresAuth: true }

    },
    {
      path: '/posts/:id',
      name: 'post-detail',
      component: () => import('../views/post/PostDetail.vue'),
      meta: { requiresAuth: true } // Only authenticated users can view post details
    },
    {
      path: '/posts/edit/:id',
      name: 'edit-post',
      component: () => import('../views/post/EditPostView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/create-post',
      name: 'create-post',
      component: () => import('../views/post/CreatePost.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/auth/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/user/:id',
      name: 'user',
      component: () => import('../views/users/UserView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/auth/ForgotPassword.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/verify-otp/:email',
      name: 'verify-otp',
      component: () => import('../views/auth/VerifyOTP.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/reset-password/:email',
      name: 'reset-password',
      component: () => import('../views/auth/ResetPassword.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/update-password/:id',
      name: 'update-password',
      component: () => import('../views/users/UpdatePasswordView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/conversation',
      name: 'messages',
      component: () => import('../views/message/MessageView.vue'),
      meta: { requiresAuth: true }

    },
    {
      path: '/users',
      name: 'allUser',
      component: () => import('../views/users/AllUserView.vue'),
      meta: { requiresAuth: true }

    },


  ]
})

router.beforeResolve(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check if the route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  // Check if the route is restricted to guests
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'home' });
  }

  // Special condition for update-password route
  if (to.name === 'update-password') {
    const userId = authStore.user.user._id; // Get the logged-in user's ID
    const userRole = authStore.user.user.role; // Get the logged-in user's role
    const routeId = to.params.id; // Get the ID from the route

    // Allow access only if the user ID matches or the role is admin
    if (userId !== routeId && userRole !== 'admin') {
      return next({ name: 'home' }); // Redirect to home or an error page
    }
  }

  // Allow navigation for other cases
  next();
});

export default router