<template>
  <q-dialog
    v-model="modal"
    persistent
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-show="beforeShow"
    @before-hide="beforeHide"
  >
    <q-card>
      <q-toolbar>
        <q-btn
          round
          dense
          icon="close"
          unelevated
          :color="$q.dark.mode ? 'grey' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
          v-close-popup
        />
        <q-toolbar-title class="text-weight-bold text-darkx">{{
          $t("Notification Settings")
        }}</q-toolbar-title>
      </q-toolbar>

      <div
        v-if="loading"
        class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
      >
        <q-circular-progress indeterminate rounded size="sm" color="primary" />
        <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
      </div>

      <q-card-section v-else>
        <q-list>
          <q-item tag="label" clickable>
            <q-item-section>
              <q-item-label>{{ $t("Order Updates") }}</q-item-label>
              <q-item-label caption>{{
                $t("Get notified when your order status changes")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="order_updates"
                @update:model-value="updateOrderUpdates"
              />
            </q-item-section>
          </q-item>

          <q-item tag="label" clickable>
            <q-item-section>
              <q-item-label>{{ $t("Promotional Notifications") }}</q-item-label>
              <q-item-label caption>{{
                $t("Receive new offers and announcements")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle
                v-model="promo_updates"
                @update:model-value="updatePromoUpdates"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <PushSubsribe ref="ref_webpush" @afterNotallow="afterNotallow"></PushSubsribe>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
// PWA-only: FCM handled via Firebase web push
import config from "src/api/config";

export default {
  name: "PushSettings",
  components: {
    PushSubsribe: defineAsyncComponent(() =>
      import("components/PushSubsribe.vue")
    ),
  },
  data() {
    return {
      modal: false,
      promo_updates: false,
      order_updates: false,
      loading: false,
      loading1: false,
      loading2: false,
      isLogin: false,
      client_uuid: null,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { DataStorePersisted, DataStore };
  },
  methods: {
    afterNotallow() {
      console.log("afterNotallow");
      this.order_updates = false;
    },
    beforeHide() {
      if (this.$q.capacitor) {
        return;
      }

      this.DataStore.data.push_settings = {
        promo_updates: this.promo_updates,
        order_updates: this.order_updates,
      };
    },
    async updatePromoUpdates(value) {
      // ANDROID/IOS
      if (this.$q.capacitor) {
        try {
          if (value) {
            await FCM.subscribeTo({ topic: config.topic });
            this.DataStorePersisted.promotional_push_enabled = true;
          } else {
            await FCM.unsubscribeFrom({ topic: config.topic });
            this.DataStorePersisted.promotional_push_enabled = false;
          }
        } catch (error) {
          console.log("error", error);
        }
        return;
      }

      // PWA/WEB
      try {
        this.loading2 = true;
        await APIinterface.fetchDataByTokenPost(
          "savePromoNotifications",
          new URLSearchParams({
            push: value ? 1 : 0,
          }).toString()
        );
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading2 = false;
      }
    },
    async updateOrderUpdates(value) {
      // ANDROID/IOS
      if (this.$q.capacitor) {
        try {
          if (value) {
            await FCM.subscribeTo({ topic: this.client_uuid });
            this.DataStorePersisted.push_enabled = true;
          } else {
            await FCM.unsubscribeFrom({ topic: this.client_uuid });
            this.DataStorePersisted.push_enabled = false;
          }
        } catch (error) {
          console.log("error", error);
        }
        return;
      }

      const is_messaging_supported = this.DataStore.is_messaging_supported;
      const isPWA = this.DataStore.isPWA();

      if (is_messaging_supported && isPWA && value) {
        if (this.$refs.ref_webpush) {
          this.$refs.ref_webpush.modal = true;
        }
        return;
      }

      // WEB / PWA;
      try {
        this.loading1 = true;
        await APIinterface.fetchDataByTokenPost(
          "savenotifications",
          new URLSearchParams({
            push: value ? 1 : 0,
          }).toString()
        );
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading1 = false;
      }
    },
    async beforeShow() {
      const userData = auth.getUser();
      this.client_uuid = userData?.client_uuid;

      if (this.$q.capacitor) {
        this.loading = false;
        this.order_updates = this.DataStorePersisted.push_enabled;
        this.promo_updates = this.DataStorePersisted.promotional_push_enabled;
        return;
      }

      if (this.DataStore.data?.push_settings) {
        this.promo_updates = this.DataStore.data?.push_settings?.promo_updates;
        this.order_updates = this.DataStore.data?.push_settings?.order_updates;
        return;
      }

      try {
        this.loading = true;
        const response = await APIinterface.fetchGet(
          "fetchNotificationSettings"
        );
        this.order_updates =
          response.details.app_push_notifications == 1 ? true : false;
        this.promo_updates =
          response.details.promotional_push_notifications == 1 ? true : false;
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
