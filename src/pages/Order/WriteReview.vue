<template>
  <q-header
    class="bg-whitex"
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-dark': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'white' : 'mygrey'"
        text-color="dark"
      />
      <q-toolbar-title class="text-weight-bold text-darkx">{{
        $t("Write a review")
      }}</q-toolbar-title>
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-md" :class="{ 'flex flex-center': !hasData && !loading }">
    <template v-if="!hasData && !loading">
      <NoAvailableData></NoAvailableData>
    </template>

    <template v-if="hasData">
      <div
        class="q-pa-sm bg-mygreyx radius10"
        :class="{
          'bg-grey600 ': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
      >
        <div class="row items-center">
          <div class="col-2 q-mr-md">
            <q-img
              :src="data.merchant.url_logo"
              style="width: 50px; height: 50px"
              fit="cover"
              spinner-color="primary"
              spinner-size="xs"
              class="rounded-borders"
            ></q-img>
          </div>
          <div class="col">
            <div class="text-weight-medium">
              {{ data.merchant.restaurant_name }}
            </div>
            <div class="text-grey font12 ellipsis-2-lines">
              {{ data.merchant.address }}
            </div>
          </div>
        </div>
      </div>

      <q-form @submit="onSubmit">
        <div class="text-center q-pa-md">
          <div class="text-weight-bold">{{ $t("How was your meal") }}?</div>
          <div>{{ $t("Whether it's good or bad, let's talk about it") }}</div>
          <q-rating
            v-model="rating_value"
            size="3em"
            :max="5"
            color="primary"
            icon="star"
            icon-selected="star"
          />
        </div>

        <div class="text-weight-medium q-mb-xs">
          {{ $t("write your review") }}
        </div>
        <div class="radius20 border-dark-grey q-pa-md">
          <q-input
            v-model="review_content"
            type="textarea"
            autogrow
            :rules="[
              (val) => (val && val.length > 0) || 'This field is required',
            ]"
          />
        </div>

        <q-list>
          <q-item tag="label" v-ripple>
            <q-item-section avatar>
              <q-checkbox v-model="as_anonymous" val="teal" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t("post review as anonymous") }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-space class="q-pa-sm"></q-space>

        <div class="row items-center q-col-gutter-md">
          <div class="col-6">
            <q-btn
              :color="$q.dark.mode ? 'grey300' : 'dark'"
              size="lg"
              rounded
              unelevated
              no-caps
              flat
              class="full-width"
              @click="$router.back()"
              :disable="loading"
              >{{ $t("Cancel") }}</q-btn
            >
          </div>
          <div class="col-6">
            <q-btn
              type="submit"
              color="primary"
              size="lg"
              rounded
              unelevated
              no-caps
              class="full-width"
              :loading="loading"
              >{{ $t("Add review") }}</q-btn
            >
          </div>
        </div>
      </q-form>
    </template>

    <q-inner-loading :showing="loading" color="primary" />
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";

export default {
  name: "WriteReview",
  components: {
    NoAvailableData: defineAsyncComponent(() =>
      import("components/NoAvailableData.vue")
    ),
  },
  data() {
    return {
      review_content: "",
      as_anonymous: false,
      rating_value: 0,
      order_uuid: "",
      loading: false,
      data: [],
      redirect: "",
    };
  },
  created() {
    this.order_uuid = this.$route.query.order_uuid;
    this.redirect = this.$route.query.redirect;
    this.orderDetails();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    orderDetails() {
      this.loading = true;
      APIinterface.fetchDataByTokenPost(
        "orderDetails",
        "order_uuid=" + this.order_uuid
      )
        .then((data) => {
          this.data = data.details.data;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    onSubmit() {
      if (this.rating_value > 0) {
        const params = {
          order_uuid: this.order_uuid,
          review_content: this.review_content,
          rating_value: this.rating_value,
          as_anonymous: this.as_anonymous,
          tags_like: [],
          tags_not_like: [],
          upload_images: "",
        };
        this.loading = true;
        APIinterface.fetchDataByTokenPost("addReview", params)
          .then((data) => {
            APIinterface.notify("green-5", data.msg, "check_circle", this.$q);
            if (!APIinterface.empty(this.redirect)) {
              this.$router.replace(this.redirect);
            } else {
              this.$router.back();
            }
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error_outline", this.$q);
          })
          .then((data) => {
            this.loading = false;
          });
      } else {
        APIinterface.notify("dark", "Please rate your order", "info", this.$q);
      }
    },
  },
};
</script>
