import { http } from "@/utils/http";
import type { Result } from "@/api/system";
import { getToken } from "@/utils/auth";

export const getAllUsersCount = () => {
  const userData = getToken();
  return http.request<Result>("get", "/admin/getAllUsersCount", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    }
  });
};

export const getAllArtistsCount = (gender?: number, area?: string) => {
  const userData = getToken();
  return http.request<Result>("get", "/admin/getAllArtistsCount", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { gender, area }
  });
};

export const getAllSongsCount = (style?: string) => {
  const userData = getToken();
  return http.request<Result>("get", "/admin/getAllSongsCount", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { style }
  });
};

export const getAllPlaylistsCount = (style?: string) => {
  const userData = getToken();
  return http.request<Result>("get", "/admin/getAllPlaylistsCount", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    params: { style }
  });
};
