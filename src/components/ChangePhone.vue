<template>
  <q-dialog v-model="dialog" position="bottom" @before-hide="beforeHide">
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn flat round dense icon="close" color="dark" v-close-popup />
          <q-toolbar-title class="font16 text-dark">{{
            $t("Edit phone number")
          }}</q-toolbar-title>
        </q-toolbar>
        <div class="q-pl-md q-pr-md q-pb-md">
          <p class="font12">
            {{
              $t(
                "A 6 digit OTP will be sent via SMS to verify your mobile number"
              )
            }}
          </p>
          <q-form @submit="onSubmit">
            <q-input
              :prefix="DataStorePersisted.settings_data.phone_data.phonecode"
              v-model="phone_number"
              :label="$t('Mobile number')"
              stack-label
              mask="#########"
            :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
                (val) => val.length === 9 || this.$t('Phone number must be exactly 9 digits'),
              ]"
            />
            <div class="row q-gutter-sm">
              <div class="col-5">
                <q-btn
                  color="dark"
                  size="lg"
                  rounded
                  unelevated
                  no-caps
                  flat
                  class="full-width"
                  @click="dialog = !dialog"
                  :disable="loading"
                  >{{ $t("Cancel") }}</q-btn
                >
              </div>
              <div class="col-6">
                <q-btn
                  type="submit"
                  color="primary"
                  size="lg"
                  rounded
                  unelevated
                  no-caps
                  class="full-width"
                  :loading="loading"
                  :disabled="IsPhoneChange"
                  >{{ $t("Save") }}</q-btn
                >
              </div>
            </div>
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <TwoStepsVerification
    back_button="true"
    :message="otp_message"
    ref="verification_steps"
    :loading="loading_submit"
    @on-back="onBack"
    @after-verify="afterVerify"
  ></TwoStepsVerification>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";

export default {
  name: "ChangePhone",
  components: {
    TwoStepsVerification: defineAsyncComponent(() =>
      import("components/TwoStepsVerification.vue")
    ),
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  data() {
    return {
      loading: false,
      loading_submit: false,
      dialog: false,
      phone_number: "",
      orig_phone_number: "",
      otp_message: "",
    };
  },
  created() {
    this.getPhone();
  },
  computed: {
    IsPhoneChange() {
      if (this.phone_number != this.orig_phone_number) {
        return false;
      }
      return true;
    },
  },
  methods: {
    showModal(data) {
      this.dialog = data;
    },
    beforeHide() {},
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataByToken("RequestEmailCode")
        .then((data) => {
          this.dialog = false;
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
      this.dialog = true;
      this.$refs.verification_steps.showModal(false);
    },
    getPhone() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("getPhone")
        .then((data) => {
          this.phone_number = data.details.contact_number;
          this.orig_phone_number = data.details.contact_number;
          this.$emit("afterGetphone", data.details.contact_number_w_prefix);
        })
        .catch((error) => {
          this.phone_number = "";
          this.orig_phone_number = "";
        })
        .then((data) => {
          this.loading = false;
        });
    },
    afterVerify(code) {
      this.loading_submit = true;
      const $data = {
        code: code,
        phone_prefix:
          this.DataStorePersisted.settings_data.phone_data.phonecode,
        phone_number: this.phone_number,
        cart_uuid: APIinterface.getStorage("cart_uuid"),
      };
      APIinterface.fetchDataByTokenPost("ChangePhone", $data)
        .then((data) => {
          this.$refs.verification_steps.showModal(false);
          this.orig_phone_number = this.phone_number;
          this.$emit("afterChangephone", data.details.contact_number);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
  },
};
</script>
