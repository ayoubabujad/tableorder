<template>
  <q-page class="table-entry-page">
    <!-- Animated Background -->
    <div class="table-bg"></div>

    <div class="table-content flex flex-center">
      <div class="table-card card-modern q-pa-xl text-center">
        <!-- Loading State -->
        <template v-if="loading">
          <q-spinner-dots color="primary" size="60px" />
          <div class="text-h6 q-mt-lg">{{ $t("Setting up your table...") }}</div>
        </template>

        <!-- Success State -->
        <template v-else-if="tableReady">
          <div class="table-icon q-mb-lg">
            <div class="icon-circle bg-gradient-primary">
              <q-icon name="table_restaurant" size="64px" color="white" />
            </div>
          </div>

          <div class="text-h4 text-weight-bold q-mb-sm">
            {{ tableName }}
          </div>

          <div class="text-body1 text-grey-7 q-mb-xl">
            {{ $t("Scan successful! Ready to order.") }}
          </div>

          <q-btn
            unelevated
            rounded
            color="primary"
            size="lg"
            class="full-width q-mb-md"
            no-caps
            @click="startOrdering"
          >
            <q-icon name="restaurant_menu" class="q-mr-sm" />
            <span class="text-weight-bold">{{ $t("View Menu") }}</span>
          </q-btn>

          <div class="text-caption text-grey-6 q-mt-lg">
            {{ $t("Your order will be delivered to your table") }}
          </div>
        </template>

        <!-- Error State -->
        <template v-else-if="error">
          <q-icon name="error_outline" size="64px" color="negative" />
          <div class="text-h6 q-mt-lg text-negative">{{ error }}</div>
          <q-btn
            flat
            color="primary"
            class="q-mt-md"
            @click="retry"
            no-caps
          >
            {{ $t("Try Again") }}
          </q-btn>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "TableEntry",
  data() {
    return {
      loading: true,
      tableReady: false,
      error: null,
      tableId: null,
      tableName: null,
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    return { DataStorePersisted, SettingStore };
  },
  mounted() {
    this.initializeTable();
  },
  methods: {
    async initializeTable() {
      try {
        this.loading = true;
        this.error = null;

        // Get table UUID from route params or query
        const tableUuid = this.$route.params.uuid || this.$route.query.table;

        // Validate table UUID
        if (!tableUuid) {
          throw new Error(this.$t("Invalid table code"));
        }

        this.tableId = tableUuid;

        // TODO: Fetch table info from backend
        // const tableInfo = await this.fetchTableInfo(tableUuid);
        // this.tableName = tableInfo.table_name;

        // Get optional table name from query (fallback)
        const queryName = this.$route.query.name;
        this.tableName = queryName || `Table`;

        // Set table order mode in store
        this.DataStorePersisted.setTableOrder(
          tableUuid,      // table_uuid
          this.tableName, // table_name (will be updated from API)
          tableUuid       // table_uuid for API calls
        );

        // Small delay for visual feedback
        await new Promise((resolve) => setTimeout(resolve, 800));

        this.tableReady = true;
      } catch (err) {
        this.error = err.message || this.$t("Failed to initialize table");
      } finally {
        this.loading = false;
      }
    },

    startOrdering() {
      this.$router.push("/home");
    },

    retry() {
      this.initializeTable();
    },
  },
};
</script>

<style lang="scss" scoped>
.table-entry-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.table-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-secondary) 50%, var(--ht-accent) 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: 0;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.table-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 20px;
}

.table-card {
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.table-icon {
  display: flex;
  justify-content: center;
}

.icon-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, var(--ht-primary) 0%, var(--ht-accent) 100%);
}
</style>
