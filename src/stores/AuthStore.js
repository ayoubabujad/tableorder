import { defineStore } from "pinia";
import { api } from "boot/axios";
import auth from "src/api/auth";
import { useSettingStore } from "stores/SettingStore";
import { usePusherStore } from "src/stores/PusherStore";
import { useDataStore } from "src/stores/DataStore";

export const useAuthStore = defineStore("AuthStore", {
  state: () => ({
    loading: false,
    data: null,
    settings: null,
    isLogin: false,
    logout_account: null,
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },

  actions: {
    subscribePusher(client_uuid) {
      try {
        const SettingStore = useSettingStore();
        const PusherStore = usePusherStore();
        const DataStore = useDataStore();

        const pusher_data = SettingStore.settings_data?.pusher_data ?? null;
        if (!pusher_data) {
          return;
        }

        const pusher_enabled = pusher_data?.realtime_app_enabled ?? false;
        if (!pusher_enabled) {
          return;
        }

        PusherStore.subscribeToChannel(
          client_uuid,
          "notification-event",
          (data) => {
            DataStore.receive_event = data;
          }
        );

        PusherStore.subscribeToChannel(
          client_uuid,
          "event-tracking-order",
          (data) => {
            DataStore.receive_eventTracking = data;
          }
        );
      } catch (error) {
        console.log("error", error);
      } finally {
      }
    },
    async validateToken() {
      try {
        this.loading = true;
        const response = await api.get("/verifytoken?token=" + auth.getToken());
        this.data = response.data;
        return this.data;
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
