import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { Pressable, Text, View } from "react-native";
interface IVoucher {
  code: string;
  description: string;
}
const VoucherComponent = (props: IVoucher) => {
  return (
    <View
      style={{ flexDirection: "row", marginHorizontal: 10, marginVertical: 5 }}
    >
      <View
        style={{
          backgroundColor: APP_COLOR.WHITE,
          paddingVertical: 10,
          flex: 0.7,
          borderRadius: 7,
        }}
      >
        <Text
          style={{
            color: APP_COLOR.BROWN,
            fontFamily: FONTS.bold,
            marginLeft: 10,
          }}
        >
          {props.code}
        </Text>
        <Text
          style={{
            color: APP_COLOR.BROWN,
            marginLeft: 10,
            fontFamily: FONTS.regular,
          }}
        >
          {props.description}
        </Text>
      </View>
      <View
        style={{
          borderRightWidth: 1,
          borderRightColor: APP_COLOR.BROWN,
          borderStyle: "dashed",
        }}
      ></View>
      <View
        style={{
          backgroundColor: APP_COLOR.WHITE,
          flex: 0.3,
          borderRadius: 7,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable onPress={() => console.log("Voucher Details")}>
          <Text
            style={{
              textDecorationLine: "underline",
              color: APP_COLOR.ORANGE,
              fontFamily: FONTS.regular,
            }}
          >
            Xem chi tiết
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
export default VoucherComponent;
