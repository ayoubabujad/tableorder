<template>
  <q-page class="modern-login-page">
    <!-- 🎨 Animated Background -->
    <div class="login-background"></div>

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

    <!-- 📱 Login Card -->
    <div class="login-container flex flex-center">
      <div class="login-card card-modern shadow-strong q-pa-lg">
        <!-- ✨ Welcome Header -->
        <div class="text-center q-mb-lg">
          <div class="welcome-icon q-mb-md">
            <div class="icon-wrapper bg-gradient-primary">
              <q-icon name="account_circle" size="60px" color="white" />
            </div>
          </div>
          <div class="text-h5 text-weight-bold text-dark q-mb-xs">
            {{ $t("Let's Sign You In") }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ $t("Welcome back! You've been missed") }}
          </div>
        </div>

        <div class="full-width">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- 📧 Email Input -->
          <q-input
            v-model="email_address"
            :label="$t('Email address')"
            filled
            color="accent-vibrant"
            class="modern-input"
            :rules="[
              (val, rules) =>
                rules.email(val) || this.$t('Please enter a valid email address'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="accent-vibrant" />
            </template>
          </q-input>

          <!-- 🔒 Password Input -->
          <q-input
            v-model="password"
            :type="field_type"
            :label="$t('Password')"
            filled
            color="accent-vibrant"
            class="modern-input"
            :rules="[
              (val) =>
                (val && val.length > 0) || this.$t('This field is required'),
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="accent-vibrant" />
            </template>
            <template v-slot:append>
              <q-icon
                @click="
                  this.field_type =
                    this.field_type == 'password' ? 'text' : 'password'
                "
                :name="
                  this.field_type == 'password'
                    ? 'visibility_off'
                    : 'visibility'
                "
                color="accent-vibrant"
                class="cursor-pointer"
              />
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

          <!-- 🔗 Forgot Password -->
          <div class="text-center q-mt-sm">
            <q-btn
              flat
              no-caps
              class="text-accent-vibrant text-weight-bold"
              to="/user/forgotpassword"
            >
              {{ $t("Forgot Password") }}?
            </q-btn>
          </div>

          <!-- 🚀 Login Button -->
          <q-btn
            type="submit"
            size="lg"
            rounded
            unelevated
            no-caps
            color="accent-vibrant"
            text-color="white"
            class="full-width q-mt-md login-btn"
            :loading="loading"
          >
            <div class="text-weight-bold text-body1">{{ $t("Login") }}</div>
            <q-icon name="arrow_forward" size="20px" class="q-ml-sm" />
          </q-btn>

          <!-- 👤 Guest Button -->
          <template v-if="SettingStore.settings_data.enabled_guest">
            <q-btn
              size="lg"
              rounded
              unelevated
              no-caps
              class="full-width q-mt-sm guest-btn"
              color="secondary-vibrant"
              text-color="dark"
              :to="{ path: '/user/guest', query: { redirect: this.redirect } }"
            >
              <q-icon name="person_outline" size="20px" class="q-mr-xs" />
              <div class="text-weight-bold text-body2">
                {{ $t("Continue as guest") }}
              </div>
            </q-btn>
          </template>

          <!-- 📝 Sign Up Link -->
          <div class="text-center q-mt-lg">
            <span class="text-grey-7">{{ $t("Don't have an account") }}?</span>
            <q-btn
              flat
              no-caps
              class="text-accent-vibrant text-weight-bold"
              to="/user/signup"
            >
              {{ $t("Sign up") }}
            </q-btn>
          </div>

          <!-- 🌐 Social Login -->
          <SocialLogin :redirect="redirect" class="q-mt-md"></SocialLogin>
        </q-form>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import auth from "src/api/auth";
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { usePusherStore } from "src/stores/PusherStore";
import { useDataStore } from "src/stores/DataStore";
import { useAuthStore } from "src/stores/AuthStore";

export default {
  name: "LoginPage",
  components: {
    SocialLogin: defineAsyncComponent(() =>
      import("components/SocialLogin.vue")
    ),
    componentsRecaptcha: defineAsyncComponent(() =>
      import("components/componentsRecaptcha.vue")
    ),
  },
  data() {
    return {
      loading: false,
      email_address: "",
      password: "",
      field_type: "password",
      password_icon: "las la-low-vision",
      recaptcha_response: "",
      redirect: "",
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    const PusherStore = usePusherStore();
    const DataStore = useDataStore();
    const AuthStore = useAuthStore();
    return {
      SettingStore,
      DataStorePersisted,
      PusherStore,
      DataStore,
      AuthStore,
    };
  },
  mounted() {
    this.redirect = this.$route.query.redirect;
    if (auth.authenticated()) {
      this.$router.push("/home");
    }
  },
  methods: {
    refresh() {},
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
      APIinterface.fetchDataPost("userLogin", {
        username: this.email_address,
        password: this.password,
        recaptcha_response: this.recaptcha_response,
      })
        .then((data) => {
          auth.setUser(data.details.user_data);
          auth.setToken(data.details.user_token);
          this.AuthStore.isLogin = true;
          if (!APIinterface.empty(this.redirect)) {
            this.$router.push(this.redirect);
          } else {
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
// 🎨 Modern Login Page Styles
.modern-login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// 🌈 Theme-Aware Animated Background
.login-background {
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
    background: radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
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

// 📱 Login Container
.login-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 20px;
}

// 🎴 Login Card
.login-card {
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

// 🎯 Theme-Aware Button Styling
.login-btn {
  background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-accent) 100%) !important;
  box-shadow: var(--ht-shadow-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
}

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
  .login-card {
    padding: 24px 20px !important;
    border-radius: 20px;
  }

  .welcome-icon .icon-wrapper {
    width: 80px;
    height: 80px;

    .q-icon {
      font-size: 50px !important;
    }
  }
}

// 🎭 Dark Mode Support
body.body--dark {
  .login-card {
    background: linear-gradient(135deg,
      rgba(42, 42, 58, 0.95) 0%,
      rgba(46, 41, 78, 0.9) 50%,
      rgba(52, 44, 88, 0.95) 100%);
    border-color: rgba(142, 68, 173, 0.4);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);

    &::before {
      background: radial-gradient(circle, rgba(255, 217, 61, 0.1) 0%, transparent 70%);
    }
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
