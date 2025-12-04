<template>
  <q-dialog
    v-model="dialog"
    position="standard"
    @before-show="beforeShow"
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
  >
    <q-card style="width: 80vw" class="radius10 q-pa-sm">
      <q-toolbar class="text-primary" dense>
        <q-toolbar-title
          class="text-weight-bold"
          :class="{
            'text-white': $q.dark.mode,
            'text-dark': !$q.dark.mode,
          }"
        >
          {{ data.title }}
        </q-toolbar-title>
        <q-btn
          @click="dialog = !true"
          color="white"
          square
          unelevated
          text-color="grey"
          icon="las la-times"
          dense
          no-caps
          size="sm"
          class="border-grey radius8"
        />
      </q-toolbar>
      <q-card-section class="text-center">
        <p class="text-grey">{{ data.subtitle }}</p>
      </q-card-section>
      <q-card-actions class="row">
        <q-btn
          unelevated
          no-caps
          color="disabled"
          text-color="disabled"
          class="col"
          rounded
          size="lg"
          v-close-popup
        >
          <div class="text-weight-bold text-subtitle2">
            {{ data?.cancel }}
          </div>
        </q-btn>
        <q-btn
          type="submit"
          unelevated
          no-caps
          color="amber-6"
          text-color="disabled"
          class="col"
          rounded
          size="lg"
          @click="confirm"
        >
          <div class="text-weight-bold text-subtitle2">
            {{ data?.confirm }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "ConfirmDialog",
  props: ["data"],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    beforeShow() {},
    confirm() {
      this.$emit("afterConfirm");
    },
  },
};
</script>
