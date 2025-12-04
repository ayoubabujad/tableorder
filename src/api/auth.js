import { api } from "boot/axios";
import { LocalStorage, SessionStorage } from "quasar";
import jwtDecode from "jwt-decode";

const CLIENT_IDENTITY = "single_client_identity";
const CLIENT_TOKEN = "single_client_token";
const CLIENT_SETTINGS = "single_user_settings";

const auth = {
  authenticated() {
    if (this.getToken()) {
      return true;
    }
    return false;
  },

  setUser(user) {
    LocalStorage.set(CLIENT_IDENTITY, user);
  },

  getUser() {
    if (LocalStorage.has(CLIENT_IDENTITY)) {
      const $data = LocalStorage.getItem(CLIENT_IDENTITY);
      if (!this.empty($data)) {
        if (Object.keys($data).length > 0) {
          try {
            return jwtDecode($data);
          } catch (err) {
            return false;
          }
        }
      }
    }
    return false;
  },

  getUserToken() {
    if (LocalStorage.has(CLIENT_TOKEN)) {
      const $data = LocalStorage.getItem(CLIENT_TOKEN);
      if (!this.empty($data)) {
        if (Object.keys($data).length > 0) {
          try {
            return jwtDecode($data);
          } catch (err) {
            return false;
          }
        }
      }
    }
    return false;
  },

  setToken(token) {
    LocalStorage.set(CLIENT_TOKEN, token);
  },

  getToken() {
    if (LocalStorage.has(CLIENT_TOKEN)) {
      const $data = LocalStorage.getItem(CLIENT_TOKEN);
      if (!this.empty($data)) {
        return $data;
      }
    }
    return false;
  },

  setStorage(storage_name, data) {
    LocalStorage.set(storage_name, data);
  },

  getStorage(storage_name) {
    if (LocalStorage.has(storage_name)) {
      const $data = LocalStorage.getItem(storage_name);
      if (!this.empty($data)) {
        return $data;
      }
    }
    return false;
  },

  logout() {
    LocalStorage.remove(CLIENT_TOKEN);
    LocalStorage.remove(CLIENT_IDENTITY);
    LocalStorage.remove(CLIENT_SETTINGS);
  },

  empty(data) {
    if (
      typeof data === "undefined" ||
      data === null ||
      data === "" ||
      data === "null" ||
      data === "undefined"
    ) {
      return true;
    }
    return false;
  },

  async authenticate() {
    let token = this.getUserToken();
    if (!token) {
      throw "error";
    }
    return api
      .post("/authenticate", "token=" + token.token)
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },
};
export default auth;
