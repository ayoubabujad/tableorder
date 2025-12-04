<template>
  <q-dialog
    v-model="dialog"
    position="bottom"
    @before-hide="beforeHide"
    @before-show="beforeShow"
    persistent
  >
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn
            v-if="back_button == false"
            flat
            round
            dense
            icon="close"
            color="dark"
            v-close-popup
          />
          <q-btn
            v-else
            round
            dense
            icon="arrow_back"
            unelevated
            :color="$q.dark.mode ? 'white' : 'mygrey'"
            text-color="dark"
            @click="this.$emit('onBack')"
          />
          <q-toolbar-title
            class="font16 text-darkx"
            :class="{
              'text-white': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
            >{{ $t("2-Step Verification") }}</q-toolbar-title
          >
        </q-toolbar>
        <div class="q-pl-md q-pr-md q-pb-md">
          <p class="font12">
            {{ $t("For your security, we want to make sure it's really you") }}.
          </p>

          <p
            class="text-darkx"
            :class="{
              'text-white': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
          >
            {{ messages }}
          </p>

          <q-form @submit="onSubmit">
            <OtpInput
              @update:modelValue="otp = $event"
              :inputLength="4"
            ></OtpInput>

            <div class="text-right q-pa-md">
              <ResendTimer
                ref="resend_timer"
                :loading="loader"
                :data="{
                  title: this.$t('Resend code'),
                  counter: SettingStore.settings_data.resend_counter,
                }"
                @on-resend="onResend"
              ></ResendTimer>
            </div>
            <q-space class="q-pa-xs"></q-space>

            <q-btn
              type="submit"
              unelevated
              color="primary"
              :label="$t('Submit')"
              class="radius20 fit"
              no-caps
              size="lg"
              @click="onSubmit"
              :loading="loader"
            />
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "TwoStepsVerification",
  props: ["back_button", "loading", "message"],
  components: {
    ResendTimer: defineAsyncComponent(() =>
      import("components/ResendTimer.vue")
    ),
    OtpInput: defineAsyncComponent(() => import("components/OtpInput.vue")),
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  data() {
    return {
      dialog: false,
      otp: "",
      loader: false,
      messages: "",
    };
  },
  watch: {
    loading(newval, oldval) {
      this.loader = newval;
    },
    message(newval, oldval) {
      this.messages = this.message;
    },
  },
  methods: {
    showModal(data) {
      this.dialog = data;
    },
    onResend() {
      console.log("onResend");
      this.loader = true;
      APIinterface.fetchDataByToken("RequestEmailCode")
        .then((data) => {
          this.messages = data.msg;
          this.$refs.resend_timer.startTimer();
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loader = false;
        });
    },
    beforeShow() {
      setTimeout(() => {
        this.$refs.resend_timer.startTimer();
      }, 1000);
    },
    beforeHide() {},
    onSubmit() {
      this.$emit("afterVerify", this.otp);
    },
  },
};
</script>
