<template>
  <q-btn
    @click="share"
    color="primary"
    icon="share"
    size="sm"
    outline
    round
  />
</template>

<script>
// PWA-only: Using Web Share API

export default {
  name: "ShareComponents",
  props: ["title", "text", "url", "dialogTitle"],
  methods: {
    async share() {
      // Use Web Share API if available
      if (navigator.share) {
        try {
          await navigator.share({
            title: this.title,
            text: this.text,
            url: this.url,
          });
        } catch (error) {
          // User cancelled or error
          console.log("Share cancelled or failed:", error);
        }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(this.url || window.location.href);
          this.$q.notify({
            message: "Link copied to clipboard",
            color: "positive",
            position: "top",
          });
        } catch (error) {
          console.log("Copy failed:", error);
        }
      }
    },
  },
};
</script>
