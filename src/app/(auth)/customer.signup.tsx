import ShareButton from "@/components/button/share.button";
import ShareInput from "@/components/input/share.input";
import { APP_COLOR } from "@/utils/constant";
import { Link, router } from "expo-router";
import { Formik } from "formik";
import { Text, View, StyleSheet, Image, Keyboard } from "react-native";
import Toast from "react-native-root-toast";
import logo from "@/assets/logo.png";
import { FONTS } from "@/theme/typography";
import { customerSignUpByPhoneAPI, sendVerifyCodeAPI } from "@/utils/api";
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
  },
  itemContainer: {
    marginHorizontal: 30,
    marginTop: 20,
    paddingVertical: 10,
  },
});
const handleSignUp = async (phoneNumber: string, password: string) => {
  try {
    const signUpResponse = await customerSignUpByPhoneAPI(
      phoneNumber,
      password
    );
    await sendVerifyCodeAPI(phoneNumber);
    Toast.show("Đăng ký thành công! Đã gửi mã xác thực.", {
      duration: Toast.durations.LONG,
      backgroundColor: APP_COLOR.ORANGE,
    });
    router.replace({ pathname: "/(auth)/verify", params: { phoneNumber } });
  } catch (error: any) {
    let errorMessage = "Đăng ký thất bại. Vui lòng thử lại.";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (typeof error.response?.data === "string") {
      errorMessage = error.response.data;
    }
    Toast.show(errorMessage, {
      duration: Toast.durations.LONG,
      backgroundColor: APP_COLOR.CANCEL,
    });
  }
};
const CustomerSignUpPage = () => {
  return (
    <View style={{ flex: 1, backgroundColor: APP_COLOR.BACKGROUND_ORANGE }}>
      <Formik
        initialValues={{ phoneNumber: "", password: "", confirmPassword: "" }}
        onSubmit={(values) => handleSignUp(values.phoneNumber, values.password)}
      >
        {({ handleChange, handleBlur, values, errors, touched }) => (
          <View style={styles.container}>
            <View style={styles.itemContainer}>
              <Image
                style={{ width: 300, height: 200, marginHorizontal: "auto" }}
                source={logo}
              />
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: FONTS.medium,
                  color: APP_COLOR.BROWN,
                  marginBottom: 10,
                }}
              >
                Trở thành khách hàng của Tấm Tắc
              </Text>
              <View style={{ gap: 10 }}>
                <ShareInput
                  placeholder="Số điện thoại"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("phoneNumber")}
                  onBlur={handleBlur("phoneNumber")}
                  value={values.phoneNumber}
                  error={errors.phoneNumber}
                  touched={touched.phoneNumber}
                />
                <ShareInput
                  placeholder="Mật khẩu"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry={true}
                />
                <ShareInput
                  placeholder="Xác nhận lại mật khẩu"
                  placeholderTextColor={APP_COLOR.BROWN}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  touched={touched.confirmPassword}
                  secureTextEntry={true}
                />
              </View>
            </View>
            <ShareButton
              title="Đăng Ký với Khách"
              onPress={() => handleSignUp(values.phoneNumber, values.password)}
              textStyle={{
                textTransform: "uppercase",
                color: APP_COLOR.WHITE,
                paddingHorizontal: 35,
                fontFamily: FONTS.medium,
                fontSize: 15,
                position: "absolute",
                left: 20,
                top: 15,
              }}
              btnStyle={{
                borderRadius: 30,
                backgroundColor: APP_COLOR.ORANGE,
                width: 250,
                marginHorizontal: "auto",
                marginBottom: 230,
              }}
              pressStyle={{ alignSelf: "stretch" }}
            />
          </View>
        )}
      </Formik>
    </View>
  );
};

export default CustomerSignUpPage;
