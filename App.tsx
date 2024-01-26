import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CodePush from "react-native-code-push";
import Colors from "./Colors";

function App() {
  const fetchUpdate = useCallback(async () => {
    try {
      const update = await CodePush.checkForUpdate();

      if (update) {
        const updateBundle = await update.download();
        // Update should be applied on next app restart.
        await updateBundle.install(CodePush.InstallMode.ON_NEXT_RESTART);
        await CodePush.notifyAppReady();
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={fetchUpdate}
        style={styles.button}
      >
        <Text style={styles.description}>{"Update bundle  ⬇️"}</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  description: {
    flex: 1,
    textAlign: "center",
    paddingVertical: 16,
    fontWeight: "600",
    fontSize: 18,
    color: Colors.white,
  },
  button: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    width: "66%",
  },
});

/**
 * Connects the component to the CodePush service
 *
 * @see https://learn.microsoft.com/en-us/appcenter/distribution/codepush/rn-api-ref#codepush
 */
const CodePushApp = CodePush({
  checkFrequency: CodePush.CheckFrequency.MANUAL,
})(App);

export default CodePushApp;
