<template>
  <swiper
    :slidesPerView="1.6"
    :grid="{
      rows: 2,
      fill: 'row',
    }"
    :spaceBetween="10"
    :pagination="{
      clickable: true,
    }"
    :modules="modules"
    class="mySwiper"
  >
    <template v-for="items_id in data" :key="items_id">
      <swiper-slide
        v-if="data_items[items_id]"
        :class="{
          'bg-dark ': $q.dark.mode,
          'bg-white ': !$q.dark.mode,
        }"
      >
        <div
          class="radius20"
          :class="{
            'bg-grey600 ': $q.dark.mode,
            'bg-mygrey ': !$q.dark.mode,
            disabled: !itemAvailable(items_id, cat_id),
          }"
        >
          <q-item
            clickable
            @click.stop="
              itemAvailable(items_id, cat_id)
                ? $emit('viewItems', {
                    item_uuid: data_items[items_id].item_uuid,
                    cat_id: cat_id,
                  })
                : false
            "
          >
            <q-item-section>
              <q-item-label class="relative-position">
                <div
                  v-if="data_items[items_id].dish"
                  class="absolute-bottom flex justify-end q-mb-xs q-mr-xs q-gutter-x-xs"
                  style="z-index: 1"
                >
                  <template
                    v-for="dish_id in data_items[items_id].dish"
                    :key="dish_id"
                  >
                    <template v-if="dish[dish_id]">
                      <q-avatar
                        size="sm"
                        style="border: 2px solid white"
                        class="bg-yellow-9"
                      >
                        <img :src="dish[dish_id].url_image" />
                      </q-avatar>
                    </template>
                  </template>
                </div>
                <q-img
                  :src="data_items[items_id].url_image"
                  style="height: 100px"
                  loading="lazy"
                  fit="cover"
                  spinner-color="primary"
                  spinner-size="xs"
                  class="rounded-borders full-width"
                  placeholder-src="placeholder.png"
                ></q-img>
              </q-item-label>

              <q-item-label class="text-weight-medium">
                <template v-if="data_items[items_id].total_allergens > 0">
                  <div class="row items-center">
                    <div class="col ellipsis-2-lines">
                      <span v-html="data_items[items_id].item_name"></span>
                    </div>
                    <div class="col-3 text-right">
                      <q-btn
                        round
                        unelevated
                        color="primary"
                        text-color="white"
                        padding="2px"
                        size="sm"
                        icon="o_info"
                        @click.stop="showAllergens(items_id)"
                      />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <span
                    v-html="data_items[items_id].item_name"
                    class="ellipsis-2-lines"
                  ></span>
                </template>
              </q-item-label>
              <q-item-label caption>
                <span
                  v-html="data_items[items_id].item_description"
                  class="ellipsis-2-lines"
                ></span>
              </q-item-label>
              <q-item-label caption class="text-weight-bold">
                <template v-if="data_items[items_id].price[0]">
                  {{ printSize(data_items[items_id].price) }}
                </template>
                <template v-if="data_items[items_id].price[0]">
                  <template v-if="data_items[items_id].price[0].discount > 0">
                    <span class="text-strike text-grey-5">{{
                      data_items[items_id].price[0].pretty_price
                    }}</span>
                  </template>
                  {{ PrintPrice(data_items[items_id].price) }}
                </template>
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </swiper-slide>
    </template>
  </swiper>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";
import { Grid, Pagination } from "swiper/modules";
import { userCartData } from "stores/CartData";

export default {
  name: "ItemsGrids",
  props: ["loading", "data", "data_items", "cat_id", "dish"],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      allergens_item_id: "",
    };
  },
  setup() {
    const CartData = userCartData();
    return {
      CartData,
      modules: [Grid],
    };
  },
  methods: {
    PrintPrice(data) {
      if (data[0]) {
        if (data[0].discount > 0) {
          return data[0].pretty_price_after_discount;
        } else {
          return data[0].pretty_price;
        }
      }
    },
    printSize(data) {
      if (data[0]) {
        return data[0].size_name;
      }
    },
    showAllergens(item_id) {
      this.$emit("showAllergens", item_id);
    },
    itemAvailable(item_id, cat_id) {
      if (
        this.CartData.items_not_available.includes(parseInt(item_id)) === false
      ) {
        if (
          this.CartData.category_not_available.includes(parseInt(cat_id)) ===
          false
        ) {
          return true;
        }
      }
      return false;
    },
  },
};
</script>
