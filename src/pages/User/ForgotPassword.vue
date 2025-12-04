<template>
  <q-page class="modern-forgot-page">
    <!-- 🎨 Animated Background -->
    <div class="forgot-background"></div>

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

    <!-- 📱 Forgot Password Card -->
    <div class="forgot-container flex flex-center">
      <div class="forgot-card card-modern shadow-strong q-pa-lg">
        <!-- ✨ Welcome Header -->
        <div class="text-center q-mb-lg">
          <div class="welcome-icon q-mb-md">
            <div class="icon-wrapper bg-gradient-primary">
              <q-icon name="lock_reset" size="60px" color="white" />
            </div>
          </div>
          <div class="text-h5 text-weight-bold text-dark q-mb-xs">
            {{ $t("Forgot Password") }}
          </div>
          <div class="text-body2 text-grey-7 q-px-md">
            {{ $t("We need your registration email address to send your password reset code") }}
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

            <!-- 🚀 Send Reset Button -->
            <q-btn
              type="submit"
              size="lg"
              rounded
              unelevated
              no-caps
              color="accent-vibrant"
              text-color="white"
              class="full-width q-mt-lg forgot-btn"
              :loading="loading"
            >
              <div class="text-weight-bold text-body1">{{ $t("Send Reset Code") }}</div>
              <q-icon name="send" size="20px" class="q-ml-sm" />
            </q-btn>

            <!-- 📝 Back to Login Link -->
            <div class="text-center q-mt-lg">
              <span class="text-grey-7">{{ $t("Remember your password") }}?</span>
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
import APIinterface from "src/api/APIinterface";

export default {
  name: "ForgotPassword",
  data() {
    return {
      loading: false,
      email_address: "",
    };
  },
  methods: {
    onSubmit() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "requestResetPassword",
        "email_address=" + this.email_address
      )
        .then((data) => {
          this.$router.push({
            path: "/user/resetpassword",
            query: { msg: data.msg, uuid: data.details.uuid },
          });
        })
        .catch((error) => {
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
// 🎨 Modern Forgot Password Page Styles
.modern-forgot-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// 🌈 Theme-Aware Animated Background
.forgot-background {
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
    background: radial-gradient(circle at 25% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
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

// 📱 Forgot Password Container
.forgot-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 20px;
}

// 🎴 Forgot Password Card
.forgot-card {
  width: 100%;
  max-width: 420px;
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
.forgot-btn {
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
  .forgot-card {
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
}

// 🎭 Dark Mode Support
body.body--dark {
  .forgot-card {
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
