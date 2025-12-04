<template>
  <q-dialog
    v-model="modal"
    persistent
    no-esc-dismiss
    seamless
    class="loader-dialog"
  >
    <q-inner-loading :showing="true" color="yellow-9" />
  </q-dialog>
</template>

<script>
export default {
  name: "LoaderDialog",
  data() {
    return {
      modal: false,
    };
  },
};
</script>
