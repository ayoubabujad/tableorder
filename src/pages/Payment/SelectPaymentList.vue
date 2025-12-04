<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header
      class="bg-whitex"
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
        <q-toolbar-title class="text-weight-bold text-darkx">{{
          $t("New Payment")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="q-pa-md"
      :class="{
        'flex flex-center':
          !UserStore.hasPaymentMethods && !UserStore.loading_payment,
        'bg-mydark text-white': $q.dark.mode,
        'bg-white text-dark': !$q.dark.mode,
      }"
    >
      <template v-if="UserStore.loading_payment">
        <q-inner-loading
          :showing="true"
          :color="$q.dark.mode ? 'grey300' : 'primary'"
        />
      </template>
      <template v-else>
        <template v-if="UserStore.hasPaymentMethods">
          <q-list>
            <template v-for="items in UserStore.payment_data.data" :key="items">
              <q-item
                class="bg-mygreyx radius10 q-mb-sm"
                :class="{
                  'bg-grey600 text-grey300': $q.dark.mode,
                  'bg-mygrey ': !$q.dark.mode,
                }"
                clickable
                tag="label"
                @click="onchoosePayment(items)"
              >
                <q-item-section avatar>
                  <q-icon
                    v-if="items.logo_type == 'icon'"
                    name="las la-credit-card"
                    size="md"
                    color="grey-4"
                  ></q-icon>
                  <q-img v-else :src="items.logo_image"> </q-img>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ items.payment_name }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </template>
        <template v-else>
          <div class="text-center">
            <q-icon name="history" size="70px" color="grey-3" />
            <div class="text-weight-medium font15">
              {{ $t("No available payment methods") }}
            </div>
            <div class="text-grey font12">
              {{ $t("pull down to refresh") }}
            </div>
          </div>
        </template>
      </template>
    </q-page>
  </q-pull-to-refresh>

  <!-- PAYMENTS COMPONENTS -->
  <codComponents
    ref="cod"
    payment_code="cod"
    :title="$t('Add Cash On delivery')"
    :label="{
      submit: this.$t('Add Cash'),
      notes: this.$t(
        'Cash on Delivery or COD is a payment method that allows pay for the items you have ordered only when it gets delivered.'
      ),
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <ocrComponents
    ref="ocr"
    payment_code="ocr"
    :title="$t('Add Credit card')"
    :label="{
      submit: $t('Add Card'),
      notes: '',
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <StripeComponents
    ref="stripe"
    payment_code="stripe"
    :title="$t('Add Stripe')"
    :label="{
      submit: this.$t('Add Stripe'),
      notes: this.$t('Add your card account'),
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <PaypalComponents
    ref="paypal"
    payment_code="paypal"
    :title="$t('Add Paypal')"
    :label="{
      submit: this.$t('Add Paypal'),
      notes: this.$t('Pay using your paypal account'),
      payment_title: this.$t('Pay using Paypal'),
      payment_subtitle: this.$t(
        'You will re-direct to paypal account to login to your account.'
      ),
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <RazorpayComponents
    ref="razorpay"
    payment_code="razorpay"
    :title="$t('Add Razorpay')"
    :label="{
      submit: this.$t('Submit'),
      notes: this.$t('Pay using your Razorpay account'),
    }"
    :payment_credentials="UserStore.payment_data.credentials"
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
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <BankComponents
    ref="bank"
    payment_code="bank"
    :title="$t('Add Bank Transfer')"
    :label="{
      submit: this.$t('Add Payment'),
      notes: this.$t('Pay using bank Transfer'),
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <PaydeliveryComponents
    ref="paydelivery"
    payment_code="paydelivery"
    :title="$t('Add Payment')"
    :label="{
      submit: this.$t('Saved'),
      notes: this.$t('Pay using different card'),
    }"
    :payment_credentials="payment_credentials"
    @after-addpayment="afterAddpayment"
  >
  </PaydeliveryComponents>

  <!-- CUSTOM PAYMENT -->

  <StripehostedComponents
    ref="stripehosted"
    payment_code="stripehosted"
    :title="$t('Add Stripe payment')"
    :label="{
      submit: this.$t('Add Stripe'),
      notes: '',
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <MyfatoorahComponents
    ref="myfatoorah"
    payment_code="myfatoorah"
    :title="$t('Add Myfatoorah payment')"
    :label="{
      submit: this.$t('Submit'),
      notes: '',
    }"
    :payment_credentials="UserStore.payment_data.credentials"
    @after-addpayment="afterAddpayment"
  />

  <!-- PAYMENTS COMPONENTS -->
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useUserStore } from "stores/UserStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SelectPaymentList",
  data() {
    return {
      as_default: "",
    };
  },
  components: {
    codComponents: defineAsyncComponent(() =>
      import("components/codComponents.vue")
    ),
    ocrComponents: defineAsyncComponent(() =>
      import("components/ocrComponents.vue")
    ),
    StripeComponents: defineAsyncComponent(() =>
      import("components/StripeComponents.vue")
    ),
    PaypalComponents: defineAsyncComponent(() =>
      import("components/PaypalComponents.vue")
    ),
    RazorpayComponents: defineAsyncComponent(() =>
      import("components/RazorpayComponents.vue")
    ),
    MercadopagoComponents: defineAsyncComponent(() =>
      import("components/MercadopagoComponents.vue")
    ),
    BankComponents: defineAsyncComponent(() =>
      import("components/BankComponents.vue")
    ),
    PaydeliveryComponents: defineAsyncComponent(() =>
      import("components/PaydeliveryComponents.vue")
    ),
    // CUSTOM PAYMENT
    StripehostedComponents: defineAsyncComponent(() =>
      import("components/StripehostedComponents.vue")
    ),
    MyfatoorahComponents: defineAsyncComponent(() =>
      import("components/MyfatoorahComponents.vue")
    ),
  },
  setup(props) {
    const UserStore = useUserStore();
    return { UserStore };
  },
  created() {
    this.UserStore.PaymentList();
  },
  methods: {
    refresh(done) {
      this.UserStore.PaymentList(done);
    },
    onchoosePayment(data) {
      try {
        this.$refs[data.payment_code].showPaymentForm();
      } catch (error) {
        console.log(data.payment_code);
        APIinterface.notify("dark", error, "error_outline", this.$q);
      }
    },
    afterAddpayment() {
      let redirect = this.$route.query.redirect;
      if (!APIinterface.empty(redirect)) {
        this.$router.replace(redirect);
      } else {
        this.$router.back();
      }
    },
  },
};
</script>
