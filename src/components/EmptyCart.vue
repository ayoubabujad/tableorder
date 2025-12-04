<template>
  <div class="ht-empty-state">
    <div class="ht-empty-icon">
      <q-icon name="o_shopping_bag" size="48px" />
    </div>
    <div class="ht-empty-title">
      {{ $t("Your cart is empty") }}
    </div>
    <div class="ht-empty-subtitle q-mb-lg">
      {{ $t("pull down to refresh") }}
    </div>
    <q-btn
      size="lg"
      rounded
      unelevated
      no-caps
      class="ht-btn-primary q-px-xl"
      to="/home"
    >
      {{ $t("Start ordering") }}
    </q-btn>
  </div>
</template>

<script>
export default {
  name: "EmptyCart",
  setup() {
    return {};
  },
};
</script>
