import { Stack } from "expo-router";
import "../../global.css";
import { ClerkProvider } from "@clerk/expo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { tokenCache } from "@clerk/expo/token-cache";
import AuthSync from "../../components/AuthSync";
import * as Sentry from "@sentry/react-native";
import SocketConnection from "../../components/SocketConnection";
Sentry.init({
  dsn: "https://b2722185288a21da084e294dc9768523@o4510522616709120.ingest.de.sentry.io/4511830130294864",

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// export default Sentry.wrap(App);

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <SocketConnection />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#0d0d0f" },
          }}
        >
          <Stack.Screen
            name="(auth)"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          {/* <Stack.Screen name="(auth)" options={{ animation: "fade" }} /> */}
          <Stack.Screen
            name="new-chat"
            options={{
              animation: "slide_from_bottom",
              presentation: "modal",
              gestureEnabled: true,
            }}
          />
        </Stack>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
