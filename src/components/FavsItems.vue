<template>
  <template v-if="active">
    <q-btn
      @click.stop="addTofav()"
      :color="$q.dark.mode ? 'grey300' : 'blue'"
      icon="favorite_border"
      size="sm"
      round
      :loading="loading"
      unelevated
      padding="5px"
      class="myshadow"
    />
  </template>
  <template v-else>
    <q-btn
      @click.stop="addTofav()"
      color="grey-4"
      text-color="grey-7"
      icon="favorite_border"
      size="md"
      flat
      round
      :loading="loading"
      unelevated
      padding="0"
    />
  </template>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "src/stores/DataStore";

export default {
  name: "FavsItems",
  props: ["item_token", "cat_id", "active", "data"],
  setup() {
    const DataStore = useDataStore();
    return { DataStore };
  },
  data() {
    return {
      loading: false,
    };
  },
  methods: {
    addTofav() {
      if (auth.authenticated()) {
        this.loading = true;
        let $params =
          "item_token=" + this.item_token + "&cat_id=" + this.cat_id;
        APIinterface.fetchDataByTokenPost("addTofav", $params)
          .then((data) => {
            this.DataStore.cleanData("favList");

            this.$emit("afterSavefav", this.data, data.details.found);
          })
          .catch((error) => {
            APIinterface.notify("negative", error, "error_outline", this.$q);
          })
          .then((data) => {
            this.loading = false;
          });
      } else {
        APIinterface.notify(
          "negative",
          this.$t("You need to login to save this to your favorites items"),
          "error_outline",
          this.$q
        );
      }
    },
  },
};
</script>
