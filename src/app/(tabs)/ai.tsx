import { useCurrentApp } from "@/context/app.context";
import { FONTS } from "@/theme/typography";
import { APP_COLOR } from "@/utils/constant";
import { StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";
const chatbotUrl = "https://udify.app/chatbot/84XresgPoO8dLdgJ";
const AIPage = () => {
  const { appState } = useCurrentApp();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: APP_COLOR.BACKGROUND_ORANGE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {appState ? (
        <View style={styles.container}>
          <WebView
            source={{ uri: chatbotUrl }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      ) : (
        <View>
          <Text style={{ color: APP_COLOR.BROWN, fontFamily: FONTS.regular }}>
            Vui lòng đăng nhập để sử dụng tính năng này.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    bottom: -30,
  },
  webview: {
    flex: 1,
  },
});

export default AIPage;
