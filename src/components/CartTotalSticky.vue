<template>
  <q-btn
    round
    :color="$q.dark.mode ? 'grey600' : 'primary'"
    icon="shopping_bag"
    to="/cart"
  >
    <q-badge color="red-5" rounded floating> 0 </q-badge>
  </q-btn>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { userCartData } from "stores/CartData";

export default {
  name: "CartTotalSticky",
  props: ["morphGroupModel"],

  setup() {
    const CartData = userCartData();
    return { CartData };
  },
};
</script>
