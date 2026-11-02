import { defineStore } from "pinia";
import {
  type userType,
  store,
  router,
  resetRouter,
  routerArrays,
  storageLocal
} from "../utils";
import { type LoginResult, getLogin } from "@/api/user";
import { useMultiTagsStoreHook } from "./multiTags";
import { type DataInfo, removeToken, userKey } from "@/utils/auth";
import { getLogout } from "@/api/user";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "",
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "",
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "",
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    permissions:
      storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    isRemembered: false,
    loginDay: 7
  }),
  actions: {
    
    SET_AVATAR(avatar: string) {
      this.avatar = avatar;
    },
    
    SET_USERNAME(username: string) {
      this.username = username;
    },
    
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname;
    },
    
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions;
    },
    
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool;
    },
    
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value);
    },
    
    async loginByUsername(data) {
      return new Promise<LoginResult>((resolve, reject) => {
        getLogin(data)
          .then(data => {
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    
    logOut() {
      this.username = "";
      this.roles = [];
      this.permissions = [];
      getLogout();
      removeToken();
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    }
    
    // async handRefreshToken(data) {
    //   return new Promise<RefreshTokenResult>((resolve, reject) => {
    //     refreshTokenApi(data)
    //       .then(data => {
    //         if (data) {
    //           setToken(data.data);
    //           resolve(data);
    //         }
    //       })
    //       .catch(error => {
    //         reject(error);
    //       });
    //   });
    // }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
