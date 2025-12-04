<template>
  <q-footer
    class="bg-white footer-shadow q-pa-xs text-dark"
    v-if="CartData.hasItem"
  >
    <q-item>
      <q-item-section>
        <q-item-label class="text-weight-medium text-body1">{{
          $t("Total Price")
        }}</q-item-label>
        <q-item-label
          class="text-body2 text-weight-bold"
          :class="{
            'text-grey300': $q.dark.mode,
            'text-negative': !$q.dark.mode,
          }"
        >
          {{ CartData.getSubtotal }}</q-item-label
        >
      </q-item-section>
      <q-item-section>
        <q-btn
          v-close-popup
          unelevated
          rounded
          no-caps
          class="full-width"
          :label="$t('Checkout')"
          size="lg"
          color="primary"
          text-color="white"
          to="/checkout"
        >
        </q-btn>
      </q-item-section>
    </q-item>
  </q-footer>
</template>

<script>
import { userCartData } from "stores/CartData";

export default {
  name: "CartFooter",
  setup(props) {
    const CartData = userCartData();
    return { CartData };
  },
};
</script>
