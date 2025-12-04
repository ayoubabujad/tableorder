<template>
  <template v-if="loading">
    <div class="row q-gutter-xs">
      <template v-for="items in 2" :key="items">
        <q-skeleton height="50px" square class="col" />
      </template>
    </div>
  </template>
  <div v-else class="row items-center q-col-gutter-none">
    <div class="col">
      <swiper :slides-per-view="2.8" :space-between="10">
        <template v-for="items in data" :key="items">
          <swiper-slide>
            <div
              class="q-pa-xs bg-mygreyx radius20 cursor-pointer"
              :class="{
                'bg-grey600 text-white': $q.dark.mode,
                'bg-mygrey ': !$q.dark.mode,
              }"
              v-ripple:green
              @click="$emit('afterCategoryselected', items.category_uiid)"
            >
              <div class="row items-center text-center">
                <div
                  class="ellipsis col text-weight-light text-darkx"
                  :class="{
                    'text-grey300': $q.dark.mode,
                    'text-dark': !$q.dark.mode,
                  }"
                >
                  {{ items.category_name }}
                </div>
              </div>
            </div>
          </swiper-slide>
        </template>
      </swiper>
    </div>
  </div>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

export default {
  name: "CategorySlide",
  props: ["loading", "data"],
  components: {
    Swiper,
    SwiperSlide,
  },
};
</script>
