<template>
  <q-dialog
    v-model="show_modal"
    persistent
    transition-show="fade"
    transition-hide="fadeout"
    :position="this.$q.screen.gt.sm ? 'standard' : 'bottom'"
    :full-width="this.$q.screen.gt.sm ? false : true"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-form @submit="onSubmit">
        <q-card-section class="q-pa-md">
          <div class="text-body2">{{ label.notes }}</div>

          <div class="column q-col-gutter-sm">
            <q-input
              :color="$q.dark.mode ? 'grey300' : 'primary'"
              v-model="credit_card_number"
              :label="$t('Card number')"
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('this field is required'),
              ]"
              mask="#### #### #### ####"
            />
          </div>

          <div class="row q-col-gutter-md">
            <div class="col">
              <q-input
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                v-model="expiry_date"
                :label="$t('Exp. date')"
                class="no-margin"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
                mask="##/##"
              />
            </div>
            <div class="col">
              <q-input
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                v-model="cvv"
                :label="$t('Security Code')"
                class="no-margin"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
                mask="####"
              />
            </div>
          </div>
          <!-- row -->

          <div class="column">
            <div class="col">
              <q-input
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                v-model="card_name"
                class="no-margin"
                :label="$t('Card name')"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
              />
            </div>
            <div class="col">
              <q-input
                :color="$q.dark.mode ? 'grey300' : 'primary'"
                v-model="billing_address"
                class="no-margin"
                :label="$t('Billing address')"
                :rules="[
                  (val) =>
                    (val && val.length > 0) ||
                    this.$t('this field is required'),
                ]"
              />
            </div>
          </div>
          <!-- row -->
        </q-card-section>

        <q-card-actions>
          <q-btn
            type="submit"
            :loading="loading"
            unelevated
            no-caps
            color="primary"
            text-color="white"
            class="full-width q-mb-md"
            size="lg"
            rounded
          >
            <div class="text-weight-bold text-body1">{{ label.submit }}</div>
          </q-btn>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "ocrComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  setup() {
    return {};
  },
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
      credit_card_number: "",
      expiry_date: "",
      cvv: "",
      card_name: "",
      billing_address: "",
    };
  },
  methods: {
    showPaymentForm() {
      this.show_modal = true;
    },
    close() {
      this.show_modal = false;
    },
    onSubmit() {
      this.loading = true;
      let merchantId = 0;
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        merchantId = this.payment_credentials[this.payment_code].merchant_id;
      }
      const $params = {
        credit_card_number: this.credit_card_number,
        expiry_date: this.expiry_date,
        cvv: this.cvv,
        card_name: this.card_name,
        billing_address: this.billing_address,
        merchant_id: merchantId,
        payment_code: this.payment_code,
      };
      APIinterface.fetchDataByTokenPost("savedCards", $params)
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
