import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image, // Thêm dòng này
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL, APP_COLOR, BASE_URL } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import { currencyFormatter } from "@/utils/api";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-root-toast";

interface StatusInfo {
  text: string;
  color: string;
}

const STATUS_COLORS = {
  PENDING: "rgba(52, 55, 252, 0.75)",
  APPROVED: "rgba(0, 154, 5, 0.68)",
  PREPARING: "rgba(255, 251, 0, 0.75)",
  COOKED: APP_COLOR.ORANGE,
  DELIVERING: "rgba(3, 169, 244, 0.72)",
  DELIVERED: "rgba(76, 175, 80, 0.70)",
  CANCELED: "rgba(244, 67, 54, 0.70)",
  DEFAULT: "rgba(158, 158, 158, 0.70)",
};

const statusMap: Record<string, StatusInfo> = {
  Pending: { text: "Chờ thanh toán", color: STATUS_COLORS.PENDING },
  Paid: { text: "Đã thanh toán", color: STATUS_COLORS.APPROVED },
  Approved: { text: "Đã xác nhận", color: STATUS_COLORS.APPROVED },
  Preparing: { text: "Đang chuẩn bị", color: STATUS_COLORS.PREPARING },
  Cooked: { text: "Đã nấu xong", color: STATUS_COLORS.COOKED },
  Delivering: { text: "Đang giao", color: STATUS_COLORS.DELIVERING },
  Delivered: { text: "Đã giao", color: STATUS_COLORS.DELIVERED },
  Canceled: { text: "Đã hủy", color: STATUS_COLORS.CANCELED },
};

// Sửa interface IOrderDetails cho đúng API mới
interface IOrderDetails {
  id: number;
  subTotal: number;
  promotionCode: string | null;
  discountValue: number;
  discountPercent: number;
  amount: number;
  shippingFee: number;
  isPickUp: boolean;
  delivery_at: string | null;
  orderStatus: string;
  note: string;
  payment_code: string | null;
  address: string | null;
  phone: string;
  pointUsed: number;
  pointEarned: number;
  createdAt: string;
  orderItems: Array<{
    productId: number;
    productName: string;
    orderId: number;
    quantity: number;
    price: number;
    note: string;
    feedback: any;
    feedbackPoint: number;
    expiredFeedbackTime: string | null;
    productImg: string;
    feedBackYet: boolean;
  }>;
  customerDTO: any;
  pickupTime: string;
  customerName: string | null;
  status: string | null;
}

import { useCurrentApp } from "@/context/app.context";
import { formatDateToDDMMYYYY } from "@/utils/function";

