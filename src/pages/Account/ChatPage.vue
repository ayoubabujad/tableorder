<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header reveal>
      <q-toolbar>
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          :color="$q.dark.mode ? 'grey' : 'mygrey'"
          :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
        />
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md q-gutter-y-md">
      <q-card class="radius8 box-shadow0 bg-white q-pa-sm">
        <q-item>
          <q-item-section>
            <q-item-label class="text-weight-bold text-body1">{{
              $t("Live Chat")
            }}</q-item-label>
            <q-item-label caption>
              {{ $t("Let's chat and chase the blues") }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              round
              color="blue"
              icon="chat"
              :to="{
                path: '/account/chat/conversation',
                query: {
                  chat_type: 'order',
                  order_uuid: this.user_uuid,
                  order_id: '',
                  client_uuid: SettingStore.settings_data?.merchant_uuid,
                  name: SettingStore.settings_data?.restaurant_name,
                  first_name: SettingStore.settings_data?.restaurant_name,
                  last_name: '',
                  avatar: SettingStore.settings_data?.restaurant_logo,
                },
              }"
          /></q-item-section> </q-item
      ></q-card>

      <div>
        <NoData
          v-if="!hasData && !loading"
          :message="$t('No current conversation')"
          :subtitle="$t('Click chat button to start to chat with restaurant')"
        />
        <LoadingData page="1" v-if="loading"></LoadingData>

        <q-list>
          <q-virtual-scroll
            class="fit"
            :items="getData"
            :virtual-scroll-item-size="48"
            v-slot="{ item: items }"
          >
            <div class="hidden">{{ items }}</div>
            <q-item
              clickable
              :to="{
                path: '/account/chat/conversation',
                query: {
                  conversation_id: items.doc_id,
                },
              }"
            >
              <q-item-section avatar>
                <q-avatar v-if="items?.to_info">
                  <q-img
                    :src="items?.to_info?.photo"
                    loading="lazy"
                    fit="cover"
                    style="height: 50px; width: 50px"
                  >
                    <template v-slot:loading>
                      <q-skeleton
                        height="50px"
                        width="50px"
                        square
                        class="bg-grey-2"
                      />
                    </template>
                  </q-img>
                </q-avatar>
                <q-avatar v-else color="disabled" text-color="disabled"
                  >U</q-avatar
                >
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-text">
                  <template v-if="items?.to_info">
                    {{ items?.to_info?.first_name }}
                    {{ items?.to_info?.last_name }}
                  </template>
                </q-item-label>
                <q-item-label caption>
                  <template v-if="items?.orderID">
                    {{ $t("Order#") }} {{ items?.orderID }}
                  </template>
                  <template v-else>
                    <template v-if="items?.to_info">
                      {{ items?.to_info?.user_type }}
                    </template>
                  </template>
                </q-item-label>
                <q-item-label caption lines="2">
                  <template v-if="items?.is_typing">
                    <span class="text-red"> {{ $t("is typing") }} ...</span>
                  </template>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption>
                  {{ toReadableDate(items.lastUpdated) }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>
        </q-list>
      </div>

      <PageScrollUp></PageScrollUp>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";
import { firebaseDb, firebaseCollectionEnum } from "src/boot/FirebaseChat";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import auth from "src/api/auth";
import { date } from "quasar";
import { useSettingStore } from "stores/SettingStore";
import { useDataStore } from "src/stores/DataStore";

export default {
  name: "ChatPage",
  components: {
    LoadingData: defineAsyncComponent(() =>
      import("components/LoadingData.vue")
    ),
    NoData: defineAsyncComponent(() => import("components/NoData.vue")),
    PageScrollUp: defineAsyncComponent(() =>
      import("components/PageScrollUp.vue")
    ),
  },
  data() {
    return {
      search: "",
      is_search: false,
      awaitingSearch: false,
      search_data: null,
      user_uuid: null,
      unsubscribe: null,
      all_users: [],
      whoistyping_data: {},
      refresh_page: undefined,
      loading: false,
      user_data: null,
      create_loading: false,
      data: null,
      last_message_data: null,
      loading1: false,
    };
  },
  setup(props) {
    const SettingStore = useSettingStore();
    const DataStore = useDataStore();
    return { SettingStore, DataStore };
  },
  mounted() {
    let user = auth.getUser();
    this.user_data = user;
    this.user_uuid = user.client_uuid;

    if (this.DataStore.data?.chatData) {
      this.data = this.DataStore.data.chatData;
    } else {
      this.getParticipants();
    }
  },
  beforeUnmount() {
    this.DataStore.data.chatData = this.data;
  },
  computed: {
    getData() {
      if (!this.data) {
        return false;
      }
      return this.data;
    },
    hasData() {
      if (!this.data) {
        return false;
      }
      return this.data.length > 0;
    },
    getLastMessageData() {
      return this.last_message_data;
    },
  },
  methods: {
    refresh(done) {
      setTimeout(() => {
        done();
      }, 100);
      this.getParticipants();
    },
    getParticipants() {
      try {
        this.loading = true;
        this.data = [];
        this.last_message_data = {};
        const collectionRef = collection(
          firebaseDb,
          firebaseCollectionEnum.chats
        );

        const q = query(
          collectionRef,
          where("participants", "array-contains", this.user_uuid),
          orderBy("lastUpdated", "desc"),
          limit(firebaseCollectionEnum.limit)
        );

        this.unsubscribe = onSnapshot(q, (snapshot) => {
          if (!APIinterface.empty(this.refresh_page)) {
            this.refresh_page();
          }

          snapshot.docChanges().forEach((change) => {
            console.log("change.type", change.type);
            let data = change.doc.data();
            const docId = change.doc.id;

            let isTyping = data.isTyping || null;
            let participants = data.participants || null;

            if (Object.keys(participants).length > 0) {
              Object.entries(participants).forEach(([key, items]) => {
                this.all_users.push(items);
              });
            }

            let resp_participants = participants.filter(
              (i) => !i.includes(this.user_uuid)
            );
            let user_uuid = resp_participants[0] ? resp_participants[0] : null;

            let matchedInfo = null;
            let from_info = data.from_info || null;
            let to_info = data.to_info || null;
            if (from_info?.client_uuid === this.user_uuid) {
              matchedInfo = to_info;
            } else if (to_info?.client_uuid === this.user_uuid) {
              matchedInfo = from_info;
            }

            const docData = {
              doc_id: docId,
              user_uuid: user_uuid,
              is_typing: isTyping[resp_participants[0]]
                ? isTyping[resp_participants[0]]
                : false,
              orderID: data.orderID || null,
              orderUuid: data.orderUuid || null,
              lastUpdated: data.lastUpdated || null,
              to_info: matchedInfo,
            };

            if (change.type === "added") {
              this.data.unshift(docData);
            } else if (change.type === "modified") {
              const index = this.data.findIndex(
                (chat) => chat.doc_id === docId
              );
              if (index !== -1) {
                this.data[index] = { ...docData, doc_id: docId };
              }
            } else if (change.type === "removed") {
              const index = this.data.findIndex(
                (chat) => chat.doc_id === docId
              );
              if (index !== -1) {
                this.data.splice(index, 1);
              }
            }
          });

          if (this.data) {
            this.data.sort((a, b) => {
              const aTimestamp =
                (a.lastUpdated?.seconds || 0) * 1000 +
                (a.lastUpdated?.nanoseconds || 0) / 1000000;
              const bTimestamp =
                (b.lastUpdated?.seconds || 0) * 1000 +
                (b.lastUpdated?.nanoseconds || 0) / 1000000;
              return bTimestamp - aTimestamp;
            });

            //this.getLastMessage();
          }

          this.loading = false;
        });
      } catch (error) {
        APIinterface.notify("dark", error, "error", this.$q);
      }
    },
    async getLastMessage() {
      try {
        this.loading1 = true;
        if (Object.keys(this.all_users).length > 0) {
          const batch = this.all_users.splice(0, 10);
          const conversationsRef = collection(
            firebaseDb,
            firebaseCollectionEnum.chats
          );
          const querySnapshot = await getDocs(
            query(
              conversationsRef,
              where("participants", "array-contains-any", batch)
            )
          );
          querySnapshot.forEach(async (doc) => {
            const conversationID = doc.id;
            const messagesRef = collection(
              firebaseDb,
              firebaseCollectionEnum.chats,
              conversationID,
              "messages"
            );
            const messagesSnapshot = await getDocs(
              query(
                messagesRef,
                where("senderID", "in", batch),
                orderBy("timestamp", "desc"),
                limit(1)
              )
            );
            messagesSnapshot.forEach((messageDoc) => {
              let results = messageDoc.data();
              let timestamp = results.timestamp.toDate().toISOString();
              this.last_message_data[conversationID] = {
                message: results.message,
                timestamp: timestamp,
                time: date.formatDate(timestamp, "hh:mm a"),
              };
            });
            this.loading1 = false;
          });
        }
      } catch (error) {
        this.loading1 = false;
        console.error("Error fetching last message:", error);
      }
    },
    toReadableDate(ts) {
      if (!ts) return "";

      const millis = ts.seconds * 1000 + ts.nanoseconds / 1e6;
      const date = new Date(millis);
      const now = new Date();

      // Difference in milliseconds
      const diff = now - date;

      // If less than 1 minute → show "Just now"
      if (diff < 60 * 1000) {
        return "Just now";
      }

      // Otherwise → show like "18 Dec"
      return new Intl.DateTimeFormat("en", {
        day: "2-digit",
        month: "short",
      }).format(date);
    },
  },
};
</script>
