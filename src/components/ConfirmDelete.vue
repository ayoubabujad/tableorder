<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
    full-width
    persistent
  >
    <q-card>
      <q-card-section>
        <div class="text-h6 text-weight-bold q-pb-md">
          {{ data?.confirm || $t("Do you want to delete the address?") }}
        </div>
        <q-separator></q-separator>

        <q-list class="myqlist">
          <q-item class="q-pl-none q-pr-none">
            <q-item-section avatar>
              <q-avatar
                :icon="data?.icon || 'eva-question-mark-circle-outline'"
                color="grey-2"
                text-color="blue-grey-6"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label> {{ data?.title || "" }} </q-item-label>
              <q-item-label caption> {{ data?.subtitle || "" }} </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions class="row q-gutter-x-md">
        <q-btn
          no-caps
          unelevated
          color="red-2"
          text-color="red-9"
          size="lg"
          rounded
          class="col"
          @click="this.$emit('afterConfirm', this.data)"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ data?.yes || $t("Remove") }}
          </div>
        </q-btn>

        <q-btn
          no-caps
          unelevated
          color="positive"
          text-color="white"
          size="lg"
          rounded
          class="col"
          @click="modal = false"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ data?.cancel || $t("Keep") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "ConfirmDelete",
  emits: ["afterConfirm"],
  data() {
    return {
      modal: false,
      id: null,
    };
  },
  setup() {
    return {};
  },
  methods: {
    ConfirmDelete(value) {
      this.data = value;
      this.modal = true;
    },
  },
};
</script>
