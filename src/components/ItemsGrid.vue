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
    <div class="row items-center justify-between q-mb-xs">
      <div class="text-weight-bold font15">{{ $t("Best Seller") }}</div>
      <div>
        <q-btn
          flat
          no-caps
          :color="$q.dark.mode ? 'grey300' : 'primary'"
          to="/items/feature?tag=best_seller&title=Best Seller"
          >{{ $t("See All") }}</q-btn
        >
      </div>
    </div>

    <q-virtual-scroll :items="data" virtual-scroll-horizontal v-slot="{ item }">
      <div
        class="radius10 q-mr-sm"
        :class="{
          'bg-grey600 ': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <q-item
          clickable
          @click="
            $emit('viewItems', {
              item_uuid: item.item_token,
              cat_id: item.cat_id,
            })
          "
        >
          <q-item-section>
            <q-item-label>
              <q-img
                :src="item.url_image"
                style="height: 106px; width: 106px"
                loading="lazy"
                fit="scale-down"
                class="radius8"
              >
                <template v-slot:loading>
                  <q-skeleton
                    height="106px"
                    width="106px"
                    square
                    class="bg-grey-2"
                  />
                </template> </q-img
            ></q-item-label>
            <q-item-label class="text-weight-medium">
              <div style="max-width: 120px" class="ellipsis-2-lines">
                {{ item.item_name }}
              </div>
            </q-item-label>
            <q-item-label class="text-orange text-weight-bold" caption>
              {{ item.pretty_price }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-virtual-scroll>
  </template>
</template>

<script>
export default {
  name: "ItemsGrid",
  props: ["data", "loading"],
  emits: ["viewItems"],
  computed: {
    chunkedData() {
      return this.chunk(this.data, 2);
    },
    hasItems() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
  },
  methods: {
    chunk(array, size) {
      if (!Array.isArray(array) || size <= 0) {
        return [];
      }
      return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
        array.slice(i * size, i * size + size)
      );
    },
  },
};
</script>
