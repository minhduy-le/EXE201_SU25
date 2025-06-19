import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
const chatbotUrl = "https://udify.app/chatbot/84XresgPoO8dLdgJ";

const AIPage = () => {
  return (
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
