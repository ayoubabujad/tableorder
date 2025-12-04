<template>
  <q-layout view="lHh Lpr lFf">
    <!-- 🚀 HIGH-TECH HEADER -->
    <q-header reveal class="ht-header">
      <PwaInstall></PwaInstall>
      <q-toolbar v-if="DataStore.show_toobar" class="ht-toolbar">
        <!-- Language Button -->
        <div class="ht-header-left">
          <router-link to="/account/language" class="ht-lang-btn">
            <div class="ht-lang-icon">
              <q-icon name="o_language" size="18px" />
            </div>
            <span class="ht-lang-text">{{ currentLanguageName }}</span>
            <q-icon name="expand_more" size="16px" class="ht-lang-chevron" />
          </router-link>
        </div>

        <q-space />

        <!-- Notification Button -->
        <div class="ht-header-right">
          <NotiButton></NotiButton>
        </div>
      </q-toolbar>
    </q-header>

    <!-- 🦶 HIGH-TECH FOOTER -->
    <q-footer
      class="ht-footer"
      :class="{ 'q-mb-md': $q.platform.is.ios }"
      v-if="!CartData.home_view_items"
    >
      <FooterMenu :direction="direction"></FooterMenu>
    </q-footer>

    <q-page-container>
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
        appear
        :duration="300"
      >
        <router-view />
      </transition>

      <OrderUpdates ref="ref_orderupdate"></OrderUpdates>
      <PushSubsribe ref="ref_webpush"></PushSubsribe>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { userCartData } from "stores/CartData";
import { useDataStore } from "src/stores/DataStore";
import APIinterface from "src/api/APIinterface";

export default defineComponent({
  name: "MainLayout",
  data() {
    return {
      direction: "",
      path: "",
      loading: false,
    };
  },
  setup() {
    const CartData = userCartData();
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { CartData, DataStorePersisted, SettingStore, DataStore };
  },
  components: {
    FooterMenu: defineAsyncComponent(() => import("components/FooterMenu.vue")),
    NotiButton: defineAsyncComponent(() => import("components/NotiButton.vue")),
    OrderUpdates: defineAsyncComponent(() =>
      import("components/OrderUpdates.vue")
    ),
    PushSubsribe: defineAsyncComponent(() =>
      import("components/PushSubsribe.vue")
    ),
    PwaInstall: defineAsyncComponent(() => import("components/PwaInstall.vue")),
  },
  computed: {
    currentLanguageName() {
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        const languageList = this.SettingStore.settings_data.language_list?.list;
        if (languageList) {
          const currentLang = Object.values(languageList).find(
            lang => lang.code === this.DataStorePersisted.app_language
          );
          return currentLang ? currentLang.title : this.$t("Language");
        }
      }
      return this.$t("Language");
    },
  },
  mounted() {
    if (this.SettingStore.search_mode == "address") {
      this.fetchLocation();
    }

    this.$watch(
      () => this.DataStore.$state.receive_event,
      (newData, oldData) => {
        this.handleReceiveEvent(newData);
      }
    );

    this.$watch(
      () => this.DataStore.$state.receive_eventTracking,
      (newData, oldData) => {
        this.DataStore.data.orderList = null;
        this.DataStore.is_refresh_order = true;
        this.$refs.ref_orderupdate.showModal(newData);
      }
    );

    this.$watch(
      () => this.DataStore.show_webpush,
      (newData) => {
        if (newData) {
          setTimeout(() => {
            if (this.$refs.ref_webpush && !this.$q.capacitor) {
              this.DataStore.show_webpush = false;
              this.$refs.ref_webpush.modal = true;
            }
          }, 1000);
        }
      },
      { immediate: true }
    );

    //
  },
  methods: {
    async fetchLocation() {
      if (this.DataStorePersisted.place_data) {
        return;
      }

      try {
        let location = null;
        if (this.$q.capacitor) {
          location = await this.DataStore.fetchLocation(this.$t);
        } else {
          location = await this.DataStore.fetchWebLocation(this.$t);
        }

        this.DataStorePersisted.coordinates.lat = location.latitude;
        this.DataStorePersisted.coordinates.lng = location.longitude;

        this.reverseGeocoding();
      } catch (error) {
        console.log("error", error);
      } finally {
        //
      }
    },
    async reverseGeocoding() {
      try {
        const params = new URLSearchParams({
          lat: this.DataStorePersisted.coordinates?.lat,
          lng: this.DataStorePersisted.coordinates?.lng,
        }).toString();
        const response = await APIinterface.fetchDataGet(
          "coordinatesToAddress",
          params
        );
        this.DataStorePersisted.place_data = response.details.address_details;
        this.DataStorePersisted.saveRecentAddress(
          response.details.address_details
        );
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
    handleReceiveEvent(data) {
      const notification_type = data?.notification_type ?? null;
      if (notification_type == "chat-message") {
        this.DataStore.PlayAudio("chat");
        const currentCount = parseInt(this.DataStorePersisted.chat_count);
        this.DataStorePersisted.chat_count =
          currentCount > 0 ? currentCount + 1 : 1;
      } else {
        this.DataStore.PlayAudio("notify");
        const currentCount = parseInt(this.DataStorePersisted.alert_count);
        this.DataStorePersisted.alert_count =
          currentCount > 0 ? currentCount + 1 : 1;
      }
    },
  },
});
</script>

<style scoped>
/* 🚀 HIGH-TECH HEADER STYLES */
.ht-toolbar {
  min-height: 60px;
  padding: 0 16px;
}

.ht-header-left,
.ht-header-right {
  display: flex;
  align-items: center;
}

.ht-lang-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: var(--ht-bg, #f8fafc);
  border-radius: var(--ht-radius-full, 9999px);
  text-decoration: none;
  transition: var(--ht-transition-base, 250ms ease);
  cursor: pointer;
}

.ht-lang-btn:active {
  transform: scale(0.97);
  background: var(--ht-border, rgba(15, 23, 42, 0.08));
}

.ht-lang-icon {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: var(--ht-radius-full, 9999px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.ht-lang-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--ht-text, #0f172a);
}

.ht-lang-chevron {
  color: var(--ht-text-secondary, #64748b);
}

/* Dark mode */
body.body--dark .ht-lang-btn {
  background: var(--ht-bg-elevated, #1e293b);
}

body.body--dark .ht-lang-text {
  color: var(--ht-text, #f1f5f9);
}
</style>
