<template>
  <div
    ref="lottieContainer"
    style="height: 80px"
    class="full-width"
    :style="style"
  ></div>
</template>

<script>
import lottie from "lottie-web";
import failed from "src/assets/failed.json";
import received from "src/assets/received.json";
import preparing from "src/assets/customize.json";
import delivering from "src/assets/delivering.json";
import completed from "src/assets/completed.json";
import pickup from "src/assets/pickup.json";
import discover from "src/assets/discover.json";
import fasterdelivery from "src/assets/fasterdelivery.json";

export default {
  name: "OrderStatusAnimation",
  props: {
    status: {
      type: String,
      required: true,
    },
    style: null,
  },
  data() {
    return {
      lottieInstance: null,
    };
  },
  computed: {
    animationData() {
      const map = {
        failed,
        received,
        preparing,
        delivering,
        completed,
        pickup,
        discover,
        fasterdelivery,
      };
      return map[this.status] || received;
    },
  },
  watch: {
    animationData: "loadAnimation",
  },
  mounted() {
    this.loadAnimation();
  },
  methods: {
    loadAnimation() {
      if (this.lottieInstance) {
        this.lottieInstance.destroy();
      }

      // Don't load animation if status is empty
      if (!this.status || this.status === "") {
        return;
      }

      // Small delay ensures container is rendered
      setTimeout(() => {
        this.lottieInstance = lottie.loadAnimation({
          container: this.$refs.lottieContainer,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: this.animationData,
        });
      }, 200);
    },
  },
};
</script>
