import {
  View,
  Text,
  Dimensions,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import useAuthSocial from "../../../hooks/useSocialAuth";

const { width } = Dimensions.get("window");

const AuthScreen = () => {
  const { handleSocialAuth, loadingStrategy } = useAuthSocial();
  const isLoading = loadingStrategy !== null;

  return (
    <View className="flex-1 bg-[#1A1A2E]">
      <StatusBar barStyle="light-content" />

      {/* 1. TOP HERO SECTION (Visual/Brand Area) */}
      <SafeAreaView className="flex-1 items-center justify-center">
        {/* Replace with your actual hero graphic/logo */}
        <Image
          source={require("../../../assets/images/auth.png")}
          style={{ width: width * 0.8, height: width * 0.8, maxHeight: 320 }}
          contentFit="contain"
        />
      </SafeAreaView>

      {/* 2. ZEPTO / ZOMATO STYLE BOTTOM ACTION SHEET */}
      <View className="bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-2xl">
        {/* Header Typography */}
        <View className="mb-8 mt-2">
          <Text className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            Get started
          </Text>
          <Text className="text-base text-gray-500 font-medium leading-6">
            Login or sign up to connect with your friends and explore the
            community.
          </Text>
        </View>

        {/* Stacked Action Buttons */}
        <View className="gap-4">
          {/* GOOGLE BUTTON */}
          <Pressable
            className="w-full flex-row items-center justify-center gap-3 bg-white h-14 rounded-2xl border border-gray-200 active:bg-gray-50"
            disabled={isLoading}
            accessibilityRole="button"
            onPress={() => !isLoading && handleSocialAuth("oauth_google")}
          >
            {loadingStrategy === "oauth_google" ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <>
                <Image
                  source={require("../../../assets/images/google.png")}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
                <Text className="text-gray-900 font-bold text-lg">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* APPLE BUTTON */}
          <Pressable
            className="w-full flex-row items-center justify-center gap-3 bg-black h-14 rounded-2xl active:opacity-80"
            disabled={isLoading}
            accessibilityRole="button"
            onPress={() => !isLoading && handleSocialAuth("oauth_apple")}
          >
            {loadingStrategy === "oauth_apple" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-apple" size={24} color="#FFFFFF" />
                <Text className="text-white font-bold text-lg">
                  Continue with Apple
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Footer Terms */}
        <Text className="text-center text-gray-400 text-xs mt-8 font-medium">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </Text>
      </View>
    </View>
  );
};

export default AuthScreen;
