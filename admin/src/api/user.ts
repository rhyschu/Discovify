import { http } from "@/utils/http";


export type LoginResult = {
  code: number;
  message: string;
  data: string | null;
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    
    refreshToken: string;
    
    expires: Date;
  };
};


import { jwtDecode } from "jwt-decode";
import { setToken, type DataInfo, getToken } from "@/utils/auth";

export const getLogin = async (data?: object) => {
  const response = await http.request<LoginResult>("post", "/admin/login", {
    data
  });

  if (response.data) {
    const decodedToken: any = jwtDecode(response.data);
    const { role, username } = decodedToken.claims;
    const expires = new Date(decodedToken.exp * 1000);
    const userData: DataInfo<Date> = {
      accessToken: response.data,
      expires,
      refreshToken: "",
      roles: [role],
      username
    };

    setToken(userData);
  }

  return response;
};

export const getLogout = () => {
  const userData = getToken();
  return http.request("post", "/admin/logout", {
    headers: { Authorization: userData.accessToken }
  });
};

