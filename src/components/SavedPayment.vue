<template>
  <template v-if="UserStore.loading_payment">
    <q-skeleton height="45px" square class="bg-mygrey radius10" />
  </template>
  <template v-else>
    <template v-if="UserStore.hasPaymentMethods">
      <div class="relative-position">
        <q-inner-loading
          :showing="loading"
          :color="$q.dark.mode ? 'grey300' : 'primary'"
          class="z-top"
        />
        <swiper :slides-per-view="1.9" :space-between="10">
          <template v-for="items in UserStore.payment_data.data" :key="items">
            <swiper-slide>
              <q-list class="q-list-small">
                <q-item
                  tag="label"
                  class="radius10 q-mb-sm"
                  clickable
                  :class="{
                    'bg-darkgreen text-white':
                      payment_uuid == items.payment_uuid,
                    'bg-primary text-white': payment_uuid != items.payment_uuid,
                  }"
                >
                  <q-item-section class="hidden">
                    <q-radio
                      v-model="payment_uuid"
                      :val="items.payment_uuid"
                      size="xs"
                      checked-icon="fiber_manual_record"
                      unchecked-icon="fiber_manual_record"
                      @update:model-value="
                        setDefaultPayment(items.payment_uuid)
                      "
                    />
                  </q-item-section>
                  <q-item-section side>
                    <template v-if="items.logo_type == 'icon'">
                      <q-icon color="white" name="credit_card" />
                    </template>
                    <template v-else>
                      <q-img :src="items.logo_image"></q-img>
                    </template>
                  </q-item-section>
                  <q-item-section class="q-pl-sm">
                    <q-item-label>{{ items.payment_name }}</q-item-label>
                    <q-item-label caption class="font11" v-if="items.attr2">{{
                      items.attr2
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </swiper-slide>
          </template>
        </swiper>
      </div>
    </template>
    <template v-else>
      <div class="bg-red-12 text-white radius10 q-pt-xs q-pl-xs q-mb-sm">
        <p>No payment available</p>
      </div>
    </template>
  </template>
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import { useUserStore } from "stores/UserStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "SavedPayment",
  components: {
    Swiper,
    SwiperSlide,
  },
  setup(props) {
    const UserStore = useUserStore();
    return { UserStore };
  },
  data() {
    return {
      payment_uuid: "",
      loading: false,
    };
  },
  created() {
    this.UserStore.SavedPaymentList();
  },
  watch: {
    UserStore: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        if (!newValue.loading_payment) {
          this.payment_uuid = newValue.payment_data.default_payment_uuid;
          this.$emit("afterSetpayment", this.payment_uuid);
        }
      },
    },
  },
  methods: {
    setDefaultPayment(payment_uuid) {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "setDefaultPayment",
        "payment_uuid=" + payment_uuid
      )
        .then((data) => {
          this.$emit("afterSetpayment", payment_uuid);
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
