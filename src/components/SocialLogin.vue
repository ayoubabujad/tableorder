<template>
  <div class="separator">
    <div class="line"></div>
    <span class="text">{{ $t("or continue with") }}</span>
    <div class="line"></div>
  </div>

  <div class="q-gutter-x-lg text-center">
    <q-btn
      padding="15px"
      color="amber-1"
      unelevated
      class="myshadow radius8"
      to="/user/loginbyphone"
    >
      <q-avatar size="22px">
        <q-icon name="phone" color="amber-8" size="sm"></q-icon>
      </q-avatar>
    </q-btn>

    <template v-if="$q.capacitor">
      <SocialNativelogin
        :google_login_enabled="getSettings?.google_login_enabled"
        :fb_flag="getSettings?.fb_flag"
        :app_enabled_apple_login="getSettings?.app_enabled_apple_login"
        :settings="getSettings"
        @after-login="afterLogin"
      >
      </SocialNativelogin>
    </template>
    <template v-else>
      <SocialWeblogin
        :google_login_enabled="getSettings?.google_login_enabled"
        :fb_flag="getSettings?.fb_flag"
        :app_enabled_apple_login="getSettings?.app_enabled_apple_login"
        :settings="getSettings"
        @after-login="afterLogin"
      ></SocialWeblogin>
    </template>
  </div>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useSettingStore } from "src/stores/SettingStore";
import { useAuthStore } from "src/stores/AuthStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "SocialLogin",
  props: ["redirect"],
  setup() {
    const SettingStore = useSettingStore();
    const AuthStore = useAuthStore();
    return { SettingStore, AuthStore };
  },
  components: {
    SocialWeblogin: defineAsyncComponent(() =>
      import("components/SocialWeblogin.vue")
    ),
    SocialNativelogin: defineAsyncComponent(() =>
      import("components/SocialNativelogin.vue")
    ),
  },
  computed: {
    getSettings() {
      return this.SettingStore.settings_data?.social_settings ?? null;
    },
    // hasSocialLogin() {
    //   return (
    //     this.SettingStore.settings_data.social_settings?.google_login_enabled ||
    //     this.SettingStore.settings_data.social_settings?.fb_flag ||
    //     this.SettingStore.settings_data.social_settings?.app_enabled_apple_login
    //   );
    // },
  },
  methods: {
    async afterLogin(data) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        const response = await APIinterface.fetchDataPost(
          "SocialRegister",
          data
        );
        const isLogin = response?.details?.is_login ?? false;
        const verificationNeeded = response?.details?.verify ?? false;
        if (verificationNeeded) {
          this.$router.push({
            path: "/user/verifycode",
            query: {
              uuid: response.details.uuid,
              msg: response.msg,
            },
          });
          return;
        }

        if (!isLogin) {
          this.$router.push({
            path: "/account/complete-registration",
            query: { uuid: response.details.uuid },
          });
          return;
        }

        auth.setUser(response.details.user_data);
        auth.setToken(response.details.user_token);
        this.AuthStore.isLogin = true;

        if (this.redirect) {
          this.$router.push(this.redirect);
        } else {
          this.$router.push("/home");
        }
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
