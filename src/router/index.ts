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
      component: () => import('../components/CreatePost.vue'),
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
    // {
    //   path: '/user',
    //   name: 'user',
    //   component: () => import('../views/auth/UserView.vue'),
    //   meta: { requiresAuth: true }
    // },

    {
      path: '/user/:id',
      name: 'user',
      component: () => import('../views/auth/UserView.vue'),
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
      component: () => import('../components/VerifyOTP.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/change-password/:email',
      name: 'change-password',
      component: () => import('../components/ChangePassword.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/update-password/:id',
      name: 'update-password',
      component: () => import('../views/auth/UpdatePasswordView.vue'),
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

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Add a flag to prevent infinite loops
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next({ name: 'home' });
  }

  // Handle authentication required routes
  if (to.meta.requiresAuth) {
    try {
      if (!authStore.isAuthenticated) {
        // Store the intended destination
        return next({ 
          name: 'login', 
          query: { redirect: to.fullPath },
          replace: true  // Use replace instead of push to avoid browser history issues
        });
      }
      return next();
    } catch (error) {
      console.error('Auth check error:', error);
      return next({ 
        name: 'login',
        replace: true
      });
    }
  }

  // Handle guest-only routes
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next({ name: 'home' });
  }

  // Special condition for update-password route
  if (to.name === 'update-password') {
    const userId = authStore.user?.user?._id;
    const userRole = authStore.user?.user?.role;
    const routeId = to.params.id;

    if (userId !== routeId && userRole !== 'admin') {
      return next({ name: 'home' });
    }
  }

  // Allow navigation for other cases
  next();
});

export default router