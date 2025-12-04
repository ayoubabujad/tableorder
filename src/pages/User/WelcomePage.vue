<template>
  <q-page padding class="login-page text-white flex flex-center">
    <div class="fixed-top q-pl-md q-pr-md">
      <q-toolbar>
        <q-space></q-space>
        <q-btn
          rounded
          color="primary"
          :label="$t('Skip')"
          no-caps
          unelevated
          @click="setHome"
        />
      </q-toolbar>
    </div>
    <div class="full-width q-pa-md">
      <h4 class="q-ma-none text-weight-bold">{{ $t("Welcome to") }}</h4>
      <h4 class="q-ma-none text-weight-bolder text-white">
        {{ $t("JadHub") }}
      </h4>
      <p class="text-weight-light">
        {{ $t("Your favorite foods delivered fast at your door") }}
      </p>
    </div>
    <div class="fixed-bottom q-pa-xl q-gutter-md">
      <q-btn
        color="primary"
        size="lg"
        rounded
        unelevated
        no-caps
        class="full-width"
        to="user/login"
        >{{ $t("Login") }}</q-btn
      >
      <q-btn
        color="white"
        outline
        rounded
        unelevated
        no-caps
        class="full-width"
        size="lg"
        to="user/signup"
        >{{ $t("Sign up") }}</q-btn
      >
    </div>
  </q-page>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "WelcomePage",
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  methods: {
    setHome() {
      this.DataStorePersisted.skip_home = true;
      this.$router.push("/home");
    },
  },
};
</script>
