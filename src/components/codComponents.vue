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
        'bg-grey600': $q.dark.mode,
      }"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">
          {{ title }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2">{{ label.notes }}</div>
      </q-card-section>

      <q-separator spaced />
      <q-card-actions>
        <q-btn
          unelevated
          rounded
          color="primary"
          no-caps
          class="full-width q-mb-md"
          :label="label.submit"
          size="lg"
          :loading="loading"
          @click="onSubmit()"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "codComponents",
  props: ["title", "label", "payment_code", "payment_credentials"],
  data() {
    return {
      show_modal: false,
      data: [],
      loading: false,
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
      let merchantId = 0;
      if (
        typeof this.payment_credentials[this.payment_code] !== "undefined" &&
        this.payment_credentials[this.payment_code] !== null
      ) {
        merchantId = this.payment_credentials[this.payment_code].merchant_id;
      }
      const $data = {
        merchant_id: merchantId,
        payment_code: this.payment_code,
      };
      this.loading = true;
      APIinterface.fetchDataByTokenPost("SavedPaymentProvider", $data)
        .then((data) => {
          this.close();
          this.$emit("afterAddpayment");
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
