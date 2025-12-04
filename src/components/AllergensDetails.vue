<template>
  <q-dialog
    v-model="dialog"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    position="bottom"
    @before-show="clearData"
  >
    <q-card :class="{ 'card-medium-width': !this.$q.screen.lt.md }">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-body1 text-weight-bold ellipsis">
          {{ $t("More product information") }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section style="height: calc(30vh)">
        <template v-if="loading">
          <div
            class="row q-gutter-x-sm justify-center absolute-center text-center full-width"
          >
            <q-circular-progress
              indeterminate
              rounded
              size="sm"
              color="primary"
            />
            <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
          </div>
        </template>
        <template v-else>
          <div class="text-body2 text-weight-bold q-mb-md">
            {{ $t("Allergens") }}
          </div>
          <q-list v-if="data" separator>
            <q-separator></q-separator>
            <q-item v-for="items in data" :key="items" dense>
              <q-item-section>
                <q-item-label class="text-body2">{{
                  items
                }}</q-item-label></q-item-section
              >
            </q-item>
            <q-separator></q-separator>
          </q-list>
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "AllergensDetails",
  props: ["allergens_item_id"],
  data() {
    return {
      dialog: false,
      loading: false,
      data: [],
    };
  },
  methods: {
    clearData() {
      this.data = null;
    },
    async getAllergens(item_id) {
      if (!item_id) {
        return;
      }
      this.dialog = true;
      try {
        this.loading = true;
        const response = await APIinterface.fetchDataGet(
          "getAllergenInfo",
          "item_id=" + item_id
        );
        this.data = response.details.data;
      } catch (error) {
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
