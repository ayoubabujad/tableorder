<template>
  <q-header class="bg-white" reveal>
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
      <h5 class="q-ma-none text-weight-bold">{{ $t("Reset Password") }}</h5>
      <p class="text-weight-light text-dark">
        {{ $t("Enter a new password") }}!
      </p>
      <p class="text-dark">{{ message }}</p>
      <q-form @submit="onSubmit">
        <q-input
          v-model="otp"
          :label="$t('Enter OTP code')"
          stack-label
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        />

        <q-input
          v-model="newpassword"
          :type="field_type"
          :label="$t('Password')"
          stack-label
          color="grey-5"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
          <template v-slot:append>
            <q-icon
              @click="
                this.field_type =
                  this.field_type == 'password' ? 'text' : 'password'
              "
              :name="password_icon"
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <q-input
          v-model="confirmpassword"
          :type="field_type2"
          :label="$t('Confirm password')"
          stack-label
          color="grey-5"
          :rules="[
            (val) =>
              (val && val.length > 0) || this.$t('This field is required'),
          ]"
        >
          <template v-slot:append>
            <q-icon
              @click="
                this.field_type2 =
                  this.field_type2 == 'password' ? 'text' : 'password'
              "
              :name="password_icon2"
              color="grey"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <div class="text-right">
          <ResendTimer
            ref="resend_timer"
            :loading="loading"
            :data="{
              title: this.$t('Resend code'),
              counter: resend_counter,
            }"
            @on-resend="onResend"
          ></ResendTimer>
        </div>

        <q-space class="q-pa-md"></q-space>
        <q-btn
          type="submit"
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="full-width"
          :loading="loading"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ $t("Reset Password") }}
          </div>
        </q-btn>
      </q-form>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import auth from "src/api/auth";
import { useSettingStore } from "src/stores/SettingStore";

export default {
  name: "ResetPassword",
  components: {
    ResendTimer: defineAsyncComponent(() =>
      import("components/ResendTimer.vue")
    ),
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  data() {
    return {
      loading: false,
      otp: "",
      newpassword: "",
      confirmpassword: "",
      field_type: "password",
      field_type2: "password",
      password_icon: "las la-low-vision",
      password_icon2: "las la-low-vision",
      uuid: "",
      message: "",
      resend_counter: this.SettingStore.settings_data?.resend_counter ?? 20,
    };
  },
  mounted() {
    this.message = this.$route.query.msg;
    this.uuid = this.$route.query.uuid;
    setTimeout(() => {
      this.$refs.resend_timer.startTimer();
    }, 1000);
  },
  watch: {
    field_type(newval, oldval) {
      this.password_icon =
        newval == "password" ? "las la-low-vision" : "las la-eye";
    },
    field_type2(newval, oldval) {
      this.password_icon2 =
        newval == "password" ? "las la-low-vision" : "las la-eye";
    },
  },
  methods: {
    onResend() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "resendResetEmail",
        "customer_uuid=" + this.uuid
      )
        .then((data) => {
          this.message = data.msg;
          APIinterface.notify(
            "positive",
            this.message,
            "check_circle",
            this.$q
          );
          this.$refs.resend_timer.startTimer();
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      this.loading = true;
      let params = "uuid=" + this.uuid;
      params += "&otp=" + this.otp;
      params += "&newpassword=" + this.newpassword;
      params += "&confirmpassword=" + this.confirmpassword;
      APIinterface.fetchDataPost("resetPassword", params)
        .then((data) => {
          this.message = data.msg;
          APIinterface.notify(
            this.$q.dark.mode ? "grey600" : "lightgreen",
            data.msg,
            "check_circle",
            this.$q
          );
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.$router.push("/home");
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
