import Cookies from "js-cookie";
import { useUserStoreHook } from "@/store/modules/user";
import { storageLocal, isString, isIncludeAllChildren } from "@pureadmin/utils";

export interface DataInfo<T> {
  /** token */
  accessToken: string;
  
  expires: T;
  
  refreshToken: string;
  
  avatar?: string;
  
  username?: string;
  
  nickname?: string;
  
  roles?: Array<string>;
  
  permissions?: Array<string>;
}

export const userKey = "user-info";
export const TokenKey = "authorized-token";

export const multipleTabsKey = "multiple-tabs";

export function getToken(): DataInfo<number> {
  return Cookies.get(TokenKey)
    ? JSON.parse(Cookies.get(TokenKey))
    : storageLocal().getItem(userKey);
}

// export function setToken(data: DataInfo<Date>) {
//   let expires = 0;
//   const { accessToken, refreshToken } = data;
//   const { isRemembered, loginDay } = useUserStoreHook();
//   const cookieString = JSON.stringify({ accessToken, expires, refreshToken });

//   expires > 0
//     ? Cookies.set(TokenKey, cookieString, {
//         expires: (expires - Date.now()) / 86400000
//       })
//     : Cookies.set(TokenKey, cookieString);

//   Cookies.set(
//     multipleTabsKey,
//     "true",
//     isRemembered
//       ? {
//           expires: loginDay
//         }
//       : {}
//   );

//   function setUserKey({ avatar, username, nickname, roles, permissions }) {
//     useUserStoreHook().SET_AVATAR(avatar);
//     useUserStoreHook().SET_USERNAME(username);
//     useUserStoreHook().SET_NICKNAME(nickname);
//     useUserStoreHook().SET_ROLES(roles);
//     useUserStoreHook().SET_PERMS(permissions);
//     storageLocal().setItem(userKey, {
//       refreshToken,
//       expires,
//       avatar,
//       username,
//       nickname,
//       roles,
//       permissions
//     });
//   }

//   if (data.username && data.roles) {
//     const { username, roles } = data;
//     setUserKey({
//       avatar: data?.avatar ?? "",
//       username,
//       nickname: data?.nickname ?? "",
//       roles,
//       permissions: data?.permissions ?? []
//     });
//   } else {
//     const avatar =
//       storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? "";
//     const username =
//       storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
//     const nickname =
//       storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? "";
//     const roles =
//       storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
//     const permissions =
//       storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [];
//     setUserKey({
//       avatar,
//       username,
//       nickname,
//       roles,
//       permissions
//     });
//   }
// }

export function setToken(data: DataInfo<Date>) {
  let expires = 0;
  const { accessToken, refreshToken, roles, username } = data;
  const { isRemembered, loginDay } = useUserStoreHook();
  expires = new Date(data.expires).getTime();

  const cookieString = JSON.stringify({ accessToken, expires, refreshToken });

  expires > 0
    ? Cookies.set(TokenKey, cookieString, {
        expires: (expires - Date.now()) / 86400000
      })
    : Cookies.set(TokenKey, cookieString);

  Cookies.set(
    multipleTabsKey,
    "true",
    isRemembered
      ? {
          expires: loginDay
        }
      : {}
  );

  function setUserKey({ username, roles }) {
    useUserStoreHook().SET_USERNAME(username);
    useUserStoreHook().SET_ROLES(roles);
    storageLocal().setItem(userKey, {
      refreshToken,
      expires,
      username,
      roles
    });
  }

  if (username && roles) {
    setUserKey({
      username,
      roles
    });
  } else {
    const username =
      storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? "";
    const roles =
      storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
    setUserKey({
      username,
      roles
    });
  }
}

export function removeToken() {
  Cookies.remove(TokenKey);
  Cookies.remove(multipleTabsKey);
  storageLocal().removeItem(userKey);
}

export const formatToken = (token: string): string => {
  return "Bearer " + token;
};

export const hasPerms = (value: string | Array<string>): boolean => {
  if (!value) return false;
  const allPerms = "*:*:*";
  const { permissions } = useUserStoreHook();
  if (!permissions) return false;
  if (permissions.length === 1 && permissions[0] === allPerms) return true;
  const isAuths = isString(value)
    ? permissions.includes(value)
    : isIncludeAllChildren(value, permissions);
  return isAuths ? true : false;
};
