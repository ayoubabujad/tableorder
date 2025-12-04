<template>
  <div class="row q-col-gutter-md q-pa-sm">
    <div v-for="items_id in data" :key="items_id" class="col-6">
      <q-card
        flat
        bordered
        class="radius15 q-pa-sm cursor-pointer full-height"
        :class="{
          'bg-grey600': $q.dark.mode,
          'bg-white': !$q.dark.mode,
          disabled: !itemAvailable(items_id, cat_id),
        }"
        @click.stop="
          itemAvailable(items_id, cat_id)
            ? $emit('viewItems', {
                item_uuid: data_items[items_id].item_uuid,
                cat_id: cat_id,
              })
            : false
        "
      >
        <!-- IMAGE -->
        <q-img
          :src="data_items[items_id].url_image"
          ratio="1"
          class="radius10"
          loading="lazy"
          fit="cover"
          spinner-color="primary"
        >
          <template v-slot:loading>
            <q-skeleton square height="100%" />
          </template>
        </q-img>

        <!-- ITEM NAME -->
        <div class="text-weight-bold text-body1 ellipsis-2-lines q-mt-sm">
          {{ data_items[items_id].item_name }}
        </div>

        <!-- DESCRIPTION -->
        <div class="text-caption text-grey ellipsis-2-lines q-mt-xs">
          {{ data_items[items_id].item_description }}
        </div>

        <!-- PRICE -->
        <div class="text-weight-bold text-subtitle1 q-mt-sm">
          <template v-if="data_items[items_id].price[0]?.discount > 0">
            <span class="text-strike text-red">
              {{ data_items[items_id].price[0].pretty_price }}
            </span>
            {{ data_items[items_id].price[0].pretty_price_after_discount }}
          </template>

          <template v-else>
            {{ data_items[items_id].price[0]?.pretty_price }}
          </template>
        </div>

        <!-- ADD BUTTON -->
        <div class="q-mt-sm flex justify-end">
          <q-btn
            round
            color="primary"
            size="sm"
            icon="add"
            unelevated
            :disable="!itemAvailable(items_id, cat_id)"
            @click.stop="
              $emit('viewItems', {
                item_uuid: data_items[items_id].item_uuid,
                cat_id: cat_id,
              })
            "
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { userCartData } from "stores/CartData";

export default {
  name: "ItemsdisplayList",
  props: ["loading", "data", "data_items", "cat_id", "dish"],
  setup() {
    const CartData = userCartData();
    return { CartData };
  },
  methods: {
    PrintPrice(data) {
      if (data[0]) {
        if (data[0].discount > 0) {
          return data[0].pretty_price_after_discount;
        }
        return data[0].pretty_price;
      }
    },
    printSize(data) {
      if (data[0]) return data[0].size_name;
    },
    showAllergens(item_id) {
      this.$emit("showAllergens", item_id);
    },
    itemAvailable(item_id, cat_id) {
      if (!this.CartData.items_not_available.includes(parseInt(item_id))) {
        if (!this.CartData.category_not_available.includes(parseInt(cat_id))) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>

<style scoped>
.radius15 {
  border-radius: 15px;
}
.radius10 {
  border-radius: 10px;
}
.disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
