<template>
  <q-header
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'white' : 'mygrey'"
        text-color="dark"
      />
    </q-toolbar>
  </q-header>
  <q-page padding class="text-dark flex flex-center">
    <div class="full-width q-pa-md">
      <h5 class="q-ma-none text-weight-bold">{{ $t("Verification Code") }}</h5>
      <p class="text-weight-light text-dark">
        {{ $t("Enter the code we sent you") }}!
      </p>
      <p class="text-dark">{{ message }}</p>

      <OtpInput @update:modelValue="otp = $event" :inputLength="4"></OtpInput>
      <div class="text-right q-pt-sm">
        <ResendTimer
          ref="resend_timer"
          :loading="loading"
          :data="{
            title: this.$t('Resend code'),
            counter: counter,
          }"
          @on-resend="onResend"
        ></ResendTimer>
      </div>

      <q-space class="q-pa-xl"></q-space>

      <q-btn
        color="primary"
        size="lg"
        rounded
        unelevated
        no-caps
        class="full-width"
        @click="onSubmit"
        :loading="loading"
      >
        <div class="text-weight-bold text-body1">{{ $t("Confirm") }}</div>
      </q-btn>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useAuthStore } from "src/stores/AuthStore";
import auth from "src/api/auth";

export default {
  name: "VerifyCode",
  data() {
    return {
      loading: false,
      otp: "",
      message: "",
      counter: 20,
    };
  },
  components: {
    ResendTimer: defineAsyncComponent(() =>
      import("components/ResendTimer.vue")
    ),
    OtpInput: defineAsyncComponent(() => import("components/OtpInput.vue")),
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    const AuthStore = useAuthStore();
    return { SettingStore, DataStorePersisted, AuthStore };
  },
  mounted() {
    console.log("mounted");
    this.uuid = this.$route.query.uuid;
    this.message = this.$route.query.msg;

    const code_interval =
      this.SettingStore.settings_data?.resend_counter ?? this.counter;
    this.counter = code_interval > 0 ? code_interval : 10;

    setTimeout(() => {
      if (this.$refs.resend_timer) {
        this.$refs.resend_timer.startTimer();
      }
    }, 500);
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost("verifyCodeSignup", {
        client_uuid: this.uuid,
        verification_code: this.otp,
        auto_login: 1,
      })
        .then((data) => {
          APIinterface.notify("positive", data.msg, "check_circle", this.$q);
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.AuthStore.isLogin = true;
          this.$router.push("/home");
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onResend() {
      this.loading = true;
      APIinterface.fetchDataPost("requestCode", "client_uuid=" + this.uuid)
        .then((data) => {
          this.message = data.msg;
          APIinterface.notify("positive", data.msg, "check_circle", this.$q);
          this.$refs.resend_timer.startTimer();
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
