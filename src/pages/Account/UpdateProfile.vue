<template>
  <q-page class="modern-page">
    <!-- 🎨 Animated Background -->
    <div class="modern-gradient-bg"></div>

    <!-- 🔙 Back Button -->
    <div class="modern-back-btn">
      <q-btn
        @click="$router.back()"
        round
        size="md"
        icon="arrow_back"
        class="btn-glass shadow-soft"
      />
    </div>

      <!-- 📱 Profile Update Container -->
    <div class="modern-container">
      <!-- 📱 Profile Update Card -->
      <div class="modern-card profile-card q-pa-lg">
        <template v-if="loading">
          <div class="text-center q-py-xl">
            <q-circular-progress indeterminate rounded size="lg" color="primary" />
            <div class="text-subtitle1 text-grey q-mt-md">{{ $t("Loading") }}...</div>
          </div>
        </template>

        <q-form @submit="checkForm" v-else class="q-gutter-md">
          <!-- ✨ Profile Header -->
          <div class="text-center q-mb-lg">
            <div class="profile-avatar-section q-mb-md">
              <div class="avatar-container">
                <q-img
                  :src="hasPhoto ? photo_data?.path : featured_url"
                  class="profile-avatar"
                  loading="lazy"
                  fit="cover"
                >
                  <template v-slot:loading>
                    <q-skeleton height="120px" width="120px" class="bg-grey-2 rounded-full" />
                  </template>
                </q-img>

                <q-btn
                  round
                  size="md"
                  icon="camera_alt"
                  class="camera-btn modern-btn-secondary"
                  @click="takePhoto"
                />
              </div>
            </div>
            <div class="text-h5 text-weight-bold text-dark q-mb-xs">
              {{ $t("Edit Profile") }}
            </div>
            <div class="text-body2 text-grey-7">
              {{ $t("Update your personal information") }}
            </div>
          </div>

          <!-- 👤 Name Inputs Row -->
          <div class="row q-gutter-sm q-mb-md">
            <div class="col">
              <q-input
                v-model="first_name"
                :label="$t('First name')"
                filled
                color="accent-vibrant"
                class="modern-input"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="accent-vibrant" />
                </template>
              </q-input>
            </div>
            <div class="col">
              <q-input
                v-model="last_name"
                :label="$t('Last name')"
                filled
                color="accent-vibrant"
                class="modern-input"
                :rules="[
                  (val) =>
                    (val && val.length > 0) || this.$t('This field is required'),
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="person_outline" color="accent-vibrant" />
                </template>
              </q-input>
            </div>
          </div>

          <!-- 📧 Email Input -->
          <q-input
            v-model="email_address"
            :label="$t('Email address')"
            filled
            color="accent-vibrant"
            class="modern-input"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="accent-vibrant" />
            </template>
          </q-input>

          <!-- 📱 Phone Input -->
          <q-input
            v-model="mobile_number"
            :label="$t('Mobile number')"
            filled
            color="accent-vibrant"
            class="modern-input"
            :prefix="mobile_prefix"
            mask="#########"
            :rules="[
              (val) => (val && val.length > 0) || $t('This field is required'),
              (val) => val.length === 9 || $t('Phone number must be exactly 9 digits'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="accent-vibrant" />
            </template>
          </q-input>

          <!-- 🚀 Save Button -->
          <q-btn
            type="submit"
            size="lg"
            rounded
            unelevated
            no-caps
            class="full-width q-mt-lg modern-btn-primary"
            :loading="loading_submit"
          >
            <div class="text-weight-bold text-body1">{{ $t("Save Changes") }}</div>
            <q-icon name="save" size="20px" class="q-ml-sm" />
          </q-btn>
        </q-form>
      </div>

      <!-- Hidden File Uploader -->
      <UploaderFile
        ref="uploader_file"
        path="upload/avatar"
        @after-uploadfile="afterUploadfile"
        class="hidden"
      ></UploaderFile>
    </div>

    <TwoStepsVerification
      ref="verification"
      :message="otp_message"
      :back_button="false"
      :loading="loading_submit"
      @after-verify="afterVerify"
    ></TwoStepsVerification>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import AppCamera from "src/api/AppCamera";
import { useUserStore } from "stores/UserStore";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "UpdateProfile",
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    const UserStore = useUserStore();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, UserStore, SettingStore };
  },
  components: {
    TwoStepsVerification: defineAsyncComponent(() =>
      import("components/TwoStepsVerification.vue")
    ),
    UploaderFile: defineAsyncComponent(() =>
      import("components/UploaderFile.vue")
    ),
  },
  data() {
    return {
      loading: true,
      loading_submit: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      original_email_address: "",
      original_mobile_number: "",
      otp: "",
      otp_message: "",
      photo_data: [],
      upload_enabled: false,
      featured_filename: "",
      featured_url: "",
      upload_path: "",
      has_photo: false,
      knob: 71,
    };
  },
  mounted() {
    if (this.UserStore.user_data) {
      this.loading = false;
      this.first_name = this.UserStore.user_data?.first_name;
      this.last_name = this.UserStore.user_data?.last_name;
      this.email_address = this.UserStore.user_data?.email_address;
      this.mobile_number = this.UserStore.user_data?.mobile_number;
      this.mobile_prefix = this.UserStore.user_data?.mobile_prefix;
      this.featured_url = this.UserStore.user_data?.featured_url;
      this.original_email_address =
        this.UserStore.user_data?.original_email_address;
      this.original_mobile_number =
        this.UserStore.user_data?.original_mobile_number;
    } else {
      this.getProfile();
    }
  },
  beforeUnmount() {
    this.UserStore.user_data = {
      first_name: this.first_name,
      last_name: this.last_name,
      email_address: this.email_address,
      mobile_number: this.mobile_number,
      mobile_prefix: this.mobile_prefix,
      featured_url: this.featured_url,
      original_email_address: this.original_email_address,
      original_mobile_number: this.original_mobile_number,
    };
  },
  computed: {
    hasData() {
      if (!APIinterface.empty(this.featured_url)) {
        return true;
      }
      return false;
    },
    hasPhoto() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    getProfile() {
      this.loading = true;
      APIinterface.fetchDataByToken("getProfile", "")
        .then((data) => {
          this.first_name = data.details.first_name;
          this.last_name = data.details.last_name;
          this.email_address = data.details.email_address;
          this.mobile_number = data.details.mobile_number;
          this.mobile_prefix = data.details.mobile_prefix;
          this.featured_url = data.details.avatar;

          this.original_email_address = this.email_address;
          this.original_mobile_number = this.mobile_number;
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    checkForm() {
      console.log("this.email_address", this.email_address);
      console.log("this.mobile_number", this.mobile_number);

      console.log("this.original_email_address", this.original_email_address);
      console.log("this.original_mobile_number", this.original_mobile_number);
      let _change = false;
      if (this.email_address !== this.original_email_address) {
        _change = true;
      }
      if (this.mobile_number !== this.original_mobile_number) {
        _change = true;
      }

      console.log("_change", _change);
      if (_change) {
        this.loading_submit = true;
        APIinterface.fetchDataByToken("RequestEmailCode")
          .then((data) => {
            this.otp_message = data.msg;
            this.$refs.verification.showModal(true);
          })
          .catch((error) => {
            APIinterface.notify("dark", error, "error_outline", this.$q);
          })
          .then((data) => {
            this.loading_submit = false;
          });
      } else {
        this.onSubmit();
      }
    },
    afterVerify(data) {
      this.otp = data;
      this.onSubmit();
    },
    onSubmit() {
      this.loading_submit = true;
      const params = {
        code: this.otp,
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        mobile_number: this.mobile_number,
        mobile_prefix: this.mobile_prefix,
        featured_filename: this.featured_filename,
        upload_path: this.upload_path,
        file_data: this.hadData() ? this.photo_data.data : "",
        image_type: this.hadData() ? this.photo_data.format : "",
      };
      APIinterface.fetchDataByToken("saveProfile", params)
        .then((data) => {
          this.$refs.verification.showModal(false);
          auth.setUser(data.details);
          APIinterface.notify("positive", data.msg, "check_circle", this.$q);

          let userData = auth.getUser();
          console.log("userData", userData);

          this.UserStore.user_data = {
            first_name: this.first_name,
            last_name: this.last_name,
            email_address: this.email_address,
            mobile_number: this.mobile_number,
            mobile_prefix: this.mobile_prefix,
            avatar: userData ? userData.avatar : "",
          };

          this.featured_url = userData ? userData.avatar : "";

          this.original_email_address = this.email_address;
          this.original_mobile_number = this.mobile_number;

          // Auto close page after successful save
          this.$router.back();
        })
        .catch((error) => {
          APIinterface.notify("negative", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading_submit = false;
        });
    },
    takePhoto() {
      if (this.$q.capacitor) {
        AppCamera.isCameraEnabled()
          .then((data) => {
            AppCamera.isFileAccessEnabled()
              .then((data) => {
                AppCamera.getPhoto(1)
                  .then((data) => {
                    this.photo_data = data;
                  })
                  .catch((error) => {
                    this.photo_data = [];
                  });
                //
              })
              .catch((error) => {
                APIinterface.notify("negative", error, "error", this.$q);
              });
            //
          })
          .catch((error) => {
            APIinterface.notify("negative", error, "error", this.$q);
          });
      } else {
        this.$refs.uploader_file.pickFiles();
      }
    },
    afterUploadfile(data) {
      this.featured_filename = data.filename;
      this.featured_url = data.url_image;
      this.upload_path = data.upload_path;
    },
    hadData() {
      if (Object.keys(this.photo_data).length > 0) {
        return true;
      }
      return false;
    },
    //
  },
};
</script>

<style scoped lang="scss">
// 🎨 Profile-Specific Styling (using global modern classes as base)
.profile-card {
  max-width: 500px;
  width: 100%;
}

// 📸 Profile Avatar Section
.profile-avatar-section {
  display: flex;
  justify-content: center;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 217, 61, 0.3);
  box-shadow: 0 8px 32px rgba(142, 68, 173, 0.2);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 217, 61, 0.5);
    box-shadow: 0 12px 40px rgba(142, 68, 173, 0.3);
  }
}

.camera-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.4);

  &:hover {
    transform: scale(1.1);
  }
}

// 📱 Responsive Design
@media (max-width: 600px) {
  .profile-card {
    margin: 10px;
    padding: 20px !important;
  }

  .profile-avatar {
    width: 100px;
    height: 100px;
  }

  .row.q-gutter-sm {
    flex-direction: column;

    .col {
      width: 100%;
    }
  }
}
</style>
