<template>
  <!-- 🎨 Theme Header -->
  <q-header class="ht-header">
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        class="ht-btn-ghost"
      />
      <q-toolbar-title class="text-weight-bold text-white">{{
        $t("Change password")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="ht-page q-pa-md">
    <q-form @submit="onSubmit">
      <q-input
        v-model="old_password"
        :label="$t('Old password')"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      />

      <q-input
        v-model="new_password"
        :label="$t('New password')"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      />

      <q-input
        v-model="confirm_password"
        :label="$t('Confirm password')"
        stack-label
        :rules="[
          (val) => (val && val.length > 0) || this.$t('This field is required'),
        ]"
      />

      <q-space class="q-pa-sm"></q-space>

      <!-- 💾 Theme Footer -->
      <q-footer class="ht-footer q-pa-md">
        <q-btn
          type="submit"
          size="lg"
          rounded
          unelevated
          no-caps
          class="fit ht-btn-primary"
          :loading="loading"
          >{{ $t("Save") }}</q-btn
        >
      </q-footer>
    </q-form>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ChangePassword",
  data() {
    return {
      loading: false,
      old_password: "",
      new_password: "",
      confirm_password: "",
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByToken("updatePassword", {
        old_password: this.old_password,
        new_password: this.new_password,
        confirm_password: this.confirm_password,
      })
        .then((data) => {
          APIinterface.notify("positive", data.msg, "check_circle", this.$q);
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
