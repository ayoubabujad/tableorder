<template>
  <q-btn
    v-if="google_login_enabled"
    round
    padding="16px"
    :outline="$q.dark.mode ? false : true"
    color="mygrey"
    @click="handleGoogle"
    :loading="loading"
    class="myshadow radius8"
  >
    <q-avatar size="20px">
      <img src="google-icon-logo.svg" />
    </q-avatar>
  </q-btn>

  <q-btn
    v-if="fb_flag"
    round
    padding="15px"
    color="fbbg"
    @click="handleFacebook"
    :loading="loading"
    class="myshadow radius8"
  >
    <q-avatar size="22px">
      <img src="logos-facebook.svg" />
    </q-avatar>
  </q-btn>

  <q-btn
    v-if="app_enabled_apple_login"
    round
    padding="15px"
    @click="handleAppleLogin"
    :loading="loading"
    color="dark"
    class="myshadow radius8"
  >
    <q-avatar size="22px">
      <img src="apple-black-logo.svg" />
    </q-avatar>
  </q-btn>
</template>

<script>
// PWA-only: Social login requires OAuth web flow implementation
// This is a placeholder - implement web OAuth if needed

export default {
  name: "SocialNativelogin",
  props: [
    "google_login_enabled",
    "fb_flag",
    "app_enabled_apple_login",
    "settings",
  ],
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    showNotAvailable(provider) {
      this.$q.notify({
        message: `${provider} login is not available in this version`,
        color: "warning",
        position: "top",
      });
    },
    handleGoogle() {
      this.showNotAvailable("Google");
    },
    handleFacebook() {
      this.showNotAvailable("Facebook");
    },
    handleAppleLogin() {
      this.showNotAvailable("Apple");
    },
  },
};
</script>
