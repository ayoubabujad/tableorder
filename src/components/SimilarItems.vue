<template>
  <template v-if="loading">
    <div
      class="row q-gutter-x-sm flex flex-center text-center full-width"
      style="height: calc(20vh)"
    >
      <q-circular-progress indeterminate rounded size="sm" color="primary" />
      <div class="text-subtitle1 text-grey">{{ $t("Loading") }}...</div>
    </div>
  </template>
  <template v-else>
    <template v-if="data">
      <div class="text-body1 text-weight-bold">
        {{ $t("Popular with your order") }}
      </div>
      <div class="q-mb-md text-body2">
        {{ $t("Other customer also bought these") }}
      </div>
    </template>
    <ItemsRow
      ref="ref_itemsrow"
      :data="data"
      @view-items="viewItems"
      @after-savefav="afterSavefav"
    ></ItemsRow>
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { defineAsyncComponent } from "vue";

export default {
  name: "SimilarItems",
  components: {
    ItemsRow: defineAsyncComponent(() => import("components/ItemsRow.vue")),
  },
  data() {
    return {
      data: null,
      loading: false,
    };
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { DataStorePersisted, DataStore };
  },
  mounted() {
    if (this.DataStore.data?.similar_items) {
      this.data = this.DataStore.data?.similar_items;
    } else {
      setTimeout(() => {
        this.fetchSimilarItems();
      }, 300);
    }
  },
  beforeUnmount() {
    this.DataStore.data.similar_items = this.data;
  },
  methods: {
    viewItems(value) {
      this.$emit("onItemView", value);
    },
    async fetchSimilarItems() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          page: 1,
          tag: "",
          limit: 5,
          currency_code: this.DataStorePersisted.getUseCurrency(),
        }).toString();
        const response = await APIinterface.fetchDataPost(
          "getFeaturedItems",
          params
        );
        this.data = response.details.data;
      } catch (error) {
        this.data = null;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
