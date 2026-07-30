import { ScrollView, Text, StatusBar } from "react-native";

export default function ChatsTab() {
  return (
    <ScrollView
      contentContainerStyle={{
        paddingTop: StatusBar.currentHeight ?? 20,
        paddingHorizontal: 16,
      }}
      className="bg-surface"
    >
      <Text className="text-yellow-300">ChatsTab</Text>
    </ScrollView>
  );
}
