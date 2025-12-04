<template>
  <q-dialog
    v-model="modal"
    persistent
    full-width
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    backdrop-filter="blur(4px)"
  >
    <q-card class="radius10">
      <q-card-section class="q-gutter-y-md scroll">
        <div class="text-center q-gutter-y-sm">
          <q-icon name="eva-bell-outline" color="blue" size="4em"></q-icon>
          <div class="text-h5 text-weight-bold">
            {{ $t("Enabled Push Notifications") }}
          </div>
          <div class="text-body2">
            {{ $t("Get updates for your orders and exclusive offers") }}.
          </div>
        </div>
      </q-card-section>
      <q-card-actions vertical class="q-pa-md">
        <q-btn
          no-caps
          unelevated
          color="primary"
          text-color="white"
          size="lg"
          type="submit"
          rounded
          @click="enableNotifications"
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Allow Notifications") }}
          </div>
        </q-btn>

        <q-space class="q-pa-xs"></q-space>

        <q-btn
          no-caps
          unelevated
          color="disabled"
          text-color="dark"
          size="lg"
          rounded
          @click="dontAllow"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Don't Allow") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import {
  firebaseMessaging,
  getToken,
  onMessage,
} from "src/boot/FirebasePWApush";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { useSettingStore } from "src/stores/SettingStore";

export default {
  name: "PushSubsribe",
  data() {
    return {
      modal: false,
      loading: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { SettingStore, DataStorePersisted, DataStore };
  },
  methods: {
    async dontAllow() {
      this.loading = true;
      try {
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: 0,
          }).toString()
        );
        this.modal = false;
        this.DataStorePersisted.push_enabled = false;
        this.$emit("afterNotallow");
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
    async enableNotifications() {
      try {
        this.loading = true;
        const permission = await Notification.requestPermission();
        console.log("permission", permission);
        if (permission === "granted") {
          const token = await getToken(firebaseMessaging, {
            vapidKey: this.SettingStore.settings_data?.webpush_certificates,
          });
          console.log("FCM Token:", token);

          try {
            const params = new URLSearchParams({
              platform: "pwa",
              token: token,
            }).toString();
            console.log("params", params);
            await APIinterface.fetchDataByTokenPost("PushSubscribe", params);

            this.DataStorePersisted.web_token = token;
            this.DataStorePersisted.push_enabled = true;
            this.modal = false;
          } catch (error) {
            console.log("error", error);
            APIinterface.notify("negative", error, "error_outline", this.$q);
            this.modal = false;
          } finally {
            this.loading = false;
          }
        } else {
          this.modal = false;
          this.loading = false;
          APIinterface.notify(
            "negative",
            this.$t("Notification permission denied"),
            "error_outline",
            this.$q
          );
        }
      } catch (error) {
        console.log("error", error);
        APIinterface.notify("negative", error, "error_outline", this.$q);
        this.loading = false;
      }

      //
      onMessage(firebaseMessaging, (payload) => {
        console.log("Foreground message received:", payload);
        const title = payload?.notification?.title || "";
        const body = payload?.notification?.body || "";
        this.DataStore.playAlert(`<strong>${title}</strong><br>${body}`);
      });
      //
    },
  },
};
</script>
