import { useSSO } from "@clerk/expo";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

// 1. Mandatory for mobile: Handles the in-app browser closing properly
WebBrowser.maybeCompleteAuthSession();

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

function useAuthSocial() {
  useWarmUpBrowser(); // 2. Call the warmup
  
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const { startSSOFlow } = useSSO();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (loadingStrategy) return;
    setLoadingStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ 
        strategy,
        // 3. Force the return URL to the root index, bypassing /sso-callback entirely
        redirectUrl: Linking.createURL("/"),
      });

      if (!createdSessionId || !setActive) {
        Alert.alert("Sign-in incomplete", "Authentication did not complete.");
        return;
      }

      await setActive({ session: createdSessionId });
    } catch (error) {
      console.log("💥 Error in social auth:", error);
      Alert.alert("Error", "Failed to sign in. Please try again.");
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { handleSocialAuth, loadingStrategy };
}

export default useAuthSocial;