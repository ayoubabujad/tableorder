<template>
  <q-dialog
    v-model="modal"
    persistent
    :maximized="true"
    class="z-max"
    transition-show="fade"
    transition-hide="fade"
  >
    <q-card class="bg-dark">
      <q-toolbar class="text-primary top-toolbar q-pl-md" dense>
        <q-toolbar-title class="text-white text-weight-bold text-subtitle2">
          {{ title }} ({{ slide + 1 }}/{{ gallery.length }})
        </q-toolbar-title>
        <q-space></q-space>
        <q-btn
          icon="close"
          color="white"
          flat
          round
          dense
          v-close-popup
        ></q-btn>
      </q-toolbar>
      <q-card-section
        class="flex flex-center text-white full-height"
        v-if="hasData"
      >
        <div class="fit column">
          <q-carousel
            animated
            v-model="slide"
            infinite
            swipeable
            transition-prev="slide-right"
            transition-next="slide-left"
            class="modern-carousel"
            control-color="white"
            style="flex: 1"
          >
            <template v-for="(items, index) in gallery" :key="items">
              <q-carousel-slide :name="index" class="q-pa-none">
                <div class="fit flex flex-center" style="touch-action: pan-y pinch-zoom;">
                  <q-img
                    :src="items"
                    fit="contain"
                    class="full-height full-width zoomable-image"
                    spinner-color="white"
                    spinner-size="lg"
                    @click="toggleZoom"
                    :style="imageStyle"
                  />
                </div>
              </q-carousel-slide>
            </template>

            <template v-slot:control>
              <q-carousel-control position="bottom" class="q-pb-lg">
                <div class="row q-gutter-sm items-center">
                  <q-btn
                    push
                    round
                    dense
                    color="white"
                    text-color="black"
                    icon="chevron_left"
                    @click="slide = slide > 0 ? slide - 1 : gallery.length - 1"
                  />

                  <div class="row q-gutter-xs">
                    <q-btn
                      v-for="(items, index) in gallery"
                      :key="index"
                      push
                      size="sm"
                      :color="slide === index ? 'primary' : 'grey-7'"
                      @click="slide = index"
                      class="thumbnail-btn"
                    >
                      <q-img
                        :src="items"
                        style="width: 40px; height: 40px"
                        fit="cover"
                      />
                    </q-btn>
                  </div>

                  <q-btn
                    push
                    round
                    dense
                    color="white"
                    text-color="black"
                    icon="chevron_right"
                    @click="slide = slide < gallery.length - 1 ? slide + 1 : 0"
                  />
                </div>
              </q-carousel-control>
            </template>
          </q-carousel>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "ImagePreview",
  props: ["gallery", "title"],
  data() {
    return {
      modal: false,
      slide: 0,
      isZoomed: false,
    };
  },
  setup() {
    return {};
  },
  computed: {
    hasData() {
      if (Object.keys(this.gallery).length > 0) {
        return true;
      }
      return false;
    },
    imageStyle() {
      return {
        transform: this.isZoomed ? 'scale(2)' : 'scale(1)',
        transition: 'transform 0.3s ease',
        cursor: this.isZoomed ? 'zoom-out' : 'zoom-in',
      };
    },
  },
  watch: {
    slide(newSlide) {
      this.isZoomed = false;
      if (this.gallery && this.gallery[newSlide]) {
        this.$emit("image-changed", this.gallery[newSlide]);
      }
    },
    modal(newVal) {
      if (!newVal) {
        this.isZoomed = false;
      }
    },
  },
  methods: {
    toggleZoom() {
      this.isZoomed = !this.isZoomed;
    },
  },
};
</script>

<style scoped>
.modern-carousel {
  background: rgba(0, 0, 0, 0.9);
}

.thumbnail-btn {
  border-radius: 8px;
  overflow: hidden;
  padding: 2px;
  min-width: 44px;
  min-height: 44px;
  transition: all 0.3s ease;
}

.thumbnail-btn:hover {
  transform: scale(1.1);
}

.zoomable-image {
  transition: transform 0.3s ease;
  will-change: transform;
}

.zoomable-image:active {
  cursor: grabbing;
}
</style>
