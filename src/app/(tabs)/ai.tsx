import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { Text, View } from "react-native";

const AIPage = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
      }}
    >
      <Text style={{ color: APP_COLOR.BROWN, fontFamily: FONTS.regular }}>
        Vui lòng đăng nhập để xem tính năng này.
      </Text>
    </View>
  );
};
export default AIPage;
