// import { View, Text } from "react-native";
import { useAuth } from "@clerk/expo";
import React from "react";
import { Pressable, ScrollView, StatusBar, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProfileTab = () => {
  const { signOut } = useAuth();
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: StatusBar.currentHeight ?? 20,
        paddingHorizontal: 16,
      }}
      className="bg-surface"
    >
      <Text className="text-yellow-300">profilrTab</Text>
      <Pressable onPress={() => signOut()}>
        <Text className=" text-cyan-300 text-2xl">signout</Text>
      </Pressable>
    </ScrollView>
  );
};

export default ProfileTab;
