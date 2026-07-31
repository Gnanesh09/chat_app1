import { ScrollView, Text, StatusBar, Button } from "react-native";
import * as Sentry from "@sentry/react-native";
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
      <Button
        title="Try!"
        onPress={() => {
          Sentry.captureException(new Error("First error"));
        }}
      />
    </ScrollView>
  );
}
