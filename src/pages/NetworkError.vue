<template>
  <q-page class="q-pl-md q-pr-md flex flex-center">
    <div class="full-width text-center">
      <q-img
        src="network-error.png"
        fit="fill"
        spinner-color="primary"
        style="max-width: 150px"
      />
      <q-space class="q-pa-sm"></q-space>
      <div class="text-h6 text-weight-bold">
        {{ $t("We're having trouble loading") }}
      </div>
      <div class="text-grey font12">
        {{ $t("Please check your Network connectivity and try again") }}
      </div>
      <q-space class="q-pa-sm"></q-space>
      <q-btn
        @click="CheckNetwork"
        style="color: dark"
        :label="$t('Try Again')"
        no-caps
        unelevated
        rounded
        color="primary"
      />
    </div>
  </q-page>
</template>

<script>
// PWA-only: Using browser's navigator.onLine
import APIinterface from "src/api/APIinterface";

export default {
  name: "NetworkError",
  methods: {
    async CheckNetwork() {
      APIinterface.showLoadingBox("", this.$q);
      // Use browser's native online detection
      if (navigator.onLine) {
        APIinterface.hideLoadingBox(this.$q);
        this.$router.push("/home");
      } else {
        APIinterface.hideLoadingBox(this.$q);
      }
    },
  },
};
</script>
