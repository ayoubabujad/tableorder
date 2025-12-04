import { route } from "quasar/wrappers";
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import routes from "./routes";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useAuthStore } from "stores/AuthStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === "history"
    ? createWebHistory
    : createWebHashHistory;

  const Router = createRouter({
    //scrollBehavior: () => ({ left: 0, top: 0 }),
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        // Return to the saved scroll position
        return savedPosition;
      } else {
        // Scroll to the top for new pages
        return { left: 0, top: 0 };
      }
    },
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    const AuthStore = useAuthStore();
    const DataStorePersisted = useDataStorePersisted();
    const skip_home = DataStorePersisted.skip_home;

    if (to.meta.checkIntro) {
      if (auth.authenticated()) {
        next({ path: "/home" });
      } else {
        if (skip_home) {
          next({ path: "/home" });
        } else {
          next({ path: "/welcome" });
        }
      }
    } else if (to.meta.verifyToken) {
      const respToken = await AuthStore.validateToken();
      if (respToken.code == 1) {
        next();
      } else {
        auth.logout();
        next({ path: "/user/login" });
      }
    } else if (!to.meta.requiresAuth || auth.authenticated()) {
      next();
    } else {
      next({ path: "/user/login", query: { redirect: to.fullPath } });
    }
  });

  return Router;
});
