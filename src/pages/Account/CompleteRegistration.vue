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
      <q-toolbar-title class="text-weight-bold text-dark">{{
        $t("Compelete registration")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page
    class="q-pa-md"
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-form @submit="obSubmit" autocomplete="off">
      <div class="text-weight-medium text-body2">
        {{ $t("Fill your information") }}
      </div>

      <q-input
        v-model="first_name"
        :label="$t('First name')"
        :rules="[
          (val) => (val && val.length > 0) || $t('This field is required'),
        ]"
      />

      <q-input
        v-model="last_name"
        :label="$t('Last name')"
        :rules="[
          (val) => (val && val.length > 0) || $t('This field is required'),
        ]"
      />

      <q-input
        v-model="email_address"
        :label="$t('Email')"
        disable
        :rules="[
          (val) => (val && val.length > 0) || $t('This field is required'),
        ]"
      />

      <template v-if="page_ready">
        <q-input
          v-model="mobile_number"
          :label="$t('Mobile number')"
          mask="##################"
          :prefix="SettingStore.settings_data.phone_data.phonecode"
          :rules="[
            (val) => (val && val.length > 0) || $t('This field is required'),
            (val) => val.length <= 15 || $t('Please use maximum 15 characters'),
          ]"
        />
      </template>

      <q-input
        type="password"
        v-model="password"
        :label="$t('Password')"
        :rules="[
          (val) => (val && val.length > 0) || $t('This field is required'),
          isValidPassword,
        ]"
      />
      <q-input
        type="password"
        v-model="cpassword"
        :label="$t('Confirm password')"
        :rules="[
          (val) => (val && val.length > 0) || $t('This field is required'),
          isValidPassword,
        ]"
      />

      <q-footer
        class="bg-whitex q-pa-md border-top"
        :class="{
          'bg-mydark text-white': $q.dark.mode,
          'bg-white text-dark': !$q.dark.mode,
        }"
      >
        <q-btn
          type="submit"
          color="primary"
          size="lg"
          rounded
          unelevated
          no-caps
          class="full-width"
          :loading="loading_submit"
          :label="$t('Submit')"
        ></q-btn>
      </q-footer>
    </q-form>

    <q-inner-loading
      :showing="loading"
      :color="$q.dark.mode ? 'grey300' : 'primary'"
    />
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import auth from "src/api/auth";

export default {
  name: "CompleteRegistration",
  data() {
    return {
      loading: false,
      loading_submit: false,
      mobile_prefix: "",
      settings: [],
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      password: "",
      cpassword: "",
      page_ready: false,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.getCustomerInfo();
      this.page_ready = true;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.getCustomerInfo();
          this.page_ready = true;
        }
      );
    }
  },
  methods: {
    isValidPassword() {
      if (this.password === this.cpassword) {
        return true;
      }
      return this.$t("Confirm password does not match with password");
    },
    getCustomerInfo() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "getCustomerInfo",
        "client_uuid=" + this.$route.query.uuid
      )
        .then((data) => {
          this.first_name = data.details.firstname;
          this.last_name = data.details.lastname;
          this.email_address = data.details.email_address;
          this.settings = data.details.options;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    obSubmit() {
      this.loading_submit = true;
      const params = {
        local_id: APIinterface.getStorage("local_id"),
        client_uuid: this.$route.query.uuid,
        firstname: this.first_name,
        lastname: this.last_name,
        mobile_prefix: this.mobile_prefix,
        mobile_number: this.mobile_number,
        password: this.password,
        cpassword: this.cpassword,
      };
      APIinterface.fetchDataPost("completeSocialSignup", params)
        .then((data) => {
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.DataStorePersisted.user_settings = data.details.user_settings;
          this.$router.push("/home");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
    //
  },
};
</script>
