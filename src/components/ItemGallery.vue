<template>
  <div class="gallery-container relative-position">
    <swiper
      ref="gallerySwiper"
      :loop="false"
      slidesPerView="auto"
      :space-between="10"
      class="q-mb-sm gallery-swiper"
      @swiper="onSwiper"
      @slideChange="onSlideChange"
    >
      <swiper-slide v-for="items in getData" :key="items">
        <q-img
          :src="items"
          style="height: 80px; width: 80px"
          loading="lazy"
          fit="cover"
          class="radius8 cursor-pointer gallery-thumbnail"
          :class="{ 'active-thumbnail': selectedImage === items }"
          @click="viewImage(items)"
        >
          <template v-slot:loading>
            <q-skeleton height="80px" width="80px" square class="bg-grey-2" />
          </template>
        </q-img>
      </swiper-slide>
    </swiper>

    <!-- Scroll indicators -->
    <div v-if="getData.length > 3" class="scroll-indicators">
      <div class="scroll-indicator left" v-if="!isBeginning">
        <q-btn
          round
          dense
          size="sm"
          color="white"
          text-color="dark"
          icon="chevron_left"
          @click="slidePrev"
          class="shadow-2"
        />
      </div>
      <div class="scroll-indicator right" v-if="!isEnd">
        <q-btn
          round
          dense
          size="sm"
          color="white"
          text-color="dark"
          icon="chevron_right"
          @click="slideNext"
          class="shadow-2"
        />
      </div>
    </div>

    <!-- More items indicator -->
    <div v-if="!isEnd && getData.length > 3" class="more-indicator">
      <div class="more-fade"></div>
      <div class="more-text">+{{ getData.length - 3 }}</div>
    </div>
  </div>

  <ImagePreview
    ref="ref_image"
    :gallery="getData"
    :title="$t('Gallery')"
    @image-changed="onImageChanged"
  >
  </ImagePreview>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { defineAsyncComponent } from "vue";

export default {
  name: "ItemGallery",
  props: ["item_gallery"],
  data() {
    return {
      selectedImage: null,
      swiperInstance: null,
      isBeginning: true,
      isEnd: false,
    };
  },
  components: {
    Swiper,
    SwiperSlide,
    ImagePreview: defineAsyncComponent(() =>
      import("components/ImagePreview.vue")
    ),
  },
  computed: {
    getData() {
      return this.item_gallery;
    },
  },
  methods: {
    viewImage(data) {
      console.log(data);
      this.selectedImage = data;
      this.$emit("after-selectimage", data);
      const index = this.getData.indexOf(data);
      this.$refs.ref_image.slide = index >= 0 ? index : 0;
      this.$refs.ref_image.modal = true;
    },
    onImageChanged(imageUrl) {
      this.selectedImage = imageUrl;
      this.$emit("after-selectimage", imageUrl);
    },
    onSwiper(swiper) {
      this.swiperInstance = swiper;
      this.updateNavigationState();
    },
    onSlideChange() {
      this.updateNavigationState();
    },
    updateNavigationState() {
      if (this.swiperInstance) {
        this.isBeginning = this.swiperInstance.isBeginning;
        this.isEnd = this.swiperInstance.isEnd;
      }
    },
    slidePrev() {
      if (this.swiperInstance) {
        this.swiperInstance.slidePrev();
      }
    },
    slideNext() {
      if (this.swiperInstance) {
        this.swiperInstance.slideNext();
      }
    },
  },
};
</script>

<style scoped>
.gallery-container {
  position: relative;
  overflow: hidden;
}

.gallery-swiper {
  overflow: visible;
}

.swiper-slide {
  width: auto;
}

.gallery-thumbnail {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.gallery-thumbnail:hover {
  transform: scale(1.05);
  border-color: var(--q-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.active-thumbnail {
  border-color: var(--q-primary) !important;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* Scroll indicators */
.scroll-indicators {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
}

.scroll-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: all;
}

.scroll-indicator.left {
  left: -8px;
}

.scroll-indicator.right {
  right: -8px;
}

/* More items indicator */
.more-indicator {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 90px;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 5;
}

.more-fade {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 90px;
  background: linear-gradient(to right, transparent, white 50%);
}

.more-text {
  position: relative;
  background: var(--q-primary);
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>
