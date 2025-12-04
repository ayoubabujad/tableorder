<template>
  <q-btn
    icon="lab la-facebook-f"
    unelevated
    :color="$q.dark.mode ? 'grey600' : 'grey-3'"
    class="rounded-borders text-grey"
    @click="Signin"
    :loading="loading"
    size="lg"
  />
</template>

<script>
// PWA-only: Facebook login requires web SDK implementation
// This is a placeholder - implement Facebook Web SDK if needed

export default {
  name: "FacebookLogin",
  props: ["app_id"],
  data() {
    return {
      loading: false,
    };
  },
  mounted() {
    // PWA: Would need to load Facebook JS SDK here
  },
  methods: {
    init() {
      console.log("Facebook login not implemented for PWA");
    },
    Signin() {
      // PWA: Implement Facebook web login flow
      this.$q.notify({
        message: "Facebook login is not available in this version",
        color: "warning",
        position: "top",
      });
    },
  },
};
</script>
