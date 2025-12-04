<template>
  <div class="full-width text-center">
    <q-icon name="history" size="70px" color="grey-3" />
    <div class="text-weight-medium font15">
      {{ $t("No available data") }}
    </div>
    <div class="text-grey font12">
      {{ $t("pull down to refresh") }}
    </div>
  </div>
</template>

<script>
export default {
  name: "NoAvailableData",
  setup() {
    return {};
  },
};
</script>
