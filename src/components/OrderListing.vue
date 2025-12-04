<template>
  <div
    class="q-pa-sm bg-mygreyx radius10 q-mb-md"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'bg-mygrey ': !$q.dark.mode,
    }"
  >
    <div class="q-pl-md q-pr-md">
      <div class="row items-center">
        <div class="col">
          <div class="flex justify-start font11 q-gutter-xs">
            <div>{{ items.date_created }}</div>
            <div>
              <q-icon name="fiber_manual_record" size="8px" color="grey" />
            </div>
            <div>{{ items.total_items }}</div>
          </div>
        </div>
        <div class="col-3 font11 text-right">{{ items.total }}</div>
      </div>
    </div>
    <q-item
      clickable
      @click="
        this.$emit('onPreview', {
          data: items.items,
          total: items.total,
          order_id: items.order_id_raw,
          order_uuid: items.order_uuid,
        })
      "
    >
      <q-item-section side>
        <q-img
          :src="merchants[items.merchant_id].url_logo"
          style="width: 35px; height: 35px"
          fit="cover"
          spinner-color="primary"
          spinner-size="xs"
          class="rounded-borders"
          placeholder-src="placeholder.png"
        ></q-img>
      </q-item-section>
      <q-item-section>
        <q-item-label>
          <div class="text-weight-medium">
            <template v-if="merchants[items.merchant_id]">
              {{ merchants[items.merchant_id].restaurant_name }}
            </template>
            <template v-else>{{ $t("Uknown name") }}</template>
          </div>
          <div class="flex q-gutter-xs font11">
            <div>
              <q-icon name="fiber_manual_record" size="8px" color="primary" />
            </div>
            <div class="text-primary">
              <template v-if="status_list[items.status]">
                {{ status_list[items.status].status }}
              </template>
            </div>
          </div>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <div class="column items-stretch text-right font12">
          <div class="text-red-9 text-weight-medium">
            #{{ items.order_id_raw }}
          </div>
          <div class="text-weight-light">
            <template v-if="payment_list[items.payment_code]">
              {{ payment_list[items.payment_code].payment_name }}
            </template>
          </div>
        </div>
      </q-item-section>
    </q-item>
    <div class="row items-center q-col-gutter-md">
      <div class="col">
        <q-btn
          v-if="status_allowed_cancelled.includes(items.status)"
          :color="$q.dark.mode ? 'grey300' : 'white'"
          :text-color="$q.dark.mode ? 'grey600' : 'dark'"
          size="md"
          rounded
          unelevated
          no-caps
          class="full-width"
          @click="$emit('onCancelorder')"
          >{{ $t("Cancel Order") }}</q-btn
        >

        <q-btn
          v-else
          color="white"
          text-color="dark"
          size="md"
          rounded
          unelevated
          no-caps
          class="full-width"
          @click="$emit('orderAgain')"
          >{{ $t("Buy again") }}</q-btn
        >
      </div>
      <div class="col">
        <template v-if="status_allowed_review.includes(items.status)">
          <q-btn
            v-if="!order_reviewed.includes(items.order_id_raw)"
            color="primary"
            text-color="white"
            size="md"
            rounded
            unelevated
            no-caps
            class="full-width"
            :to="{
              path: '/order/write-review',
              query: {
                order_uuid: items.order_uuid,
                redirect: '/account/orders',
              },
            }"
            >{{ $t("Write review") }}</q-btn
          >
        </template>
        <template v-else>
          <template v-if="current_tab != 'cancel'">
            <q-btn
              color="primary"
              text-color="white"
              size="md"
              rounded
              unelevated
              no-caps
              class="full-width"
              :to="{
                path: '/order/track',
                query: {
                  order_uuid: items.order_uuid,
                },
              }"
              >{{ $t("Track Order") }}</q-btn
            >
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderListing",
  props: [
    "items",
    "merchants",
    "payment_list",
    "status_list",
    "status_allowed_cancelled",
    "status_allowed_review",
    "order_reviewed",
    "current_tab",
  ],
};
</script>
