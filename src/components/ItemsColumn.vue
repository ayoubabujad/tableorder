<template>
  <template v-if="loading">
    <template v-for="items in 2" :key="items">
      <q-item>
        <q-item-section>
          <q-skeleton
            height="110px"
            square
            class="radius20"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          />
        </q-item-section>
        <q-item-section>
          <q-skeleton
            height="110px"
            square
            class="radius20"
            :class="{
              'bg-grey600 ': $q.dark.mode,
              'bg-mygrey ': !$q.dark.mode,
            }"
          />
        </q-item-section>
      </q-item>
    </template>
  </template>
  <template v-else>
    <q-virtual-scroll :items="data" virtual-scroll-horizontal v-slot="{ item }">
      <div
        :class="{
          'bg-grey600': $q.dark.mode,
          'bg-ltgreen': !$q.dark.mode,
        }"
        class="q-mr-sm radius10"
      >
        <q-item
          clickable
          @click="
            $emit('viewItems', {
              item_uuid: item.item_uuid,
              cat_id: item.cat_id,
            })
          "
        >
          <q-item-section avatar>
            <q-img
              :src="item.url_image"
              style="height: 80px; width: 80px"
              loading="lazy"
              fit="scale-down"
              class="radius8"
            >
              <template v-slot:loading>
                <q-skeleton
                  height="80px"
                  width="80px"
                  square
                  class="bg-grey-2"
                />
              </template>
            </q-img>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">
              <div style="max-width: 120px" class="ellipsis-2-lines">
                {{ item.item_name }}
              </div>
            </q-item-label>
            <q-item-label class="text-orange text-weight-bold" caption>
              <span v-if="item.has_discount" class="text-strike text-red">{{
                item.lowest_price_discount
              }}</span>
              {{ item.lowest_price }}
            </q-item-label>
            <div
              v-if="item.total_reviews > 0"
              class="flex items-center text-caption q-gutter-x-xs"
            >
              <div><q-icon name="star" color="amber-5"></q-icon></div>
              <div class="text-weight-bold">{{ item.average_rating }}</div>
              <div>({{ item.total_reviews }})</div>
            </div>
          </q-item-section>
        </q-item>
      </div>
    </q-virtual-scroll>
  </template>
</template>

<script>
export default {
  name: "ItemsColumn",
  props: ["data", "loading"],
  emits: ["viewItems"],
  computed: {
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
  },
};
</script>
