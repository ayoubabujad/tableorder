<template>
  <q-list
    v-if="!loading && !isWalletFullPayment"
    bordered
    dense
    class="rounded-borders q-pt-xs q-pb-xs q-mb-sm"
  >
    <q-item
      clickable
      :to="{
        path: '/account/payment-methods',
        query: { redirect: this.redirect },
      }"
    >
      <q-item-section avatar class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="add_card"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ $t("Payment method") }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-btn
          round
          color="yellow-9"
          icon="edit"
          flat
          size="sm"
          :to="{
            path: '/account/payment-methods',
            query: { redirect: this.redirect },
          }"
        />
      </q-item-section>
    </q-item>
    <template v-if="loading">
      <q-item>
        <q-item-section>
          <q-skeleton recttype="type" class="bg-mygrey" />
        </q-item-section>
      </q-item>
    </template>
    <template v-else>
      <q-item class="q-mt-sm">
        <template v-if="hasData">
          <q-item-section avatar class="item-column-less" top>
            <q-avatar square size="sm">
              <template v-if="data.logo_type == 'icon'">
                <q-icon name="payment" size="sm"></q-icon>
              </template>
              <template v-else>
                <img :src="data.logo_url" />
              </template>
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ data.attr1 }}</q-item-label>
            <q-item-label caption>{{ data.attr2 }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-item-label>
              <template v-if="usePartialPayment">
                <span class="text-negative">{{ getPayRemaining }}</span>
              </template>
              <template v-else>
                {{ cart_total.value }}
              </template>
            </q-item-label>
          </q-item-section>
        </template>
        <template v-else>
          <q-item-section>
            <q-btn
              color="yellow-9"
              flat
              :label="$t('Add new payment')"
              no-caps
              :to="{
                path: '/account/payment-methods',
                query: { redirect: this.redirect },
              }"
            />
          </q-item-section>
        </template>
      </q-item>

      <div
        v-if="data.payment_code == 'cod' && !isWalletFullPayment"
        class="q-pl-md q-pr-md q-pt-sm"
      >
      </div>
    </template>
  </q-list>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { userCartData } from "stores/CartData";

export default {
  name: "PaymentMethod",
  props: ["cart_total", "redirect", "wallet_data"],
  data() {
    return {
      loading: false,
      data: [],
    };
  },
  setup() {
    const CartData = userCartData();
    return { CartData };
  },
  mounted() {
    this.defaultPaymentMethod();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
    isWalletFullPayment() {
      if (Object.keys(this.wallet_data).length > 0) {
        if (
          this.wallet_data.use_wallet &&
          this.wallet_data.amount_due_raw <= 0
        ) {
          return true;
        }
      }
      return false;
    },
    usePartialPayment() {
      if (Object.keys(this.wallet_data).length > 0) {
        if (
          this.wallet_data.use_wallet &&
          this.wallet_data.amount_due_raw > 0
        ) {
          return true;
        }
      }
      return false;
    },
    getPayRemaining() {
      if (Object.keys(this.wallet_data).length > 0) {
        if (this.wallet_data.use_wallet) {
          return this.wallet_data.amount_due;
        }
      }
      return false;
    },
  },
  methods: {
    defaultPaymentMethod() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost("defaultPaymentMethod", {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
      })
        .then((data) => {
          this.data = data.details.data;
          this.$emit("setPaymentmethod", data.details);
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
