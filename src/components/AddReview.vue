<template>
  <q-dialog
    v-model="modal"
    maximized
    persistent
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-show="beforeShow"
    @before-hide="beforeHide"
  >
    <q-card class="bg-white"
      >x
      <div class="fixed-top bg-white text-dark z-top">
        <q-toolbar>
          <q-btn
            @click="handleClose"
            dense
            color="grey-5"
            icon="close"
            size="md"
            unelevated
            flat
            class="q-mr-sm"
          />
          <q-toolbar-title v-if="steps == 2">
            <div class="text-caption text-weight-bold">
              {{ data?.restaurant_name }}
            </div>
            <div class="text-caption">
              <q-rating
                v-model="rating"
                size="1em"
                color="disabled"
                color-selected="amber-5"
                icon="star"
                icon-selected="star"
                readonly
              />
            </div>
          </q-toolbar-title>
        </q-toolbar>
      </div>
      <q-space style="height: 50px"></q-space>
      <!-- steps=>{{ steps }} -->
      <!-- <pre>{{ data }}</pre> -->

      <LoadingData v-if="loading1"></LoadingData>
      <template v-if="steps == 1">
        <q-card-section class="flex flex-center">
          <div class="q-mb-sm">
            <q-responsive style="width: 90px; height: 90px">
              <q-img
                :src="data?.merchant_logo || ''"
                lazy
                fit="cover"
                class="circle"
                spinner-color="primary"
                spinner-size="sm"
                placeholder-src="placeholder.png"
              >
                <template v-slot:loading>
                  <div class="text-primary">
                    <q-spinner-ios size="sm" />
                  </div>
                </template>
              </q-img>
            </q-responsive>
          </div>
          <div class="q-pl-xl q-pr-xl text-center">
            <div class="text-weight-bold text-subtitle2">
              {{ data?.restaurant_name }}
            </div>
            <div class="text-body2 text-grey line-normal q-mb-sm">
              {{ $t("How was your order") }}
            </div>
            <q-rating
              v-model="rating"
              size="3em"
              color="disabled"
              color-selected="amber-5"
              icon="star"
              icon-selected="star"
            />
          </div>
        </q-card-section>
        <q-card-actions class="absolute-bottom footer-shadow q-pa-md">
          <q-btn
            no-caps
            unelevated
            :color="rating > 0 ? 'primary' : 'disabled'"
            :text-color="rating > 0 ? 'white' : 'grey'"
            class="fit"
            rounded
            size="lg"
            @click="steps = 2"
          >
            <div class="text-weight-bold text-subtitle2">
              {{ $t("Continue") }}
            </div>
          </q-btn>
        </q-card-actions>
      </template>
      <template v-else-if="steps == 2">
        <q-form @submit="onSubmit">
          <q-card-section class="myform">
            <div class="q-gutter-y-sm">
              <div class="text-weight-bold text-subtitle2 q-mb-sm">
                {{ $t("Leave a review") }}
              </div>
              <div>
                <q-input
                  v-model="review_content"
                  type="textarea"
                  outlined
                  :placeholder="
                    $t('Loved something about this place? Let others know!')
                  "
                  maxlength="2000"
                  clearable
                  clear-icon="eva-close-circle-outline"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      this.$t('This field is required'),
                  ]"
                />
              </div>

              <div>
                <q-checkbox
                  v-model="as_anonymous"
                  color="disabled"
                  :label="$t('post review as anonymous')"
                />
              </div>

              <div class="text-weight-bold text-subtitle2 q-mb-sm">
                {{ $t("Share your moments") }}
              </div>

              <!-- UPLOAD IMAGE -->

              <div class="flex items-center q-gutter-xs">
                <template v-for="(items, index) in upload_images" :key="items">
                  <div
                    class="relative-position radius8 light-dimmed"
                    style="width: 6em; height: 5.5em"
                  >
                    <div
                      v-if="items.id == 'temp'"
                      class="z-top absolute-center"
                    >
                      <q-spinner-ios size="sm" />
                    </div>
                    <div class="absolute-top-right q-pa-xs">
                      <q-btn
                        icon="eva-trash-2-outline"
                        unelevated
                        padding="4px"
                        size="sm"
                        color="grey"
                        rounded
                        style="z-index: 999"
                        @click="removeImage(items, index)"
                      ></q-btn>
                    </div>
                    <q-img
                      :src="items.url_image"
                      fit="cover"
                      class="fit radius8"
                    >
                      <template v-slot:loading>
                        <div class="text-primary">
                          <q-spinner-ios size="sm" />
                        </div> </template
                    ></q-img>
                  </div>
                </template>
                <div
                  class="dashed radius8 q-pa-sm flexx flex-centerx text-center cursor-pointer"
                  :class="{
                    'fit q-pa-md': !hasReviewImage,
                    'small-width': hasReviewImage,
                  }"
                  @click="selectPhoto"
                >
                  <q-icon name="eva-image-outline" size="sm"></q-icon>
                  <div class="text-caption line-normal q-mt-xs">
                    {{ countUpload }} of {{ uploadLimit }}
                  </div>
                </div>
              </div>
              <!-- UPLOAD IMAGE -->

              <q-space class="q-pa-xs"></q-space>

              <div class="text-weight-bold text-subtitle2 q-mb-sm">
                {{ $t("Food Items") }}
              </div>

              <q-list>
                <template v-for="items in data?.items" :key="items">
                  <q-item class="q-pl-none">
                    <q-item-section avatar top>
                      <q-avatar rounded>
                        <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section top>
                      <q-item-label>{{ items.item_name }}</q-item-label>
                      <q-item-label>
                        <q-rating
                          v-model="items.rating"
                          size="1.5em"
                          color="disabled"
                          color-selected="amber-5"
                          icon="star"
                          icon-selected="star"
                      /></q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>

              <q-space class="q-pa-xl"></q-space>
              <q-space class="q-pa-xl"></q-space>

              <!-- end -->
            </div>
            <div
              class="fixed-bottom q-pa-md footer-shadow row q-gutter-x-md items-center"
              :class="{
                'bg-dark': $q.dark.mode,
                'bg-white': !$q.dark.mode,
              }"
            >
              <q-btn
                class="col"
                unelevated
                rounded
                :color="review_content ? 'primary' : 'disabled'"
                :text-color="review_content ? 'white' : 'disabled'"
                :disabled="!review_content"
                size="lg"
                no-caps
                type="submit"
                :loading="loading"
              >
                <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
                  {{ $t("Submit Review") }}
                </div>
              </q-btn>
            </div>
          </q-card-section>
        </q-form>
      </template>
      <template v-else-if="steps == 3">
        <q-card-section>
          <div class="text-center">
            <div>
              <OrderStatusAnimation
                status="completed"
                style="height: 120px"
              ></OrderStatusAnimation>
            </div>
            <div class="text-h6 text-weight-bold">{{ $t("Thank You") }}!</div>
            <div class="text-body2 text-weight-medium">
              {{ $t("Thank you for your feedback") }}.
              <br />
              {{
                $t(
                  "We appreciate your taking the time to provide your feedback"
                )
              }}.
            </div>
          </div>
        </q-card-section>
        <div
          class="fixed-bottom q-pa-md footer-shadow row q-gutter-x-md items-center"
          :class="{
            'bg-dark': $q.dark.mode,
            'bg-white': !$q.dark.mode,
          }"
        >
          <q-btn
            class="col"
            unelevated
            rounded
            color="primary"
            size="lg"
            no-caps
            @click="handleClose"
          >
            <div class="text-subtitle2 text-weight-bold q-gutter-x-sm">
              {{ $t("Close") }}
            </div>
          </q-btn>
        </div>
      </template>
    </q-card>

    <q-uploader
      :url="upload_api"
      ref="uploader"
      :label="$t('Upload files')"
      :color="$q.dark.mode ? 'grey600' : 'primary'"
      :text-color="$q.dark.mode ? 'grey300' : 'white'"
      no-thumbnails
      class="hidden"
      flat
      accept=".jpg, image/*"
      bordered
      :max-files="3"
      auto-upload
      :max-total-size="3 * 1024 * 1024"
      :max-file-size="1 * 1024 * 1024"
      @rejected="onRejectedFiles"
      :headers="[{ name: 'Authorization', value: `token ${this.getToken()}` }]"
      :form-fields="formData"
      field-name="file"
      @uploading="onUploading"
      @uploaded="afterUploaded"
      @start="onStart"
      @finish="onFinish"
    />
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import config from "src/api/config";
import { defineAsyncComponent } from "vue";

