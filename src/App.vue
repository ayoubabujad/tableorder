<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { api } from "boot/axios";
import APIinterface from "./api/APIinterface";
import { useDataStorePersisted } from "./stores/DataStorePersisted";
import { useSettingStore } from "./stores/SettingStore";
import { useDataStore } from "./stores/DataStore";
// PWA-only: No FCM import needed (uses Firebase web push)
import config from "./api/config";
import auth from "./api/auth";
import { useAuthStore } from "./stores/AuthStore";
import { usePusherStore } from "./stores/PusherStore";

export default defineComponent({
  name: "App",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    const AuthStore = useAuthStore();
    const PusherStore = usePusherStore();
    return {
      DataStorePersisted,
      SettingStore,
      DataStore,
      AuthStore,
      PusherStore,
    };
  },
  created() {
    this.$q.dark.set(this.DataStorePersisted.dark_mode);

    if (!APIinterface.empty(this.DataStorePersisted.app_language)) {
      this.$i18n.locale = this.DataStorePersisted.app_language;
    }

    if (!APIinterface.empty(this.DataStorePersisted.rtl)) {
      this.$q.lang.set({ rtl: this.DataStorePersisted.rtl });
      // Apply RTL direction to document
      if (this.DataStorePersisted.rtl === true) {
        document.documentElement.setAttribute("dir", "rtl");
        document.body.setAttribute("dir", "rtl");
      } else {
        document.documentElement.setAttribute("dir", "ltr");
        document.body.setAttribute("dir", "ltr");
      }
    }
    api.defaults.params = {};
    api.defaults.params["language"] = this.$i18n.locale;
    api.defaults.params["source"] = "app";
  },
  mounted() {
    this.checkAppVersion();
    this.initFirebase();
    this.webpushSubscribe();

    this.$watch(
      () => this.AuthStore.$state.isLogin,
      (newData, oldData) => {
        this.initServices(newData);
      }
    );
  },
  methods: {
    checkAppVersion() {
      if (!this.$q.capacitor) {
        return;
      }

      let appUpdate = this.SettingStore.settings_data?.app_update || null;

      const appVersion = this.DataStore.app_version;

      const androidVersion = appUpdate?.mobile_app_version_android || 0;
      const iosVersion = appUpdate?.mobile_app_version_ios || 0;

      const currentPlatform = this.$q.platform.is.android ? "android" : "ios";

      const latestVersion =
        currentPlatform === "android" ? androidVersion : iosVersion;

      const versionResults = this.DataStore.compareVersions(
        appVersion,
        latestVersion
      );
      if (versionResults < 0) {
        this.$router.replace("/update-app");
      }
    },

    //
    initServices(value) {
      if (value) {
        const isLogin = auth.authenticated();
        if (!isLogin) {
          return;
        }
        this.DataStore.show_webpush = true;
        const userData = auth.getUser();
        console.log("user is login", userData.client_uuid);
        this.subscribePusher(userData.client_uuid);
        this.subscribePushFirebase(userData.client_uuid);
        this.webpushSubscribe();
      } else {
        console.log("user has logout");
        this.DataStore.show_webpush = false;
        this.PusherStore.disconnect();
        this.UnsubscribePushFirebase(this.AuthStore.logout_account);
      }
    },

    //
    async UnsubscribePushFirebase(client_uuid) {
      if (!this.$q.capacitor) {
        return;
      }

      try {
        console.log("UnsubscribePushFirebase", client_uuid);
        await FCM.unsubscribeFrom({ topic: client_uuid });
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
    async subscribePushFirebase(client_uuid) {
      if (!this.$q.capacitor) {
        return;
      }

      if (!this.DataStorePersisted.push_enabled) {
        console.log("push_enabled disabled");
        return;
      }

      try {
        await FCM.subscribeTo({ topic: client_uuid });
        this.DataStorePersisted.push_enabled = true;
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 1,
          }).toString()
        );
      } catch (error) {
        console.log("error", error);
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 0,
          }).toString()
        );
      } finally {
      }
    },
    subscribePusher(client_uuid) {
      try {
        const pusher_data =
          this.SettingStore.settings_data?.pusher_data ?? null;

        if (!pusher_data) {
          return;
        }
        const pusher_enabled = pusher_data?.realtime_app_enabled ?? false;
        if (!pusher_enabled) {
          return;
        }

        this.PusherStore.init(pusher_data);
        if (!this.PusherStore.pusherInstance) {
          return;
        }

        this.AuthStore.subscribePusher(client_uuid);
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
    async initFirebase() {
      if (!this.$q.capacitor) {
        return;
      }

      if (this.DataStorePersisted.promotional_push_enabled) {
        try {
          await FCM.subscribeTo({ topic: config.topic });
        } catch (error) {
          console.log("error", error);
        } finally {
        }
      }

      const isLogin = auth.authenticated();
      if (!isLogin || !this.DataStorePersisted.push_enabled) {
        return;
      }

      const userData = auth.getUser();

      try {
        await FCM.subscribeTo({ topic: userData.client_uuid });
        this.DataStorePersisted.push_enabled = true;
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 1,
          }).toString()
        );
      } catch (error) {
        console.log("error", error);
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 0,
          }).toString()
        );
      } finally {
      }

      //
    },

    webpushSubscribe() {
      const isLogin = auth.authenticated();

      if (
        !this.DataStore.is_messaging_supported ||
        this.DataStorePersisted.web_token ||
        !isLogin ||
        !this.DataStorePersisted.push_enabled
      ) {
        return;
      }

      const isPwa = this.DataStore.isPWA();
      console.log("Running as PWA?", isPwa);
      if (!isPwa) {
        return;
      }

      console.log(
        "this.DataStorePersisted.web_token",
        this.DataStorePersisted.web_token
      );

      this.DataStore.show_webpush = true;
    },
  },
});
</script>
