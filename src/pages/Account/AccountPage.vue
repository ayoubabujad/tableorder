<template>
  <q-page class="modern-account-page">
    <!-- 🌟 Premium Profile Header with Gradient -->
    <div class="profile-header bg-gradient-primary q-pa-lg q-mb-md radius16 shadow-primary">
      <div class="flex column items-center q-gutter-sm">
        <div class="profile-avatar-container">
          <q-img
            :src="getProfile?.avatar ? getProfile?.avatar : avatar"
            style="height: 90px; width: 90px"
            loading="lazy"
            fit="cover"
            class="profile-avatar"
          >
            <template v-slot:loading>
              <q-skeleton height="90px" width="90px" type="circle" />
            </template>
          </q-img>
          <div class="avatar-badge bg-accent-vibrant">
            <q-icon name="verified" color="white" size="16px" />
          </div>
        </div>

        <div class="text-h6 text-weight-bold text-dark">
          {{ is_guest ? $t("Guest") : getProfile?.first_name }}
        </div>

        <div v-if="!is_guest" class="text-caption text-dark" style="opacity: 0.8;">
          {{ getProfile?.email_address }}
        </div>

        <div v-if="!is_guest && getProfile?.contact_number" class="text-caption text-dark" style="opacity: 0.8;">
          {{ getProfile?.contact_number }}
        </div>

        <q-btn
          unelevated
          no-caps
          class="btn-gradient-secondary q-mt-sm q-px-lg radius50"
          to="/account/update-profile"
        >
          <q-icon name="edit" size="18px" class="q-mr-xs" />
          <span class="text-weight-bold">{{ $t("Edit Profile") }}</span>
        </q-btn>
      </div>
    </div>

    <!-- 🔐 Account & Security Section -->
    <div class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Account & Security") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item clickable to="/account/change-password" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);">
                <q-icon name="lock" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Change Password") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Update your password") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- 📦 Bookings Section -->
    <div v-if="SettingStore.settings_data.booking_enabled" class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Bookings") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item
            clickable
            to="/account/booking"
            class="modern-menu-item"
          >
            <q-item-section avatar>
              <div class="menu-icon-wrapper bg-gradient-success">
                <q-icon name="table_restaurant" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Bookings") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Manage reservations") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>


    <!-- 📍 Preferences Section -->
    <div class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Preferences") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item clickable to="/account/address-list" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);">
                <q-icon name="location_on" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Addresses") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Manage delivery addresses") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item clickable to="/account/favorites" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #E84393 0%, #C0356B 100%);">
                <q-icon name="favorite" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Favorites") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Your saved items") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item tag="label" clickable @click="showNotificationSettings" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);">
                <q-icon name="notifications" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Notifications") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Configure alerts") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <template v-if="SettingStore.settings_data.chat_enabled">
            <q-separator inset />

            <q-item
              clickable
              to="/account/chat"
              class="modern-menu-item"
            >
              <q-item-section avatar>
                <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #27AE60 0%, #229954 100%);">
                  <q-icon name="chat" color="white" size="22px" />
                </div>
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ $t("Live Chat") }}</q-item-label>
                <q-item-label caption class="text-caption">{{ $t("Get instant support") }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>
    </div>

    <!-- ⚙️ Settings Section -->
    <div class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Settings") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item
            v-if="SettingStore.settings_data.enabled_language"
            clickable
            to="/account/language"
            class="modern-menu-item"
          >
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #3498DB 0%, #2980B9 100%);">
                <q-icon name="language" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Language") }}</q-item-label>
              <q-item-label caption class="text-caption">
                <template v-for="lang in getLanguageData" :key="lang">
                  <template v-if="lang.code == this.DataStorePersisted.app_language">
                    {{ lang.title }}
                  </template>
                </template>
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <q-separator v-if="SettingStore.settings_data.multicurrency_enabled && SettingStore.settings_data.enabled_language" inset />

          <q-item
            v-if="SettingStore.settings_data.multicurrency_enabled"
            clickable
            to="/account/currency"
            class="modern-menu-item"
          >
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #F39C12 0%, #E67E22 100%);">
                <q-icon name="payments" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Currency") }}</q-item-label>
              <q-item-label caption class="text-caption">
                {{ this.DataStorePersisted.use_currency_code }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- ℹ️ Information Section -->
    <div class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Information") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item clickable to="/about" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #34495E 0%, #2C3E50 100%);">
                <q-icon name="info" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("About") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("App information") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <q-separator inset />

          <q-item clickable to="/legal" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #7F8C8D 0%, #95A5A6 100%);">
                <q-icon name="gavel" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Legal") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Terms & Privacy") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <!-- ⚠️ Danger Zone -->
    <div class="menu-section q-mb-md">
      <div class="section-title q-px-md q-mb-sm">
        <div class="text-weight-bold text-body2 text-grey-7">{{ $t("Account Management") }}</div>
      </div>
      <div class="menu-card card-modern q-pa-xs">
        <q-list class="modern-menu-list">
          <q-item clickable to="/account/request-delete" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #E74C3C 0%, #C0392B 100%);">
                <q-icon name="delete_forever" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-negative">{{ $t("Delete account") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Permanently remove account") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>

          <q-separator v-if="!is_guest" inset />

          <q-item v-if="!is_guest" clickable @click="logout" class="modern-menu-item">
            <q-item-section avatar>
              <div class="menu-icon-wrapper" style="background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);">
                <q-icon name="logout" color="white" size="22px" />
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ $t("Logout") }}</q-item-label>
              <q-item-label caption class="text-caption">{{ $t("Sign out from your account") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" size="sm" color="accent-vibrant" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>

    <div class="q-pa-md text-center text-caption text-grey-6">
      <div>{{ $t("Version") }} 1.0.0</div>
    </div>

    <ConfirmDialog
      ref="logout_dialog"
      :data="{
        title: this.$t('Logout'),
        subtitle: this.$t('Are you sure you want to logout?'),
        confirm: this.$t('Yes'),
        cancel: this.$t('Cancel'),
      }"
      @after-confirm="afterConfirm"
    >
    </ConfirmDialog>

    <PushSettings ref="ref_push"></PushSettings>
  </q-page>
</template>

<script>
import auth from "src/api/auth";
import { defineAsyncComponent } from "vue";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { useDataStore } from "src/stores/DataStore";
import { usePusherStore } from "src/stores/PusherStore";
import { useAuthStore } from "src/stores/AuthStore";

export default {
  name: "AccountPage",
  components: {
    ConfirmDialog: defineAsyncComponent(() =>
      import("components/ConfirmDialog.vue")
    ),
    PushSettings: defineAsyncComponent(() =>
      import("components/PushSettings.vue")
    ),
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    const PusherStore = usePusherStore();
    const AuthStore = useAuthStore();
    return {
      DataStorePersisted,
      SettingStore,
      DataStore,
      PusherStore,
      AuthStore,
    };
  },
  data() {
    return {
      knob: 71,
      notification: false,
      avatar: "/user@2x.png",
      language: "",
      user: [],
      is_guest: true,
    };
  },
  mounted() {
    this.DataStore.show_toobar = false;
    this.DataStore.data.page_title = this.$t("Account");

    if (auth.authenticated()) {
      this.is_guest = false;
      this.getCurrentProfile();
      this.language = this.DataStorePersisted.app_language;
    } else {
      this.is_guest = true;
    }
  },
  computed: {
    getLanguageData() {
      if (Object.keys(this.SettingStore.settings_data).length > 0) {
        return this.SettingStore.settings_data.language_list.list;
      }
      return false;
    },
    getProfile() {
      return auth.getUser();
    },
  },
  methods: {
    showNotificationSettings() {
      if (this.is_guest) {
        this.$router.push({
          path: "/user/login",
          query: { redirect: "/account-menu" },
        });
      } else {
        this.$refs.ref_push.modal = true;
      }
    },
    getCurrentProfile() {
      this.user = auth.getUser();
    },
    logout() {
      this.$refs.logout_dialog.dialog = true;
    },
    afterConfirm() {
      auth.logout();
      this.DataStorePersisted.alert_count = 0;
      this.DataStorePersisted.chat_count = 0;
      this.DataStore.data = [];
      this.AuthStore.isLogin = false;
      this.AuthStore.logout_account = this.user?.client_uuid;
      this.$router.push("/home");
    },
    //
  },
};
</script>

<style scoped lang="scss">
// 🎨 Modern Account Page Styles
.modern-account-page {
  padding: 16px;
  background: linear-gradient(180deg, #FFF9C4 0%, #FFFFFF 40%);
  min-height: 100vh;
}

// 🌟 Profile Header Styles
.profile-header {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
  }
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
}

.avatar-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #FFD93D;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

// 📑 Menu Sections
.menu-section {
  .section-title {
    margin-bottom: 8px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    font-size: 11px;
  }
}

.menu-card {
  background: white;
  overflow: hidden;
  margin: 0 4px;
}

// 🎯 Modern Menu List Items
.modern-menu-list {
  padding: 0;
}

.modern-menu-item {
  padding: 14px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 4px;
    background: linear-gradient(135deg, #FFD93D 0%, #8E44AD 100%);
    transform: scaleY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background: linear-gradient(90deg, rgba(255, 217, 61, 0.05) 0%, rgba(142, 68, 173, 0.05) 100%);
    transform: translateX(4px);

    &::before {
      transform: scaleY(1);
    }

    .menu-icon-wrapper {
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
  }

  &:active {
    transform: translateX(2px);
  }
}

// 🎨 Menu Icon Wrapper
.menu-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

// ✨ Floating Animation
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

// 🌊 Pulse Animation for Important Items
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

// 📱 Responsive Design
@media (max-width: 600px) {
  .modern-account-page {
    padding: 12px;
  }

  .profile-header {
    padding: 20px !important;
  }

  .menu-icon-wrapper {
    width: 40px;
    height: 40px;
  }
}

// 🎭 Dark Mode Support
body.body--dark {
  .modern-account-page {
    background: linear-gradient(180deg, #1A1A2E 0%, #0F0F1E 40%);
  }

  .menu-card {
    background: #2C2C3E;
  }

  .modern-menu-item:hover {
    background: linear-gradient(90deg, rgba(255, 217, 61, 0.1) 0%, rgba(142, 68, 173, 0.1) 100%);
  }

  .section-title {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}
</style>
