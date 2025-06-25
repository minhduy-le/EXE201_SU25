import ShareInput from "@/components/input/share.input";
import { UpdateUserSchema } from "@/utils/validate.schema";
import { Formik } from "formik";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { jwtDecode } from "jwt-decode";
import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareButton from "../button/share.button";
import { APP_COLOR } from "@/utils/constant";
import { FONTS } from "@/theme/typography";
import logo from "@/assets/logo.png";
import { useFocusEffect } from "expo-router";
interface DecodedToken {
  fullName: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
}
const UserInfo = () => {
  const [decodeToken, setDecodeToken] = useState<DecodedToken>();
  const getAccessToken = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        const decoded = jwtDecode(token);
        setDecodeToken(decoded);
      } else {
        console.log("No access token found.");
      }
    } catch (error) {
      console.error("Error retrieving access token:", error);
    }
  };
  useEffect(() => {
    getAccessToken();
  }, []);
  useFocusEffect(
    useCallback(() => {
      getAccessToken();
    }, [])
  );
  // const handleUpdateUser = async (name: string, phone: string) => {
  //   if (sampleData?.id) {
  //       const res = await updateUserInfo({ id: sampleData.id, name, phone });
  //       if(res.data) {
  //         Toast.show("Cập nhật thông tin user thành công!", {
  //           duration: Toast.durations.LONG,
  //           textColor: "white",
  //           backgroundColor: APP_COLOR.ORANGE,
  //           opacity: 1,
  //         });
  //         setDecodeToken((prev) =>
  //           prev
  //             ? {
  //                 ...prev,
  //                 name,
  //                 phone,
  //               }
  //             : null
  //         );
  //       } else {
  //         const m = Array.isArray(res.message) ? res.message[0] : res.message;
  //         Toast.show(m, {
  //           duration: Toast.durations.LONG,
  //           textColor: "white",
  //           backgroundColor: APP_COLOR.ORANGE,
  //           opacity: 1,
  //         });
  //       }
  //   }
  // };

  // if (!decodeToken) {
  //   return null;
  // }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Image
          source={logo}
          style={{ height: 150, width: 300, marginHorizontal: "auto" }}
        />
        <View style={{ alignItems: "center", gap: 5 }}>
          <Text
            style={{
              fontSize: 20,
              color: APP_COLOR.BROWN,
              fontFamily: FONTS.semiBold,
            }}
          >
            Thay đổi thông tin của bạn
          </Text>
        </View>
        <Formik
          enableReinitialize
          validationSchema={UpdateUserSchema}
          initialValues={{
            fullName: decodeToken?.fullName,
            phone_number: decodeToken?.phone_number,
            email: decodeToken?.email,
            date_of_birth: decodeToken?.date_of_birth,
          }}
          onSubmit={
            (values) => console.log("Test")
            // handleUpdateUser(values?.name ?? "", values?.phone ?? "")
          }
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
            dirty,
          }) => (
            <View style={{ marginTop: 20, gap: 15, marginHorizontal: 10 }}>
              <ShareInput
                title="Họ và tên"
                onChangeText={handleChange("fullName")}
                onBlur={handleBlur("fullName")}
                value={values.fullName}
                error={errors.fullName}
                touched={touched.fullName}
              />
              <ShareInput
                title="Email"
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                value={values.email}
                error={errors.email}
                touched={touched.email}
              />

              <ShareInput
                title="Số điện thoại"
                onChangeText={handleChange("phone_number")}
                onBlur={handleBlur("phone_number")}
                value={values.phone_number}
                error={errors.phone_number}
                touched={touched.phone_number}
              />
              <ShareInput
                title="Ngày sinh"
                onChangeText={handleChange("date_of_birth")}
                onBlur={handleBlur("date_of_birth")}
                value={values.date_of_birth}
                error={errors.date_of_birth}
                touched={touched.date_of_birth}
                isDatePicker={true}
              />
            </View>
          )}
        </Formik>
        <ShareButton
          title="Lưu thay đổi"
          btnStyle={{
            backgroundColor: APP_COLOR.BROWN,
            width: "auto",
            marginHorizontal: "25%",
            borderWidth: 0.5,
            borderRadius: 10,
            borderColor: APP_COLOR.BROWN,
            marginTop: 30,
          }}
          textStyle={{
            color: APP_COLOR.WHITE,
            fontSize: 17,
            marginHorizontal: 20,
            fontFamily: FONTS.regular,
          }}
          onPress={() => console.log("Lưu")}
          // onPress={() => handleUpdateUser(values.name, values.phone)}
        />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingTop: 50,
  },
});
export default UserInfo;
