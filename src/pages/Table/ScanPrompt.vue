<template>
  <q-page class="scan-prompt-page">
    <div class="scan-container">
      <!-- Logo/Icon -->
      <div class="scan-icon">
        <q-icon name="qr_code_scanner" size="80px" />
      </div>

      <!-- Title -->
      <h1 class="scan-title">{{ $t("Scan QR Code") }}</h1>

      <!-- Description -->
      <p class="scan-description">
        {{ $t("Please scan the QR code on your table to start ordering") }}
      </p>

      <!-- Visual Guide -->
      <div class="scan-guide">
        <div class="guide-step">
          <div class="step-number">1</div>
          <div class="step-text">{{ $t("Find the QR code on your table") }}</div>
        </div>
        <div class="guide-step">
          <div class="step-number">2</div>
          <div class="step-text">{{ $t("Open your phone camera") }}</div>
        </div>
        <div class="guide-step">
          <div class="step-number">3</div>
          <div class="step-text">{{ $t("Scan and start ordering") }}</div>
        </div>
      </div>

      <!-- Restaurant Info -->
      <div class="restaurant-info" v-if="restaurantName">
        <q-icon name="restaurant" size="20px" />
        <span>{{ restaurantName }}</span>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "ScanPrompt",
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  computed: {
    restaurantName() {
      return this.SettingStore.settings_data?.merchant_name || "";
    },
  },
};
</script>

<style scoped>
.scan-prompt-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-primary-dark) 100%);
  padding: 24px;
}

.scan-container {
  text-align: center;
  color: white;
  max-width: 320px;
}

.scan-icon {
  width: 120px;
  height: 120px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 32px;
  backdrop-filter: blur(10px);
}

.scan-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px;
}

.scan-description {
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 40px;
  line-height: 1.5;
}

.scan-guide {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
}

.guide-step {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
}

.guide-step:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.step-number {
  width: 32px;
  height: 32px;
  background: white;
  color: var(--ht-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-text {
  font-size: 14px;
  text-align: left;
}

.restaurant-info {
  margin-top: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0.8;
  font-size: 14px;
}
</style>
