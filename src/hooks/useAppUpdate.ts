import { useEffect, useState } from "react";
import { Platform } from "react-native";
import VersionCheck from "react-native-version-check";

export const useAppUpdate = () => {
  const [visible, setVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState("");
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    checkUpdate();
  }, []);

  // ✅ Proper version compare (handles 1.0.10 vs 1.0.2)
  const isUpdateNeeded = (current: string, latest: string) => {
    const c = current.split(".").map(Number);
    const l = latest.split(".").map(Number);

    for (let i = 0; i < Math.max(c.length, l.length); i++) {
      const cur = c[i] || 0;
      const lat = l[i] || 0;

      if (cur < lat) return true;
      if (cur > lat) return false;
    }

    return false;
  };

  const checkUpdate = async () => {
    try {
      let latestVersion = "";
      let url = "";

      // ✅ Platform specific handling
      if (Platform.OS === "ios") {
        latestVersion = await VersionCheck.getLatestVersion({
          provider: "appStore",
          appID: "6759083279", // 👈 your App Store ID
        });

        url = await VersionCheck.getStoreUrl({
          provider: "appStore",
          appID: "6759083279",
        });
      } else {
        latestVersion = await VersionCheck.getLatestVersion();
        url = await VersionCheck.getStoreUrl();
      }

      const currentVersion = VersionCheck.getCurrentVersion();

      console.log("latestVersion:", latestVersion);
      console.log("currentVersion:", currentVersion);

      // ✅ Correct comparison
      const updateNeeded = isUpdateNeeded(currentVersion, latestVersion);

      if (updateNeeded) {
        setStoreUrl(url);

        // ✅ Force update logic (customize as needed)
        const forceVersions = ["1.0.0", "1.0.1"];

        if (forceVersions.includes(currentVersion)) {
          setForceUpdate(true);
        } else {
          setForceUpdate(false);
        }

        setVisible(true);
      }
    } catch (e) {
      console.log("Version check failed", e);
    }
  };

  const onSkip = () => setVisible(false);

  return {
    visible,
    storeUrl,
    forceUpdate,
    onSkip,
  };
};