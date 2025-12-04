<template>
  <template v-if="loading">
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
      </q-item-section> </q-item
  ></template>
  <template v-else>
    <div class="row items-center justify-between q-mb-xsx">
      <div class="text-weight-bold text-subtitle1">
        {{ $t("What people say about us") }}
      </div>
      <div>
        <q-btn
          flat
          no-caps
          :color="$q.dark.mode ? 'grey300' : 'primary'"
          to="/review/all"
          >{{ $t("See All") }}</q-btn
        >
      </div>
    </div>

    <q-virtual-scroll :items="data" virtual-scroll-horizontal v-slot="{ item }">
      <q-item class="review-text" style="padding-left: 0">
        <q-item-section avatar>
          <q-avatar size="60px">
            <q-img
              :src="item.url_image"
              style="height: 60px; width: 60px"
              loading="lazy"
              fit="cover"
              class="radius8"
            >
              <template v-slot:loading>
                <q-skeleton
                  height="60px"
                  width="60px"
                  square
                  class="bg-grey-2"
                />
              </template>
            </q-img>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{
              item.as_anonymous == 1 ? item.hidden_fullname : item.fullname
            }}</q-item-label
          >
          <div class="flex items-center text-caption q-gutter-x-xs">
            <div><q-icon name="star" color="amber-5"></q-icon></div>
            <div class="text-weight-bold">{{ item.rating }}</div>
          </div>
          <q-item-label caption> {{ item.date_created }}</q-item-label>
          <q-item-label class="ellipsis-2-lines text-caption">{{
            item.review
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-virtual-scroll>
  </template>
</template>

<script>
export default {
  name: "CustomerReviews",
  props: ["data", "loading"],
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
<style lang="css">
.review-text {
  max-width: 300px;
  min-width: 300px;
  overflow: hidden;
}
</style>
