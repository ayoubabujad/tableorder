<template>
  <template v-if="counter === 0">
    <q-btn
      flat
      no-caps
      color="primary"
      class="q-pr-none q-pl-none"
      @click="this.$emit('onResend')"
      :loading="loading"
      >{{ data.title }}</q-btn
    >
  </template>
  <template v-else>
    <u>{{ $t("Resend code") }} {{ counter }}</u>
  </template>
</template>

<script>
export default {
  name: "ResendTimer",
  props: ["data", "loading"],
  data() {
    return {
      maxCounter: this.data.counter,
      counter: this.data.counter,
      timer: undefined,
    };
  },
  created() {},
  watch: {
    counter(newval, oldval) {
      if (newval <= 0) {
        this.stopTimer();
      }
    },
  },
  beforeUnmount() {
    this.stopTimer();
  },
  methods: {
    stopTimer() {
      clearInterval(this.timer);
    },
    startTimer() {
      this.stopTimer();
      this.counter = this.maxCounter;
      this.timer = setInterval(() => {
        this.counter--;
      }, 1000);
    },
  },
};
</script>
