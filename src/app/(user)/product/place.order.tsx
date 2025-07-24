import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { jwtDecode } from "jwt-decode";
import { currencyFormatter } from "@/utils/api";
import { API_URL, APP_COLOR, BASE_URL } from "@/utils/constant";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  Modal,
  Platform,
  TextInput,
  FlatList,
} from "react-native";
import Toast from "react-native-root-toast";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Formik } from "formik";
import { ChangePasswordSchema } from "@/utils/validate.schema";
import CustomerInforInput from "@/components/input/customerInfo.input";
import ShareButton from "@/components/button/share.button";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import logo from "@/assets/logo.png";

interface IOrderItem {
  image: string;
  title: string;
  option: string;
  price: number;
  quantity: number;
  productId: number;
}
interface ICusInfor {
  address: string;
  phone: string;
  fullName: string;
  userId: number;
}
interface IDetails {
  productId: number;
  quantity: number;
}
const PlaceOrderPage = () => {
  const { restaurant, cart, setCart, locationReal } = useCurrentApp();
  const [orderItems, setOrderItems] = useState<IOrderItem[]>([]);
  const [decodeToken, setDecodeToken] = useState<any>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [cusAddress, setCusAddress] = useState();
  const [cusPhone, setCusPhone] = useState();
  const { branchId } = useCurrentApp();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const dropdownItems = [
    { id: "1", title: "COD" },
    { id: "2", title: "PAYOS" },
  ];
  const [addresses, setAddresses] = useState<ICusInfor[]>([
    {
      userId: 1,
      fullName: "Home",
      address: "Hồ Chí Minh, Việt Nam",
      phone: "0889679561",
    },
    {
      userId: 2,
      fullName: "Office",
      address: "Hà Nội, Việt Nam",
      phone: "0889679561",
    },
    {
      userId: 3,
      fullName: "Friend's Place",
      address: "Đà Nẵng, Việt Nam",
      phone: "0889679561",
    },
  ]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<
    { productId: number; quantity: number }[]
  >([]);
  const [couponStatus, setCouponStatus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAddressObj, setSelectedAddressObj] = useState<any>(null);

  const GOOGLE_API_KEY = "AIzaSyAwSwTDdF00hbh21k7LsX-4Htuwqm9MlPg";

  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    waitFor: number
  ) => {
    let timeout: any;
    return (...args: Parameters<T>): Promise<ReturnType<T>> =>
      new Promise((resolve) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  const handleSearch = useCallback(
    debounce(async (text: string) => {
      setSearchTerm(text);
      if (!text) return;
      try {
        const res = await axios.get(
          `https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=${text}&language=vi&key=${GOOGLE_API_KEY}`
        );
        if (res.data) {
          setAddressSuggestions(res.data.predictions);
        }
      } catch (e) {
        setAddressSuggestions([]);
      }
    }, 500),
    []
  );

  const handleCreateOrder = async (
    _promotionCode: string,
    _note: string,
    _address: string,
    _phoneNumber: string,
    _branchId: number,
    _pointUsed: number,
    _pointEarned: number,
    _paymentMethodId: number,
    _orderItems: any,
    _pickUp: boolean,
    _customerName?: string,
    _pickupTime?: string,
    _customerEmail?: string
  ) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!decodeToken) {
        Toast.show("Vui lòng đăng nhập để đặt hàng!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
        return;
      }
      const payload = {
        customerId: decodeToken,
        customerName: _customerName || "",
        promotionCode: "",
        note: _note,
        address: _address,
        phoneNumber: _phoneNumber,
        branchId: 1,
        pointUsed: 0,
        pointEarned: 0,
        paymentMethodId: 2,
        longitude: "",
        latitude: "",
        orderItems: _orderItems,
        pickupTime: _pickupTime || new Date().toISOString(),
        customerEmail: _customerEmail || "",
        pickUp: _pickUp,
      };
      const response = await axios.post(`${API_URL}/orders/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data) {
        const paymentUrl = response.data.data?.payment_url;
        if (paymentUrl) {
          router.push({
            pathname: "/(user)/product/checkout.webview",
            params: { url: paymentUrl },
          });
          return;
        }
        Toast.show("Đặt hàng thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        setCart(0);
        router.replace("/(tabs)");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.log("[DEBUG] error.response.data:", error.response.data);
        const errorMessage =
          error.response.data.message || "Có lỗi xảy ra khi đặt hàng!";
        Toast.show(errorMessage, {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
      } else {
        Toast.show("Có lỗi xảy ra khi đặt hàng!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: "red",
          opacity: 1,
        });
      }
    }
  };

  useEffect(() => {
    const getAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          const decoded = jwtDecode(token);
          setDecodeToken(decoded.id);
        } else {
          console.log("No access token found.");
        }
      } catch (error) {
        console.error("Error retrieving access token:", error);
      }
    };
    getAccessToken();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDefault = await axios.get(
          `${BASE_URL}/information/default?customerId=${decodeToken}`
        );
        setSelectedAddress(resDefault.data.data);
        setCusAddress(resDefault.data.data.address);
        setCusPhone(resDefault.data.data.phone);
        const resAddresses = await axios.get(
          `${BASE_URL}/information/${decodeToken}`
        );
        if (resAddresses.data.data) {
          setAddresses(resAddresses.data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (decodeToken) {
      fetchData();
    }
  }, [decodeToken]);

  useEffect(() => {
    if (cart && restaurant && restaurant._id) {
      const result = [];
      const details: IDetails[] = [];
      for (const [menuItemId, currentItems] of Object.entries(
        cart[restaurant._id].items
      )) {
        if (currentItems.extra) {
          for (const [key, value] of Object.entries(currentItems.extra)) {
            const option = currentItems.data.options?.find(
              (item) => `${item.title}-${item.description}` === key
            );
            const addPrice = option?.additionalPrice ?? 0;
            result.push({
              image: currentItems.data.image,
              title: currentItems.data.name,
              option: key,
              price: currentItems.data.price + addPrice,
              quantity: value,
              productId: Number(currentItems.data.productId),
              note: "", // thêm note mặc định
            });
          }
        } else {
          result.push({
            image: currentItems.data.image,
            title: currentItems.data.name,
            option: "",
            price: currentItems.data.price,
            quantity: currentItems.quantity,
            productId: Number(currentItems.data.productId),
            note: "", // thêm note mặc định
          });
        }

        details.push({
          productId: Number(currentItems.data.productId),
          quantity: currentItems.quantity,
          note: "", // thêm note mặc định
        });
      }
      setOrderItems(result);
      setOrderDetails(details);
    }
  }, [restaurant]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      if (event.url.includes("order-success")) {
        Toast.show("Thanh toán thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        setCart(0);
        router.replace("/(tabs)");
      }
    };
    const subscription = Linking.addEventListener("url", handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("order-success")) {
        Toast.show("Thanh toán thành công!", {
          duration: Toast.durations.LONG,
          textColor: "white",
          backgroundColor: APP_COLOR.ORANGE,
          opacity: 1,
        });
        setCart(0);
        router.replace("/(tabs)");
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
  const handlePaymentMethodChange = (
    value: string,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setSelectedOption(value);
    setFieldValue("paymentMethodId", Number(value));
  };
  const calculateTotalPrice = () => {
    try {
      if (!restaurant?._id) {
        return 0;
      }
      const restaurantCart = cart[restaurant._id];
      if (!restaurantCart || !restaurantCart.items) {
        return 0;
      }
      const items = restaurantCart.items;
      let total = 0;

      Object.values(items).forEach((item: any) => {
        const price = Number(
          item?.data?.price ||
            item?.data?.basePrice ||
            item?.data?.productPrice ||
            0
        );
        const quantity = Number(item?.quantity || 0);
        total += price * quantity;
      });
      return total;
    } catch (error) {
      console.error("Lỗi tính tổng giá:", error);
      return 0;
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
      }}
    >
      <ScrollView style={{ flex: 1, paddingHorizontal: 10 }}>
        <Image
          source={logo}
          style={{
            width: 150,
            height: 100,
            alignSelf: "center",
          }}
        />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            position: "relative",
            top: -5,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: 20,
              color: APP_COLOR.BROWN,
              position: "relative",
              top: 5,
            }}
          >
            Giao hàng
          </Text>
        </View>
        <Formik
          validationSchema={ChangePasswordSchema}
          initialValues={{
            promotionCode: "",
            note: "",
            address: "",
            addressObj: null as any,
            customerName: "",
            customerEmail: "",
            phoneNumber: "",
            branchId: 0,
            pointUsed: 0,
            pointEarned: 0,
            paymentMethodId: 0,
            orderItems: [
              {
                productId: 0,
                quantity: 0,
              },
            ],
            pickUp: false,
            pickupTime: new Date().toISOString(),
          }}
          onSubmit={(values) => {
            const numericPointUsed = Number(values.pointUsed) || 0;
            if (numericPointUsed < 0) {
              Toast.show("Điểm sử dụng không thể là số âm!", {
                duration: Toast.durations.LONG,
                textColor: "white",
                backgroundColor: "red",
                opacity: 1,
              });
              return;
            }
            if (!values.addressObj || !values.addressObj.description) {
              Toast.show("Bạn phải chọn địa chỉ từ gợi ý Google Maps!", {
                duration: Toast.durations.LONG,
                textColor: "white",
                backgroundColor: "red",
                opacity: 1,
              });
              return;
            }
            console.log("[DEBUG] values.orderItems:", values.orderItems);
            handleCreateOrder(
              values.promotionCode,
              values.note,
              values.addressObj.description,
              values.phoneNumber,
              values.branchId,
              numericPointUsed,
              values.pointEarned,
              values.paymentMethodId,
              values.orderItems, // truyền thẳng, đã có note
              values.pickUp,
              values.customerName,
              values.pickupTime || new Date().toISOString(),
              values.customerEmail
            );
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => {
            // Đưa useEffect lấy số điện thoại từ decoded ra ngoài Formik
            useEffect(() => {
              if (decodeToken) {
                try {
                  const decoded = jwtDecode(decodeToken);
                  if (decoded && decoded.phone) {
                    setCusPhone(decoded.phone);
                  }
                } catch (e) {}
              }
            }, [decodeToken]);
            // Trong render props của Formik, chỉ giữ lại 1 useEffect để setFieldValue('phoneNumber', cusPhone)
            useEffect(() => {
              if (cusPhone) {
                setFieldValue("phoneNumber", cusPhone);
              }
              if (cusAddress) {
                setFieldValue("address", cusAddress);
              }
              if (orderDetails) {
                setFieldValue(
                  "orderItems",
                  orderDetails.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    note: item.note ?? "",
                  }))
                );
              }
              if (branchId) {
                setFieldValue("branchId", branchId);
              }
              if (restaurant && cart?.[restaurant._id]) {
                const totalAmount = cart[restaurant._id].sum;
                const earnedPoints = Math.floor(totalAmount / 1000);
                setFieldValue("pointEarned", earnedPoints);
                const currentPointUsed = Number(values.pointUsed) || 0;
                setFieldValue("pointUsed", currentPointUsed);
              }
            }, [
              cusPhone,
              cusAddress,
              cusPhone,
              orderDetails,
              branchId,
              restaurant,
              cart,
            ]);
            return (
              <View style={styles.container}>
                <View
                  style={{
                    position: "relative",
                    minWidth: 200,
                    flex: 1,
                    marginBottom: 10,
                  }}
                >
                  <TextInput
                    placeholder="Nhập địa chỉ của bạn"
                    value={values.address}
                    onFocus={() => setShowSuggestions(true)}
                    onChangeText={(text) => {
                      setSearchTerm(text);
                      setFieldValue("address", text);
                      setFieldValue("addressObj", null); // reset object khi user tự nhập
                      handleSearch(text);
                      setShowSuggestions(true);
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: APP_COLOR.BROWN,
                      borderRadius: 10,
                      paddingVertical: 10,
                      color: APP_COLOR.BROWN,
                      backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
                      marginVertical: 10,
                      minWidth: 200,
                    }}
                    placeholderTextColor={APP_COLOR.BROWN}
                  />
                  {showSuggestions && addressSuggestions.length > 0 && (
                    <View
                      style={{
                        position: "absolute",
                        top: 50,
                        left: 0,
                        right: 0,
                        backgroundColor: APP_COLOR.WHITE,
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        zIndex: 100,
                        maxHeight: 200,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                      }}
                    >
                      <FlatList
                        data={addressSuggestions}
                        keyboardShouldPersistTaps="handled"
                        keyExtractor={(item) => item.place_id}
                        renderItem={({ item }) => (
                          <Pressable
                            onPress={() => {
                              setSearchTerm(item.description);
                              setSelectedAddress(item.description);
                              setFieldValue("address", item.description);
                              setFieldValue("addressObj", item);
                              setAddressSuggestions([]);
                              setShowSuggestions(false);
                              Toast.show(
                                `Đã chọn địa chỉ: ${item.description}`,
                                {
                                  duration: Toast.durations.LONG,
                                  textColor: "white",
                                  backgroundColor: APP_COLOR.ORANGE,
                                  opacity: 1,
                                }
                              );
                            }}
                          >
                            <View style={{ padding: 10 }}>
                              <Text>{item.description}</Text>
                            </View>
                          </Pressable>
                        )}
                      />
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 20,
                    color: APP_COLOR.BROWN,
                    marginBottom: 5,
                  }}
                >
                  Chi tiết đơn hàng
                </Text>
                {orderItems?.map((item, index) => {
                  return (
                    <View
                      key={`${item.productId}-${index}`}
                      style={{
                        gap: 10,
                        flexDirection: "row",
                        paddingBottom: 5,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: FONTS.regular,
                            fontSize: 17,
                            color: APP_COLOR.BROWN,
                          }}
                        >
                          {item.title} x {item.quantity}
                        </Text>

                        <Text
                          style={{
                            fontFamily: FONTS.regular,
                            fontSize: 17,
                            color: APP_COLOR.BROWN,
                          }}
                        >
                          {currencyFormatter(item.price)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {orderItems?.length > 0 && (
                  <View
                    style={{
                      marginVertical: 15,
                      borderTopWidth: 0.5,
                      borderTopColor: APP_COLOR.BROWN,
                      paddingTop: 10,
                    }}
                  >
                    <View style={styles.textInputView}>
                      <Text style={styles.textInputText}>
                        Tổng tiền (
                        {restaurant &&
                          cart?.[restaurant._id] &&
                          cart?.[restaurant._id].quantity}{" "}
                        món)
                      </Text>
                      <Pressable
                        onPress={() => {
                          couponStatus === true
                            ? setCouponStatus(false)
                            : setCouponStatus(true);
                        }}
                      >
                        <Text
                          style={{
                            color: APP_COLOR.ORANGE,
                            fontFamily: FONTS.regular,
                            textDecorationLine: "underline",
                            marginVertical: "auto",
                          }}
                        >
                          {values.promotionCode ? (
                            <Text
                              style={{
                                textDecorationLine: "none",
                                fontSize: 18,
                              }}
                            >
                              {values.promotionCode}
                            </Text>
                          ) : (
                            "Áp dụng mã khuyến mãi"
                          )}
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Thành tiền
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(calculateTotalPrice() || 0)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Phí giao hàng
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(0)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.regular, fontSize: 17 },
                        ]}
                      >
                        Giảm giá
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.regular,
                          fontSize: 17,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(0)}
                      </Text>
                    </View>
                    <View style={styles.textInputView}>
                      <Text
                        style={[
                          styles.textInputText,
                          { fontFamily: FONTS.bold, fontSize: 20 },
                        ]}
                      >
                        Số tiền thanh toán
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.bold,
                          fontSize: 20,
                          color: APP_COLOR.BROWN,
                        }}
                      >
                        {currencyFormatter(calculateTotalPrice() || 0)}
                      </Text>
                    </View>
                  </View>
                )}
                {couponStatus && (
                  <CustomerInforInput
                    onChangeText={handleChange("promotionCode")}
                    onBlur={handleBlur("promotionCode")}
                    value={values.promotionCode}
                    error={errors.promotionCode}
                    touched={touched.promotionCode}
                    placeholder="Nhập mã khuyến mãi"
                  />
                )}
                {/* <CustomerInforInput
                  title="Sử dụng điểm"
                  onChangeText={(text: any) => {
                    const numericValue = Number(text) || 0;
                    if (numericValue >= 0) {
                      setFieldValue("pointUsed", numericValue);
                    }
                  }}
                  onBlur={handleBlur("pointUsed")}
                  value={String(values.pointUsed)}
                  error={errors.pointUsed}
                  touched={touched.pointUsed}
                  keyboardType="numeric"
                /> */}
                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>
                    Phương thức thanh toán
                  </Text>
                  <View style={styles.dropdown}>
                    {dropdownItems.map((item, index) => (
                      <Pressable
                        key={`${item.id}-${index}`}
                        style={[
                          styles.dropdownItem,
                          selectedOption === item.id &&
                            styles.selectedDropdownItem,
                        ]}
                        onPress={() =>
                          handlePaymentMethodChange(item.id, setFieldValue)
                        }
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            selectedOption === item.id &&
                              styles.selectedDropdownText,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {errors.paymentMethodId && touched.paymentMethodId && (
                    <Text style={styles.errorText}>
                      {errors.paymentMethodId}
                    </Text>
                  )}
                </View>
                <CustomerInforInput
                  title="Mang đi"
                  value={values.pickUp}
                  setValue={(v) => setFieldValue("pickUp", v)}
                  isBoolean={true}
                />
                <CustomerInforInput
                  onChangeText={handleChange("note")}
                  onBlur={handleBlur("note")}
                  value={values.note}
                  error={errors.note}
                  touched={touched.note}
                  placeholder="Ghi chú"
                />
                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 16,
                      color: APP_COLOR.BROWN,
                    }}
                  >
                    Tên khách hàng
                  </Text>
                  <TextInput
                    placeholder="Nhập tên khách hàng"
                    value={values.customerName}
                    onChangeText={(text) => setFieldValue("customerName", text)}
                    style={{
                      borderWidth: 1,
                      borderColor: APP_COLOR.BROWN,
                      borderRadius: 10,
                      paddingVertical: 8,
                      color: APP_COLOR.BROWN,
                      backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
                      marginVertical: 5,
                      minWidth: 200,
                      paddingHorizontal: 10,
                    }}
                    placeholderTextColor={APP_COLOR.BROWN}
                  />
                </View>
                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 16,
                      color: APP_COLOR.BROWN,
                    }}
                  >
                    Email khách hàng
                  </Text>
                  <TextInput
                    placeholder="Nhập email khách hàng"
                    value={values.customerEmail}
                    onChangeText={(text) =>
                      setFieldValue("customerEmail", text)
                    }
                    style={{
                      borderWidth: 1,
                      borderColor: APP_COLOR.BROWN,
                      borderRadius: 10,
                      paddingVertical: 8,
                      color: APP_COLOR.BROWN,
                      backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
                      marginVertical: 5,
                      minWidth: 200,
                      paddingHorizontal: 10,
                    }}
                    placeholderTextColor={APP_COLOR.BROWN}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                <View style={{ marginBottom: 10 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: 16,
                      color: APP_COLOR.BROWN,
                    }}
                  >
                    Số điện thoại
                  </Text>
                  <TextInput
                    value={values.phoneNumber}
                    onChangeText={(text) => setFieldValue("phoneNumber", text)}
                    editable={true}
                    style={{
                      borderWidth: 1,
                      borderColor: APP_COLOR.BROWN,
                      borderRadius: 10,
                      paddingVertical: 8,
                      color: APP_COLOR.BROWN,
                      backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
                      marginVertical: 5,
                      minWidth: 200,
                      paddingHorizontal: 10,
                    }}
                    placeholderTextColor={APP_COLOR.BROWN}
                    keyboardType="phone-pad"
                  />
                </View>
                <ShareButton
                  loading={loading}
                  title="Tạo đơn hàng"
                  onPress={() => {
                    handleCreateOrder(
                      values.promotionCode,
                      values.note,
                      values.address,
                      values.phoneNumber,
                      values.branchId,
                      values.pointUsed,
                      values.pointEarned,
                      values.paymentMethodId,
                      values.orderItems,
                      values.pickUp,
                      values.customerName,
                      values.pickupTime || new Date().toISOString(),
                      values.customerEmail
                    );
                  }}
                  textStyle={{
                    textTransform: "uppercase",
                    color: "#fff",
                    paddingVertical: 5,
                    fontFamily: FONTS.regular,
                    fontSize: 20,
                  }}
                  btnStyle={{
                    justifyContent: "center",
                    borderRadius: 10,
                    paddingVertical: 10,
                    backgroundColor: APP_COLOR.BROWN,
                    width: "100%",
                  }}
                  pressStyle={{ alignSelf: "stretch" }}
                />
              </View>
            );
          }}
        </Formik>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    gap: 3,
  },
  headerContainer: {
    paddingTop: 5,
    gap: 3,
    borderBottomColor: APP_COLOR.BROWN,
    borderBottomWidth: 0.5,
    paddingBottom: 5,
  },
  customersInfo: {
    flexDirection: "row",
  },
  cusInfo: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: APP_COLOR.ORANGE,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    width: 120,
    marginHorizontal: 3,
  },
  addressItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  textInfor: {
    color: APP_COLOR.GREY,
    fontFamily: FONTS.regular,
    fontSize: 17,
  },
  textNameInfor: {
    fontFamily: FONTS.regular,
    fontSize: 17,
  },
  textInputView: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textInputText: {
    color: APP_COLOR.BROWN,
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginVertical: "auto",
  },
  dropdownContainer: {
    marginBottom: 15,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    marginBottom: 8,
    color: APP_COLOR.BROWN,
  },
  dropdown: {
    flexDirection: "row",
    gap: 9,
  },
  dropdownItem: {
    flex: 1,
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLOR.BROWN,
    alignItems: "center",
  },
  selectedDropdownItem: {
    backgroundColor: APP_COLOR.BROWN,
  },
  dropdownText: {
    fontFamily: FONTS.regular,
    fontSize: 17,
    color: APP_COLOR.BROWN,
  },
  selectedDropdownText: {
    color: APP_COLOR.WHITE,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
});
export default PlaceOrderPage;
