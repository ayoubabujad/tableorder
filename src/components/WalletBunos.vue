<template>
  <template v-if="loading"> </template>
  <template v-else>
    <div class="q-mb-sm">
      <swiper :slides-per-view="1" :space-between="10">
        <template v-for="items in data" :key="items">
          <swiper-slide>
            <div
              class="radius20 bg-mygreyx q-pa-xs"
              :class="{
                'bg-grey600 text-white': $q.dark.mode,
                'bg-mygrey text-dark': !$q.dark.mode,
              }"
            >
              <div class="q-pa-sm">
                <div class="text-boyd1 text-weight-bold">
                  {{ items.title }}
                </div>
                <div class="text-caption">
                  {{ items.discount_details }}
                </div>
                <div class="text-caption">
                  {{ items.valid_discount }}
                </div>
              </div>
            </div>
          </swiper-slide>
        </template>
      </swiper>
    </div>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import APIinterface from "src/api/APIinterface";

export default {
  name: "WalletBunos",
  components: {
    Swiper,
    SwiperSlide,
  },
  data() {
    return {
      loading: false,
      data: [],
    };
  },
  mounted() {
    this.getDiscount();
  },
  methods: {
    getDiscount() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "getDiscount",
        "transaction_type=digital_wallet"
      )
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {})
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
