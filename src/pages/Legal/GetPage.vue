<template>
  <q-pull-to-refresh @refresh="refresh">
    <!-- 🎨 Theme Header -->
    <q-header class="ht-header">
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          class="ht-btn-ghost"
        />
        <q-toolbar-title class="text-weight-bold text-white">
          <template v-if="hasData">
            {{ data.title }}
          </template>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page
      class="ht-page q-pa-md"
      :class="{ 'flex flex-center': !hasData && !loading }"
    >
      <div class="ht-card q-pa-md">
        <div class="text-body2 ht-text-primary">
          <span v-html="data.long_content"></span>
        </div>
      </div>

      <div v-if="!hasData && !loading" class="full-width text-center">
        <div class="ht-empty-state">
          <div class="ht-empty-icon">
            <q-icon name="o_article" />
          </div>
          <div class="ht-empty-title">{{ $t("No available data") }}</div>
          <div class="ht-empty-subtitle">{{ $t("pull down to refresh") }}</div>
        </div>
      </div>

      <q-inner-loading
        :showing="loading"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "GetPage",
  data() {
    return {
      data: [],
      loading: false,
      page_id: "",
    };
  },
  created() {
    this.page_id = this.$route.query.page_id;
    this.getPage(null);
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
    refresh(done) {
      this.getPage(done);
    },
    getPage(done) {
      this.loading = true;
      APIinterface.fetchDataPost("getPage2", "page_id=" + this.page_id)
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
          if (!APIinterface.empty(done)) {
            done();
          }
        });
    },
  },
};
</script>