const OrderDetailsPage = () => {
  const { id } = useLocalSearchParams();
  const { appState, setAppState } = useCurrentApp();
  const [orderDetails, setOrderDetails] = useState<IOrderDetails | null>(null);
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        let token = appState?.token;
        if (!token) {
          token = await AsyncStorage.getItem("access_token");
          if (token) {
            setAppState((prev: any) => ({ ...(prev || {}), token }));
          } else {
            Toast.show("Vui lòng đăng nhập để xem chi tiết đơn hàng!", {
              duration: Toast.durations.LONG,
              textColor: "white",
              backgroundColor: "red",
              opacity: 1,
            });
            return;
          }
        }
        console.log("[DEBUG] Token:", token);
        const res = await axios.get(`${API_URL}/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token || ""}`,
          },
        });
        if (res?.data?.data) {
          setOrderDetails(res.data.data);
        } else {
          console.error("Failed to fetch order details");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    };
    fetchOrderDetails();
  }, [id]);

  // Define the status progression for the UI
  const statusProgression = [
    "Pending",
    "Paid",
    "Approved",
    "Preparing",
    "Cooked",
    "Delivering",
    "Delivered",
  ];

  const getCurrentStatusIndex = (status: string) => {
    // Handle Canceled separately as it's not in the progression
    if (status === "Canceled") return statusProgression.length;
    return statusProgression.indexOf(status);
  };

  const currentStatusIndex = orderDetails
    ? getCurrentStatusIndex(orderDetails.orderStatus)
    : -1;

  if (!orderDetails) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusInfo = statusMap[orderDetails.orderStatus] || {
    text: orderDetails.orderStatus,
    color: STATUS_COLORS.DEFAULT,
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Đơn hàng #{orderDetails.id}</Text>
          </View>
          <View style={styles.contentItems}>
            <View>
              <Text style={styles.label}>Thời gian đặt hàng</Text>
              <Text style={styles.value}>
                {formatDateToDDMMYYYY(orderDetails.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.contentItems}>
            <View>
              <Text style={styles.label}>Trạng thái</Text>
              <Text style={styles.value}>{orderDetails.orderStatus}</Text>
            </View>
            <View>
              <Text style={styles.label}>Địa chỉ</Text>
              <Text style={styles.value}>
                {orderDetails.address || "(không có)"}
              </Text>
            </View>
          </View>
          <View style={styles.contentItems}>
            <View>
              <Text style={styles.label}>Số điện thoại</Text>
              <Text style={styles.value}>{orderDetails.phone}</Text>
            </View>
            <View>
              <Text style={styles.label}>Ghi chú</Text>
              <Text style={styles.value}>{orderDetails.note}</Text>
            </View>
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <Text style={styles.labelIcon}>Chi tiết món ăn</Text>
            {orderDetails.orderItems.map((item, index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View style={{ marginRight: 10 }}>
                  <Text
                    style={{ fontFamily: FONTS.bold, color: APP_COLOR.BROWN }}
                  >
                    {item.productName} x {item.quantity}
                  </Text>
                  <Text style={{ color: APP_COLOR.BROWN, fontSize: 13 }}>
                    Ghi chú: {item.note}
                  </Text>
                  <Text style={{ color: APP_COLOR.ORANGE }}>
                    {currencyFormatter(item.price)}
                  </Text>
                </View>

                <View style={{ marginLeft: 10 }}>
                  <Image
                    source={{ uri: item.productImg }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 6,
                      backgroundColor: "#eee",
                    }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            ))}
          </View>
          <View
            style={{
              borderBottomColor: APP_COLOR.BROWN,
              borderBottomWidth: 0.5,
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <Text style={[styles.label, { fontSize: 19 }]}>Tổng tiền</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Thành tiền</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetails.subTotal)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Phí giao hàng</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetails.shippingFee)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalValue}>Giảm giá</Text>
              <Text style={styles.totalValue}>
                {currencyFormatter(orderDetails.discountValue)}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalLabel}>Số tiền thanh toán</Text>
              <Text style={styles.totalLabel}>
                {currencyFormatter(
                  orderDetails.subTotal +
                    orderDetails.shippingFee -
                    orderDetails.discountValue
                )}
              </Text>
            </View>
            <View style={styles.detailsContainer}>
              <Text style={styles.totalLabel}>Điểm tích lũy</Text>
              <Text style={styles.totalLabel}>
                {orderDetails.pointEarned} điểm
              </Text>
            </View>
          </View>
          <Text style={[styles.label, { width: "100%" }]}>
            Phương thức thanh toán
          </Text>
          <Text style={styles.value}>PayOS</Text>
          <Text style={styles.label}>Ghi chú</Text>
          <Text style={styles.value}>{orderDetails.note}</Text>
          <View style={{ flexDirection: "row" }}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.buttonFooter,
                  { backgroundColor: APP_COLOR.ORANGE },
                ]}
                onPress={() => router.navigate("/(tabs)")}
              >
                <Text style={[styles.buttonText, { color: APP_COLOR.WHITE }]}>
                  Về trang chủ
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  headerTitle: {
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    marginVertical: "auto",
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  detailsContainer: { flexDirection: "row", justifyContent: "space-between" },
  label: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    width: 170,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
  },
  statusLabel: {
    fontSize: 15,
    fontFamily: FONTS.bold,
    color: APP_COLOR.BROWN,
    width: 200,
    marginVertical: "auto",
  },
  value: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    width: 180,
  },
  totalValue: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
  },
  customerValue: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    color: APP_COLOR.BROWN,
    marginHorizontal: 2,
  },
  itemContainer: {
    marginVertical: 8,
    justifyContent: "space-between",
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
    flexDirection: "row",
  },
  contentItems: {
    flexDirection: "row",
  },
  itemValue: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: APP_COLOR.BROWN,
  },
  statusLayout: {
    width: 130,
    height: 30,
  },
  orderDetailsStatus: {
    flexDirection: "row",
    marginTop: 7,
  },
  statusText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    marginHorizontal: "auto",
    marginVertical: "auto",
  },
  labelIcon: {
    color: APP_COLOR.BROWN,
    fontSize: 14,
    fontFamily: FONTS.bold,
    alignSelf: "center",
  },
  buttonContainer: {
    marginHorizontal: "auto",
    flexDirection: "row",
    gap: 10,
  },
  buttonFooter: {
    backgroundColor: APP_COLOR.WHITE,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    paddingVertical: 9,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 180,
    marginTop: 10,
    height: 42,
    alignItems: "center",
  },
  buttonText: {
    color: APP_COLOR.BROWN,
    fontSize: 17,
    fontFamily: FONTS.bold,
    marginHorizontal: "auto",
  },
});

export default OrderDetailsPage;
