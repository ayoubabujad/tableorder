<template>
  <template v-if="loading">
    <q-skeleton
      height="130px"
      square
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
    />
  </template>
  <template v-else>
    <swiper
      ref="mySwiper"
      :slidesPerView="1.1"
      :spaceBetween="10"
      :pagination="{
        clickable: true,
        dynamicBullets: true,
      }"
      :modules="modules"
      :loop="true"
      :autoplay="{
        delay: 4500,
        disableOnInteraction: false,
      }"
      class="mySwiper"
      @swiper="onSwiperInit"
    >
      <swiper-slide v-for="items in data" :key="items">
        <q-img
          :src="items.image"
          style="height: 130px"
          fit="cover"
          :spinner-color="$q.dark.mode ? 'grey300' : 'primary'"
          spinner-size="sm"
          class="radius10 cursor-pointer"
          @click="showItems(items)"
        ></q-img>
      </swiper-slide>
    </swiper>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
// PWA-only: Browser handled via window.open

export default {
  name: "BannerCarousel",
  props: ["data", "loading"],
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      swiperInstance: null,
    };
  },
  setup() {
    return {
      modules: [Pagination, Autoplay],
    };
  },
  methods: {
    onSwiperInit(swiper) {
      this.swiperInstance = swiper;
    },

    showItems(value) {
      console.log("showItems", value);
      if (value.banner_type == "food") {
        this.$emit("viewItems", {
          item_uuid: value.items?.item_token,
          cat_id: value.items?.cat_id,
        });
      } else if (value.banner_type == "custom_link") {
        this.customLink(value?.featured);
      }
    },

    async customLink(redirect) {
      if (this.$q.capacitor) {
        await Browser.open({ url: redirect });
      } else {
        window.open(redirect);
      }
    },
  },
  unmounted() {
    if (this.swiperInstance && this.swiperInstance.destroy) {
      try {
        this.swiperInstance.destroy(true, true);
        this.swiperInstance = null;
      } catch (e) {
        console.warn("Swiper destroy error:", e);
      }
    }
  },
};
</script>
