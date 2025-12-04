<template>
  <q-dialog v-model="dialog" position="bottom">
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn
            flat
            round
            dense
            icon="close"
            :color="$q.dark.mode ? 'grey300' : 'dark'"
            v-close-popup
          />
          <q-toolbar-title
            v-if="item_only == 'true'"
            class="font16 text-dark"
            >{{ $t("Items") }}</q-toolbar-title
          >
          <q-toolbar-title
            v-else
            class="font16 text-darkx"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
            >#{{ order_id }}</q-toolbar-title
          >
        </q-toolbar>

        <div class="q-pl-md q-pr-md q-pb-md">
          <div class="text-right" v-if="item_only == 'false'">
            <q-btn
              flat
              :color="$q.dark.mode ? 'grey300' : 'red-9'"
              :label="$t('View full details')"
              no-caps
              class="q-pa-none"
              style="min-height: auto"
              :to="{
                path: '/order/view',
                query: {
                  order_uuid: order_uuid,
                },
              }"
            />
          </div>

          <q-list>
            <template v-for="items in data" :key="items">
              <div
                v-if="item_list[items.item_id]"
                class="bg-secondaryx radius10 q-mb-sm"
                :class="{
                  'bg-grey600 ': $q.dark.mode,
                  'bg-secondary ': !$q.dark.mode,
                }"
              >
                <ItemListComponents
                  :data="{
                    item_name: item_list[items.item_id].item_name,
                    description:
                      item_list[items.item_id].item_short_description,
                    photo: item_list[items.item_id].photo,
                    price: items.price,
                    discount: parseFloat(items.discount),
                    price_after_discount: items.price_after_discount,
                    qty: items.qty,
                    special_instructions: '',
                    addons: [],
                  }"
                ></ItemListComponents>
              </div>
            </template>
          </q-list>
          <!-- </div> -->

          <template v-if="item_only == 'false'">
            <div
              class="q-mb-sm q-mt-sm"
              :class="{
                'border-none': $q.dark.mode,
                'border-dark-grey': !$q.dark.mode,
              }"
            ></div>
            <div class="flex justify-between fit q-pl-xl q-pr-md q-pb-sm">
              <div class="text-weight-medium">{{ $t("Total") }}</div>
              <div class="text-weight-medium">{{ order_total }}</div>
            </div>
          </template>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import { defineAsyncComponent } from "vue";

export default {
  name: "OrderPreview",
  props: [
    "item_only",
    "data",
    "item_list",
    "order_total",
    "order_id",
    "order_uuid",
  ],
  components: {
    ItemListComponents: defineAsyncComponent(() =>
      import("components/ItemListComponents.vue")
    ),
    // NumberFormat: defineAsyncComponent(() =>
    //   import("components/NumberFormat.vue")
    // ),
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    showModal(data) {
      this.dialog = data;
    },
  },
};
</script>
