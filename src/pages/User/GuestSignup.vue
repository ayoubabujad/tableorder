<template>
  <q-page class="modern-guest-page">
    <!-- 🎨 Animated Background -->
    <div class="guest-background"></div>

    <!-- 🔙 Back Button -->
    <div class="back-btn-container q-pa-md">
      <q-btn
        @click="$router.back()"
        round
        size="md"
        icon="arrow_back"
        class="btn-glass shadow-soft"
      />
    </div>

    <!-- 👤 Guest Signup Card -->
    <div class="guest-container flex flex-center">
      <div class="guest-card card-modern shadow-strong q-pa-lg">
        <!-- ✨ Welcome Header -->
        <div class="text-center q-mb-lg">
          <div class="welcome-icon q-mb-md">
            <div class="icon-wrapper bg-gradient-primary">
              <q-icon name="person_outline" size="60px" color="white" />
            </div>
          </div>
          <div class="text-h5 text-weight-bold text-dark q-mb-xs">
            {{ $t("Continue as Guest") }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ $t("Quick checkout without creating an account") }}
          </div>
        </div>

        <div v-if="page_ready" class="full-width">
          <q-form @submit="onSubmit" class="q-gutter-md">
            <!-- 👤 Required Guest Information -->
            <div class="row q-gutter-sm q-mb-md">
              <div class="col">
                <q-input
                  v-model="first_name"
                  :label="$t('First name')"
                  filled
                  color="accent-vibrant"
                  class="modern-input"
                  :rules="[
                    (val) => (val && val.length > 0) || this.$t('This field is required'),
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
                    (val) => (val && val.length > 0) || this.$t('This field is required'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="person_outline" color="accent-vibrant" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- 📱 Phone Number -->
            <q-input
              v-model="mobile_number"
              :label="$t('Mobile number')"
              filled
              color="accent-vibrant"
              class="modern-input"
              :prefix="SettingStore.settings_data.phone_data.phonecode"
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

            <!-- 🤖 Recaptcha -->
            <div class="scroll q-mt-md">
              <componentsRecaptcha
                ref="recapcha"
                :sitekey="SettingStore.settings_data.captcha_site_key"
                :is_enabled="SettingStore.settings_data.captcha_enabled"
                :language_code="SettingStore.settings_data.captcha_lang"
                size="normal"
                theme="light"
                :tabindex="0"
                @verify="recaptchaVerified"
                @expire="recaptchaExpired"
                @fail="recaptchaFailed"
              />
            </div>

            <!-- 📜 Terms and Conditions -->
            <template v-if="SettingStore.settings_data.signup_enabled_terms">
              <div
                class="text-caption q-mt-md q-pa-sm bg-grey-1 radius8"
                v-html="SettingStore.settings_data.signup_terms"
              ></div>
            </template>

            <!-- 🚀 Continue Button -->
            <q-btn
              type="submit"
              size="lg"
              rounded
              unelevated
              no-caps
              color="secondary-vibrant"
              text-color="dark"
              class="full-width q-mt-lg guest-btn"
              :loading="loading"
            >
              <div class="text-weight-bold text-body1">{{ $t("Continue as Guest") }}</div>
              <q-icon name="arrow_forward" size="20px" class="q-ml-sm" />
            </q-btn>

            <!-- 📝 Login Link -->
            <div class="text-center q-mt-lg">
              <span class="text-grey-7">{{ $t("Have an account") }}?</span>
              <q-btn
                flat
                no-caps
                class="text-accent-vibrant text-weight-bold"
                to="/user/login"
              >
                {{ $t("Sign in") }}
              </q-btn>
            </div>
          </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";

export default {
  name: "GuestSignup",
  components: {
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  data() {
    return {
      loading: false,
      first_name: "",
      last_name: "",
      email_address: "",
      mobile_number: "",
      mobile_prefix: "",
      password: "",
      cpassword: "",
      field_type: "password",
      password_icon: "las la-low-vision",
      recaptcha_response: "",
      page_ready: false,
    };
  },
  mounted() {
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
        }
      );
    }
  },
  methods: {
    recaptchaVerified(response) {
      this.recaptcha_response = response;
    },
    recaptchaExpired() {
      if (this.SettingStore.settings_data.captcha_enabled) {
        this.$refs.recapcha.reset();
      }
    },
    recaptchaFailed() {},
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost("registerGuest", {
        first_name: this.first_name,
        last_name: this.last_name,
        email_address: this.email_address,
        mobile_prefix: this.SettingStore.settings_data.phone_data.phonecode,
        mobile_number: this.mobile_number,
        password: this.password,
        cpassword: this.cpassword,
        recaptcha_response: this.recaptcha_response,
      })
        .then((data) => {
          if (data.details.verify === true) {
            this.$router.push({
              path: "/user/verifycode",
              query: { uuid: data.details.uuid, msg: data.msg },
            });
          } else {
            auth.setUser(data.details.user_data);
            auth.setToken(data.details.user_token);
            this.DataStorePersisted.user_settings = data.details.user_settings;
            this.$router.push("/home");
          }
        })
        .catch((error) => {
          this.recaptchaExpired();
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>

<style scoped lang="scss">
// 🎨 Modern Guest Page Styles
.modern-guest-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// 🌈 Theme-Aware Animated Background
.guest-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-secondary) 50%, var(--ht-accent) 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 60% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
    animation: float 8s ease-in-out infinite;
  }
}

// 🔙 Back Button Container
.back-btn-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

// 👤 Guest Container
.guest-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 20px;
}

// 🎴 Guest Card
.guest-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

// ✨ Welcome Icon
.welcome-icon {
  display: flex;
  justify-content: center;

  .icon-wrapper {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-accent) 100%);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    animation: float 3s ease-in-out infinite;
  }
}

// 📝 Theme-Aware Input Styling
.modern-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    background: var(--ht-accent-light);
    border: 2px solid var(--ht-primary-light);

    &:before {
      border: none;
    }
  }

  :deep(.q-field__control:hover) {
    background: var(--ht-surface);
    border-color: var(--ht-primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  :deep(.q-field--focused .q-field__control) {
    background: var(--ht-surface);
    border-color: var(--ht-accent);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  :deep(.q-field__native) {
    font-weight: 600;
    color: var(--ht-text);
  }

  :deep(.q-field__label) {
    color: var(--ht-primary);
    font-weight: 600;
  }

  :deep(.q-icon) {
    color: var(--ht-primary);
  }
}

// 🎯 Theme-Aware Guest Button Styling
.guest-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  color: var(--ht-primary) !important;
  box-shadow: var(--ht-shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 1) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }

  .q-icon, div {
    color: var(--ht-primary) !important;
  }
}

// ✨ Animations
@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(2deg);
  }
}

// 📱 Responsive Design
@media (max-width: 600px) {
  .guest-card {
    padding: 24px 20px !important;
    border-radius: 20px;
    max-width: 100%;
  }

  .welcome-icon .icon-wrapper {
    width: 80px;
    height: 80px;

    .q-icon {
      font-size: 50px !important;
    }
  }

  .row.q-gutter-sm {
    flex-direction: column;

    .col {
      width: 100%;
    }
  }

}

// 🎭 Dark Mode Support
body.body--dark {
  .guest-card {
    background: rgba(42, 42, 58, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .modern-input {
    :deep(.q-field__control) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(142, 68, 173, 0.3);
    }

    :deep(.q-field__control:hover) {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(142, 68, 173, 0.5);
    }

    :deep(.q-field__native) {
      color: rgba(255, 255, 255, 0.9);
    }

    :deep(.q-field__label) {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
