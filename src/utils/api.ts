import axios from "axios";
import { Platform } from "react-native";
import { API_URL } from "./constant";

export const customerRegisterAPI = async (
  fullName: string,
  phone_number: string,
  email: string,
  password: string,
  date_of_birth: string
) => {
  return axios.post(
    `${API_URL}/api/auth/register`,
    {
      fullName,
      phone_number,
      email,
      password,
      date_of_birth,
    },
    {
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );
};
export const verifyEmailCustomer = (email: string, otp: string) => {
  const url = `${API_URL}/api/auth/verify-otp`;
  return axios.post(url, {
    email,
    otp,
  });
};
export const resendCodeAPI = (email: string) => {
  const url = `${API_URL}/api/auth/resend-otp`;
  return axios.post(url, { email });
};
export const customerLoginAPI = (email: string, password: string) => {
  const url = `${API_URL}/api/auth/login`;
  return axios.post(url, { email, password });
};

export const registerAPI = (email: string, password: string, name: string) => {
  const url = `/api/v1/auth/register`;
  return axios.post<IBackendRes<IRegister>>(url, { email, password, name });
};
export const forgotPasswordAPI = (email: string) => {
  const url = `${API_URL}/api/auth/forgot-password`;
  return axios.post(url, { email });
};
export const getBestSellerAPI = () => {
  const url = `${API_URL}/api/products/best-seller`;
  return axios.get(url);
};
export const getTypeProductAPI = () => {
  const url = `${API_URL}/product-type`;
  return axios.get(url);
};
export const getAccountAPI = () => {
  const url = `/api/v1/auth/account`;
  return axios.get<IBackendRes<IUserLogin>>(url);
};

export const getTopRestaurant = (ref: string) => {
  const url = `/api/v1/restaurants/${ref}`;
  return axios.post<IBackendRes<ITopRestaurant[]>>(
    url,
    {},
    {
      headers: {
        delay: 1500,
      },
    }
  );
};

export const getURLBaseBackend = () => {
  const backend =
    Platform.OS === "android"
      ? globalThis.process?.env.EXPO_PUBLIC_ANDROID_API_URL
      : globalThis.process?.env.EXPO_PUBLIC_IOS_API_URL;

  return backend;
};

export const getRestaurantByIdAPI = (id: string) => {
  const url = `/api/v1/restaurants/${id}`;
  return axios.get<IBackendRes<IRestaurant>>(url, {
    headers: { delay: 1500 },
  });
};

export const processDataRestaurantMenu = (restaurant: IRestaurant | null) => {
  if (!restaurant) return [];
  return restaurant?.menu?.map((menu, index) => {
    return {
      index,
      key: menu._id,
      title: menu.title,
      data: menu.menuItem,
    };
  });
};

export const currencyFormatter = (value: any) => {
  const options = {
    significantDigits: 2,
    thousandsSeparator: ".",
    decimalSeparator: ",",
    symbol: "đ",
  };

  if (typeof value !== "number") value = 0.0;
  value = value.toFixed(options.significantDigits);

  const [currency, decimal] = value.split(".");
  return `${currency.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    options.thousandsSeparator
  )} ${options.symbol}`;
};

export const updateUserPasswordAPI = (
  currentPassword: string,
  newPassword: string
) => {
  const url = `/api/v1/users/password`;
  return axios.post<IBackendRes<IUserLogin>>(url, {
    currentPassword,
    newPassword,
  });
};

export const requestPasswordAPI = (email: string) => {
  const url = `/api/v1/auth/retry-password`;
  return axios.post<IBackendRes<IUserLogin>>(url, { email });
};

export const likeRestaurantAPI = (restaurant: string, quantity: number) => {
  const url = `/api/v1/likes`;
  return axios.post<IBackendRes<IUserLogin>>(url, { restaurant, quantity });
};

export const customerLoginByPhoneAPI = (
  phoneNumber: string,
  password: string
) => {
  const url = `${API_URL}/customer/sign-in`;
  return axios.post(url, { phoneNumber, password });
};

export const customerSignUpByPhoneAPI = (
  phoneNumber: string,
  password: string
) => {
  const url = `${API_URL}/customer/sign-up`;
  return axios.post(url, { phoneNumber, password });
};

export const sendVerifyCodeAPI = (phoneNumber: string) => {
  const url = `${API_URL}/verify-code/send?mode=%20`;
  return axios.post(url, { phoneNumber });
};

export const verifyCodeAPI = (phoneNumber: string, code: string) => {
  const url = `${API_URL}/verify-code/verify?phoneNumber=${encodeURIComponent(
    phoneNumber
  )}&code=${encodeURIComponent(code)}`;
  return axios.post(url);
};

export const getProductsByTypeAPI = (typeId: number, page = 0, size = 10) => {
  const url = `${API_URL}/products?page=${page}&size=${size}&typeId=${typeId}`;
  return axios.get(url);
};

export const getProductsByKeywordAPI = (
  keyword: string,
  page = 0,
  size = 10
) => {
  const url = `${API_URL}/products?page=${page}&size=${size}&keyword=${encodeURIComponent(
    keyword
  )}`;
  return axios.get(url);
};

export const getOrderHistoryByCustomerAPI = (
  customerId: number,
  token: string,
  page = 0,
  size = 10
) => {
  const url = `${API_URL}/orders/customer/${customerId}?page=${page}&size=${size}`;
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
