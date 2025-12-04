<template>
  <swiper
    :slides-per-view="2.8"
    :space-between="10"
    class="full-width"
    :class="{
      'bg-mydark ': $q.dark.mode,
    }"
  >
    <template v-for="items in data" :key="items">
      <swiper-slide
        class="radius10"
        :class="{
          'bg-grey600 ': $q.dark.mode,
        }"
      >
        <q-item
          clickable
          @click="$emit('afterCategoryselected', items)"
          dense
          :active="category_uuid_selected == items.category_uiid ? true : false"
          :active-class="
            category_uuid_selected == items.category_uiid
              ? 'bg-primary text-white radius20'
              : ''
          "
        >
          <q-item-section>
            <q-item-label>
              <span v-html="items.category_name"></span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </swiper-slide>
    </template>
  </swiper>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "CategorySticky",
  props: ["loading", "data", "category_uuid_selected"],
  components: {
    Swiper,
    SwiperSlide,
  },
};
</script>
