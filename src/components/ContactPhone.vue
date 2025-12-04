<template>
  <div
    class="radius10 q-mb-sm"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'bg-mygrey ': !$q.dark.mode,
    }"
  >
    <q-item clickable>
      <q-item-section avatar class="item-column-less">
        <q-avatar
          color="primary"
          text-color="white"
          icon="phone_iphone"
          size="md"
        />
      </q-item-section>
      <q-item-section>
        <q-item-label caption>{{ $t("Contact Phone") }} </q-item-label>
        <q-item-label> +63999343401</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
export default {
  name: "ContactPhone",
  setup() {
    return {};
  },
};
</script>
