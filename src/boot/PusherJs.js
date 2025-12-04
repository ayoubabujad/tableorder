import { boot } from "quasar/wrappers";
import { useSettingStore } from "stores/SettingStore";
import { usePusherStore } from "stores/PusherStore";
import auth from "src/api/auth";
import { useAuthStore } from "src/stores/AuthStore";

export default boot(async ({ app, router }) => {
  const SettingStore = useSettingStore();
  const PusherStore = usePusherStore();
  const AuthStore = useAuthStore();

  const pusher_data = SettingStore.settings_data?.pusher_data ?? null;
  if (!pusher_data) {
    return;
  }
  const pusher_enabled = pusher_data?.realtime_app_enabled ?? false;
  if (!pusher_enabled) {
    return;
  }

  PusherStore.init(pusher_data);
  if (!PusherStore.pusherInstance) {
    return;
  }

  const isLogin = auth.authenticated();
  if (!isLogin) {
    return;
  }

  const userData = auth.getUser();
  AuthStore.subscribePusher(userData.client_uuid);

  //
});
