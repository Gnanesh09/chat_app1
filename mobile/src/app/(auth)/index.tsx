import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import useAuthSocial from "../../../hooks/useSocialAuth";

const AuthScreen = () => {
  const { handleSocialAuth, loadingStrategy } = useAuthSocial();
  const isLoading = loadingStrategy !== null;

  return (
    <View className="flex-1">
      {/* Translucent status bar lets the gradient bleed behind the camera notch */}
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* FULL SCREEN BACKGROUND GRADIENT */}
      <LinearGradient
        colors={["#FF5D0D", "#FF5D0D", "#0D0D0F"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.8 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      {/* 1. TOP HERO SECTION (Beautiful Typography) */}
      <SafeAreaView className="flex-1 justify-center px-8">
        <View className="mb-10">
          <Text className="text-white text-7xl font-black tracking-tighter mb-4 shadow-sm">
            Text to Anybody
          </Text>
          <Text className="text-white/80 text-lg font-medium leading-relaxed pr-8">
            Talking is boundryless, share as much as you can, find friends and
            build connection
          </Text>
        </View>
      </SafeAreaView>

      {/* 2. BOTTOM ACTION SHEET */}
      <View className="bg-white rounded-t-[36px] px-6 pt-8 pb-10 shadow-2xl">
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
        <Text className="text-center text-gray-800 text-[8px] mt-3 font-medium">
          Developed by zoofly Inc .
        </Text>
      </View>
    </View>
  );
};

export default AuthScreen;
