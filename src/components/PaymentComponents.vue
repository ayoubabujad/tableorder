<template>
  <!-- PAYMENTS COMPONENTS -->
  <PaydeliveryComponents
    ref="paydelivery"
    payment_code="paydelivery"
    :title="$t('Add Payment')"
    :label="{
      submit: this.$t('Saved'),
      notes: this.$t('Pay using different card'),
    }"
    :payment_credentials="payment_credentials['paydelivery'] ?? null"
    @after-addpayment="afterAddpayment"
  >
  </PaydeliveryComponents>

  <ocrComponents
    ref="ocr"
    payment_code="ocr"
    :title="$t('Add Credit card')"
    :label="{
      submit: $t('Add Card'),
      notes: '',
    }"
    :payment_credentials="payment_credentials['ocr'] ?? null"
    @after-addpayment="afterAddpayment"
  />

  <MercadopagoComponents
    ref="mercadopago"
    payment_code="mercadopago"
    :title="$t('Add Mercadopago')"
    :label="{
      submit: this.$t('Add Mercadopago'),
      notes: this.$t('Pay using your mercadopago account'),
    }"
    :payment_credentials="payment_credentials['mercadopago'] ?? null"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />

  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Add Stripe')"
    :label="{
      submit: this.$t('Add Stripe'),
      notes: this.$t('Add your card account'),
    }"
    :payment_credentials="payment_credentials['stripe'] ?? null"
    @after-addpayment="afterAddpayment"
    @after-successfulpayment="afterSuccessfulpayment"
  />
  <!-- END PAYMENTS COMPONENTS -->

  <!-- CUSTOM PAYMENT -->
  <!-- your custom payment goes here -->
  <!-- CUSTOM PAYMENT -->
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "PaymentComponents",
  props: ["payment_credentials"],
  components: {
    PaydeliveryComponents: defineAsyncComponent(() =>
      import("components/PaydeliveryComponents.vue")
    ),
    ocrComponents: defineAsyncComponent(() =>
      import("components/ocrComponents.vue")
    ),
    MercadopagoComponents: defineAsyncComponent(() =>
      import("components/MercadopagoComponents.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
  },
  setup() {
    return {};
  },
  methods: {
    onSelectPayment(value) {
      try {
        this.$refs[value?.payment_code].showPaymentForm(value?.credentials);
      } catch (error) {
        this.addPayment(value);
      }
    },
    async addPayment(value) {
      try {
        APIinterface.showLoadingBox("", this.$q);
        await APIinterface.fetchDataByToken("SavedPaymentProvider", {
          merchant_id: value?.credentials?.merchant_id,
          payment_code: value.payment_code,
        });
        this.modal = false;
        this.$emit("afterAddpayment");
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
    doPayment(data) {
      try {
        this.$refs[data.payment_code].PaymentRender(data);
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    doPayments(data) {
      try {
        this.$refs[data.payment_code].Dopayment(data.data, data);
      } catch (error) {
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    afterAddpayment() {
      this.$emit("afterAddpayment");
    },
    afterSuccessfulpayment(data) {
      this.$emit("afterSuccessfulpayment", data);
    },
  },
};
</script>