export default {
  name: "ReviewOrder",
  components: {
    OrderStatusAnimation: defineAsyncComponent(() =>
      import("components/OrderStatusAnimation.vue")
    ),
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
  },
  data() {
    return {
      modal: false,
      order_uuid: null,
      data: null,
      rating: null,
      steps: 1,
      review_content: null,
      upload_api: config.api_base_url + "/partnerapi/uploadReview",
      upload_images: [],
      as_anonymous: false,
      loading: false,
      loading1: false,
      review_details: [],
      uploadLimit: 2,
    };
  },
  setup() {
    return {};
  },
  computed: {
    ratingInWords() {
      let results = null;
      switch (this.rating) {
        case 1:
          results = this.$t("Terrible");
          break;
        case 2:
          results = this.$t("Poor");
          break;
        case 3:
          results = this.$t("Okay");
          break;
        case 4:
          results = this.$t("Good");
          break;
        case 5:
          results = this.$t("Perfect");
          break;
      }
      return results;
    },
    hasReviewImage() {
      return (
        Array.isArray(this.upload_images) &&
        this.upload_images.length > 0 &&
        !!this.upload_images[0].url_image
      );
    },
    countUpload() {
      return this.upload_images.length;
    },
  },
  methods: {
    handleClose() {
      if (this.steps == 3) {
        this.$emit("afterAddreview");
      }
      this.modal = false;
    },
    async addTofavourites() {
      try {
        console.log("addTofavourites");
        this.loading = true;
        const params = new URLSearchParams({
          merchant_id: this.data.merchant_id,
        }).toString();
        const results = await APIinterface.fetchDataByTokenPost(
          "SaveStore",
          params
        );
        console.log("results", results);
        APIinterface.ShowSuccessful(results.msg, this.$q);
        this.modal = false;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    async removeImage(value, index) {
      if (this.$refs.uploader.files.length > 0) {
        this.$refs.uploader.removeFile(this.$refs.uploader.files[index]);
      }

      this.upload_images.splice(index, 1);

      const params = new URLSearchParams({
        id: value.id,
      }).toString();
      try {
        await APIinterface.fetchDataByTokenPost("deleteMedia", params);
      } catch (error) {
      } finally {
      }
    },
    selectPhoto() {
      const count = this.countUpload;
      if (count >= this.uploadLimit) {
        APIinterface.ShowAlert(
          this.$t("You already reach the limit for uploading image"),
          this.$q.capacitor,
          this.$q
        );
        return;
      }
      this.$refs.uploader.pickFiles();
    },
    getToken() {
      return auth.getToken();
    },
    onRejectedFiles(rejectedEntries) {
      rejectedEntries.forEach((file) => {
        let message = "";
        switch (file.failedPropValidation) {
          case "max-total-size":
          case "max-file-size":
            message = this.$t("file_too_large", {
              file: file.file.name,
              max: "1 MB",
            });
            break;
          case "accept":
            message = this.$t("file_invalid_type", {
              file: file.file.name,
              file_type: file.file?.type,
            });
            break;
          case "max-files":
            message = this.$t("Too many files selected.");
            break;
          default:
            message = this.$t("file_rejected", {
              file: file.file.name,
            });
            break;
        }
        APIinterface.notify("negative", message, "error_outline", this.$q);
      });
    },
    onStart() {
      console.log("onStart");
    },
    onUploading(files) {
      console.log("onUploading", files);
      this.upload_images.push({
        url_image: "placeholder.png",
        id: "temp",
      });
    },
    onFinish() {
      this.$refs.uploader.reset();
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      const removeId = "temp";
      this.upload_images = this.upload_images.filter(
        (item) => item.id !== removeId
      );
      if (response.code == 1) {
        this.upload_images = [...this.upload_images, response.details];
      } else {
        APIinterface.ShowAlert(response.msg, this.$q.capacitor, this.$q);
      }
    },
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          order_uuid: this.data?.order_uuid,
          review_content: this.review_content,
          upload_images: this.upload_images,
          rating: this.rating,
          as_anonymous: this.as_anonymous ? 1 : 0,
          items: this.data?.items,
        };
        await APIinterface.fetchDataByTokenPost("addReview", params);

        this.steps = 3;
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
    beforeShow() {
      if (!this.data && this.order_uuid) {
        console.log("fetch order");
        this.fetchOrder();
      }
    },
    beforeHide() {
      this.order_uuid = null;
      this.data = null;
      this.steps = 1;
      this.rating = null;
      this.review_content = "";
      this.upload_images = [];
      this.as_anonymous = false;
    },
    async fetchOrder() {
      try {
        this.loading1 = true;
        this.steps = 0;
        const result = await APIinterface.fetchDataByTokenPost(
          "getOrder",
          "order_uuid=" + this.order_uuid
        );
        console.log("result", result);

        const data = result.details;

        let itemList = [];
        Object.entries(data?.items).forEach(([key, items]) => {
          itemList.push({
            item_token: items.item_token,
            item_name: items.item_name,
            item_id: items?.item_id,
            rating: 0,
          });
        });

        this.steps = 1;

        this.data = {
          order_uuid: this.order_uuid,
          restaurant_name: data?.merchant_info?.restaurant_name,
          merchant_logo: data?.merchant_info?.url_logo,
          items: itemList,
        };
      } catch (error) {
        console.log("error", error);
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading1 = false;
      }
    },
    show(value) {
      this.data = value;
      this.formData = [
        {
          name: "merchant_id",
          value: value.merchant_id,
        },
      ];
      this.modal = true;
    },
  },
};
</script>
