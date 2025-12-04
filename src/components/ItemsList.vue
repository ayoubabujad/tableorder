<template>
  <!-- <pre>{{ data }}</pre> -->
  <q-virtual-scroll
    class="fit"
    separator
    :items="data"
    :virtual-scroll-item-size="80"
    v-slot="{ item: items }"
  >
    <q-card flat class="radius8 box-shadow0 bg-white q-mb-sm">
      <q-item
        clickable
        @click.stop="
          !items.category_available || !items.item_available
            ? this.NotAvailable(items.item_unavailable)
            : this.$emit('onClick', {
                item_uuid: items.item_uuid,
                cat_id: items.cat_id,
              })
        "
      >
        <q-item-section avatar>
          <q-img
            :src="items.url_image"
            style="height: 80px; width: 80px"
            loading="lazy"
            fit="contain"
            class="radius8"
            ratio="9/16"
          >
            <template v-slot:loading>
              <q-skeleton height="80px" width="80px" square class="bg-grey-2" />
            </template>
          </q-img>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-weight-medium">
            {{ items.item_name }}
          </q-item-label>
          <q-item-label>
            <div class="flex item-start q-gutter-x-md">
              <div class="text-caption text-weight-medium">
                <span v-if="items.has_discount" class="text-strike text-red">{{
                  items.lowest_price_discount
                }}</span>
                {{ items.lowest_price }}
              </div>
              <div v-if="items.total_reviews > 0">
                <div class="flex items-center text-caption q-gutter-x-xs">
                  <div><q-icon name="star" color="amber-5"></q-icon></div>
                  <div class="text-weight-bold">
                    {{ items.average_rating }}
                  </div>
                  <div>({{ items.total_reviews }})</div>
                </div>
              </div>
            </div>
          </q-item-label>
          <q-item-label caption class="ellipsis-2-lines">
            <span v-html="items.item_description"></span>
          </q-item-label>
        </q-item-section>
        <q-item-section side top class="relative-position">
          <FavsItems
            ref="favs"
            :item_token="items.item_uuid"
            :cat_id="items.cat_id"
            :active="items.is_favorite"
            :data="items"
            @after-savefav="afterSavefav"
          />
          <div class="absolute-bottom-right">
            <q-btn
              round
              unelevated
              :color="
                !items.category_available || !items.item_available
                  ? 'disabled'
                  : 'primary'
              "
              :text-color="
                !items.category_available || !items.item_available
                  ? 'disabled'
                  : 'white'
              "
              size="sm"
              icon="las la-plus"
              :disable="!items.category_available || !items.item_available"
              class="myshadow"
              @click.stop="
                this.$emit('onClick', {
                  item_uuid: items.item_uuid,
                  cat_id: items.cat_id,
                })
              "
            />
          </div>
        </q-item-section>
      </q-item>
    </q-card>
  </q-virtual-scroll>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "ItemsList",
  props: ["data"],
  components: {
    FavsItems: defineAsyncComponent(() => import("components/FavsItems.vue")),
  },
  methods: {
    NotAvailable(data) {
      APIinterface.notify("negative", data, "error_outline", this.$q);
    },
    afterSavefav(value, isActive) {
      console.log("value", value);
      console.log("isActive", isActive);
      value.is_favorite = isActive;
    },
  },
};
</script>
