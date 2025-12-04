import { boot } from "quasar/wrappers";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import { AddressbarColor, Platform } from "quasar";
import config from "src/api/config";
import { useDataStore } from "src/stores/DataStore";
import { useAuthStore } from "src/stores/AuthStore";
import auth from "src/api/auth";
import { firebaseMessaging, onMessage } from "src/boot/FirebasePWApush";

// PWA-only: No Capacitor imports needed

let lastBackPress = 0;

export default boot(async ({ app, router, store }) => {
  AddressbarColor.set("#f1c646");

  const SettingStore = useSettingStore();
  const DataStorePersisted = useDataStorePersisted();
  const DataStore = useDataStore();
  const AuthStore = useAuthStore();

  // FETCH SETTINGS
  try {
    const isLogin = auth.authenticated();
    if (isLogin) {
      AuthStore.isLogin = true;
    }

    const response = await APIinterface.fetchDataGet("getSettings", "");
    SettingStore.settings_data = response.details;
    SettingStore.merchant_uuid = response.details.merchant_uuid;
    SettingStore.merchant_id = response.details.merchant_id;
    SettingStore.search_mode = response.details.home_search_mode;
    SettingStore.location_searchtype = response.details.location_searchtype;
    SettingStore.location_enabled_map_selection =
      response.details.location_enabled_map_selection;
    SettingStore.country_id = response.details.country_id;

    if (
      response.details?.multicurrency_enabled &&
      !DataStorePersisted.use_currency_code
    ) {
      const base_currency = response.details?.base_currency ?? null;
      if (base_currency) {
        DataStorePersisted.use_currency_code = base_currency;
      }
    }
  } catch (error) {
    console.log("error", error);
  } finally {
  }
  // END FETCH SETTINGS

  // LANGUAGE
  let default_lang = null;
  default_lang = DataStorePersisted?.app_language ?? null;
  if (
    SettingStore.settings_data.enabled_language &&
    !default_lang &&
    SettingStore.settings_data.default_lang
  ) {
    DataStorePersisted.app_language = SettingStore.settings_data.default_lang;
  }
  // END LANGUAGE

  // AUDIO - PWA uses HTML5 Audio API (handled in DataStore.playAlert)

  // Check if firebase web push is supported
  try {
    DataStore.is_messaging_supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
  } catch (error) {
    console.log("error", error);
  }

  // PWA PUSH
  if (DataStore.is_messaging_supported) {
    const NotificationPermission = Notification.permission;
    if (NotificationPermission == "granted" && DataStorePersisted.web_token) {
      console.log("verify token");
      try {
        const params = new URLSearchParams({
          platform: "pwa",
          token: DataStorePersisted.web_token,
        }).toString();

        await APIinterface.fetchDataByTokenPost("PushSuscribeValidate", params);

        onMessage(firebaseMessaging, (payload) => {
          console.log("Foreground message received:", payload);
          const title = payload?.notification?.title || "";
          const body = payload?.notification?.body || "";
          DataStore.playAlert(`<strong>${title}</strong><br>${body}`);
        });
      } catch (error) {
        console.log("error", error);
        DataStorePersisted.web_token = null;
      }
    }
    // end VERIFY WEB PUSH TOKEN
  }

  // PWA-only: No Capacitor device code needed
});
