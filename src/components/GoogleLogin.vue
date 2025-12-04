<template>
  <q-btn
    icon="lab la-google-plus-g"
    unelevated
    :color="$q.dark.mode ? 'grey600' : 'grey-3'"
    class="rounded-borders text-grey"
    @click="Signin"
    :loading="loading"
    size="lg"
  />
</template>

<script>
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import APIinterface from "src/api/APIinterface";

export default {
  name: "GoogleLogin",
  props: ["client_id"],
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (!this.$q.capacitor) {
        GoogleAuth.initialize({
          clientId: this.client_id,
          scopes: ["profile", "email"],
          grantOfflineAccess: true,
        });
      } else {
        GoogleAuth.initialize();
      }
    },
    Signin() {
      this.loading = true;
      GoogleAuth.signIn()
        .then((data) => {
          const $params = {
            id: data.id,
            email_address: data.email,
            first_name: data.givenName,
            last_name: data.familyName,
            social_strategy: "google",
            social_token: data.authentication.idToken,
          };
          this.$emit("afterLogin", $params);
        })
        .catch((error) => {
          if (error.code == 10) {
            APIinterface.notify(
              "dark",
              "Error app is not signin",
              "error",
              this.$q
            );
          } else if (error.code == -5) {
            //
          } else {
            APIinterface.notify(
              "dark",
              JSON.stringify(error),
              "error",
              this.$q
            );
          }
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
