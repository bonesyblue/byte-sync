import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import CodePush from "react-native-code-push";

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
    <SafeAreaView style={styles.container}>
      <Text style={styles.body}>{"OTA update success ✅"}</Text>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingVertical: 16,
    fontWeight: "600",
    fontSize: 18,
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
