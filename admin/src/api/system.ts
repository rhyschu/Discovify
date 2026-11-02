import { http } from "@/utils/http";
import { getToken } from "@/utils/auth";

export type Result = {
  code: number;
  message: string;
  data?: Array<any> | number | string | object;
};

export type ResultTable = {
  code: number;
  message: string;
  data?: {
    
    items: Array<any>;
    
    total?: number;
    
    pageSize?: number;
    
    currentPage?: number;
  };
};

export const getUserList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllUsers", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data 
  });
};

export const addUser = (data: object) => {
  const userData = getToken();
  return http.request<Result>("post", "/admin/addUser", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateUser = (data: object) => {
  const userData = getToken();
  return http.request<Result>("put", "/admin/updateUser", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateUserStatus = (id: number, status: number) => {
  const userData = getToken();
  return http.request<Result>(
    "patch",
    `/admin/updateUserStatus/${id}/${status}`,
    {
      headers: {
        Authorization: userData.accessToken
      }
    }
  );
};

export const deleteUser = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteUser/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deleteUsers = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteUsers`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};

export const getArtistList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllArtists", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const addArtist = (data: object) => {
  const userData = getToken();
  return http.request<Result>("post", "/admin/addArtist", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateArtist = (data: object) => {
  const userData = getToken();
  return http.request<Result>("put", "/admin/updateArtist", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateArtistAvatar = (id: number, data: object) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updateArtistAvatar/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data,
    responseType: "json" 
  });
};

export const deleteArtist = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteArtist/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deleteArtists = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteArtists`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};

export const getAllArtists = () => {
  const userData = getToken();
  return http.request<Result>("get", "/admin/getAllArtistNames", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    }
  });
};

export const getSongList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllSongsByArtist", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const addSong = (data: object) => {
  const userData = getToken();
  return http.request<Result>("post", "/admin/addSong", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateSong = (data: object) => {
  const userData = getToken();
  return http.request<Result>("put", "/admin/updateSong", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateSongCover = (id: number, data: object) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updateSongCover/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data,
    responseType: "json" 
  });
};

export const updateSongAudio = (id: number, data: FormData) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updateSongAudio/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data,
    responseType: "json" 
  });
};

export const deleteSong = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteSong/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deleteSongs = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteSongs`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};

export const getPlaylistList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllPlaylists", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const addPlaylist = (data: object) => {
  const userData = getToken();
  return http.request<Result>("post", "/admin/addPlaylist", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updatePlaylist = (data: object) => {
  const userData = getToken();
  return http.request<Result>("put", "/admin/updatePlaylist", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updatePlaylistCover = (id: number, data: object) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updatePlaylistCover/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data,
    responseType: "json" 
  });
};

export const deletePlaylist = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deletePlaylist/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deletePlaylists = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deletePlaylists`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};

export const getFeedbackList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllFeedbacks", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const deleteFeedback = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteFeedback/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deleteFeedbacks = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteFeedbacks`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};

export const getBannerList = (data: object) => {
  const userData = getToken();
  return http.request<ResultTable>("post", "/admin/getAllBanners", {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data
  });
};

export const addBanner = (data: object) => {
  const userData = getToken();
  return http.request<Result>("post", "/admin/addBanner", {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateBanner = (id: number, data: object) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updateBanner/${id}`, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: userData.accessToken
    },
    data
  });
};

export const updateBannerStatus = (id: number, status: number) => {
  const userData = getToken();
  return http.request<Result>("patch", `/admin/updateBannerStatus/${id}`, {
    headers: {
      Authorization: userData.accessToken
    },
    params: { status }
  });
};

export const deleteBanner = (id: number) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteBanner/${id}`, {
    headers: { Authorization: userData.accessToken }
  });
};

export const deleteBanners = (ids: Array<number>) => {
  const userData = getToken();
  return http.request<Result>("delete", `/admin/deleteBanners`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: userData.accessToken
    },
    data: ids
  });
};
