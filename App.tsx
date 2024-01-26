import { ProgressView } from "@react-native-community/progress-view";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import CodePush from "react-native-code-push";
import Colors from "./Colors";

function App() {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [installState, setInstallState] = useState<
    CodePush.SyncStatus | undefined
  >();

  const isButtonDisabled =
    installState === CodePush.SyncStatus.CHECKING_FOR_UPDATE ||
    installState === CodePush.SyncStatus.DOWNLOADING_PACKAGE ||
    installState === CodePush.SyncStatus.INSTALLING_UPDATE;

  const styles = useMemo(() => getStyles(!!installState), []);

  const buttonText =
    installState === CodePush.SyncStatus.UNKNOWN_ERROR
      ? "Try again 🔄"
      : installState === CodePush.SyncStatus.UPDATE_INSTALLED
      ? "Reload to Apply Update ✅"
      : "Fetch Update ⬇️";

  const fetchUpdate = useCallback(async () => {
    try {
      setInstallState(CodePush.SyncStatus.CHECKING_FOR_UPDATE);
      const update = await CodePush.checkForUpdate();

      if (update) {
        setInstallState(CodePush.SyncStatus.DOWNLOADING_PACKAGE);

        const updateBundle = await update.download((progress) => {
          setDownloadProgress(progress.receivedBytes / progress.totalBytes);
        });

        setInstallState(CodePush.SyncStatus.INSTALLING_UPDATE);
        // Update should be applied on next app restart.
        await updateBundle.install(CodePush.InstallMode.ON_NEXT_RESTART);

        setInstallState(CodePush.SyncStatus.UPDATE_INSTALLED);
        await CodePush.notifyAppReady();
      }
    } catch (error) {
      console.error(error);
      setInstallState(CodePush.SyncStatus.UNKNOWN_ERROR);
    }
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!installState) {
      fetchUpdate();
    } else if (installState === CodePush.SyncStatus.UPDATE_INSTALLED) {
      CodePush.restartApp();
    }
  }, [fetchUpdate]);

  return (
    <View style={styles.container}>
      <ProgressView
        style={styles.progressView}
        progress={downloadProgress}
        progressTintColor={Colors.primary}
      />
      <TouchableOpacity
        accessibilityRole="button"
        onPress={handleButtonClick}
        style={styles.button}
        disabled={isButtonDisabled}
      >
        <Text style={styles.description}>{buttonText}</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const getStyles = (disabled: boolean) =>
  StyleSheet.create({
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
      backgroundColor: disabled ? Colors.light : Colors.primary,
      borderRadius: 4,
      width: "66%",
      marginTop: 20,
    },
    progressView: {
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
