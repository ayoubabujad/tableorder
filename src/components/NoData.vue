<template>
  <div
    class="column items-center justify-center text-center full-width q-pa-md"
    :class="{ 'absolute-center': isCenter, 'q-pt-xl': !isCenter }"
  >
    <img :src="icon" class="q-mb-sm" style="max-height: 60px; height: 50px" />
    <div class="text-body1 text-dark text-weight-bold">
      {{ $t(message) }}
    </div>
    <div class="text-body2 text-grey">
      {{ $t(subtitle) }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  isCenter: {
    type: Boolean,
    default: true,
  },
  message: {
    type: String,
    default: "No data available",
  },
  subtitle: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "/svg/no-data.svg",
  },
});
</script>
