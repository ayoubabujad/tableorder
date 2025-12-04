<template>
  <q-header reveal>
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Delete account")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md q-gutter-y-md">
    <div class="text-weight-medium text-body2 line-normal">
      {{
        $t(
          "You are requesting to have your account deleted and personal information removed"
        )
      }}.
    </div>
    <div class="'text-body2 text-weight-medium">
      {{
        $t(
          "You will permanently lose all your orders, reviews,favorites and profile information, there is no turning back"
        )
      }}.
    </div>
    <q-footer class="q-pa-md footer-shadow bg-white">
      <q-btn
        type="submit"
        color="primary"
        text-color="white"
        unelevated
        class="full-width"
        size="lg"
        no-caps
        rounded
        @click="RequestEmailCode"
        :loading="loading"
      >
        <div class="text-subtitle2 text-weight-bold">
          {{ $t("Confirm Deletion") }}
        </div>
      </q-btn>
    </q-footer>

    <TwoStepsVerification
      back_button="false"
      :message="otp_message"
      ref="verification_steps"
      :loading="loading"
      @on-back="onBack"
      @after-verify="afterVerify"
    ></TwoStepsVerification>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "RequestDeleteaccount",
  components: {
    TwoStepsVerification: defineAsyncComponent(() =>
      import("components/TwoStepsVerification.vue")
    ),
  },
  data() {
    return {
      otp_message: "",
      loading: false,
    };
  },
  methods: {
    RequestEmailCode() {
      this.loading = true;
      APIinterface.fetchDataByToken("RequestEmailCode")
        .then((data) => {
          this.otp_message = data.msg;
          this.$refs.verification_steps.showModal(true);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onBack() {
      this.$refs.verification_steps.showModal(false);
    },
    afterVerify(code) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("deleteAccount", "code=" + code)
        .then((data) => {
          //this.$refs.verification_steps.showModal(false);
          this.$router.replace("/account/deletety");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
