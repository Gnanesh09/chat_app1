import EmptyUI from "../../../components/EmptyUI";
import MessageBubble from "../../../components/MessageBubble";
import { useCurrentUser } from "../../../hooks/useAuth";
import { useMessages } from "../../../hooks/useMessages";
import { useSocketStore } from "../../../lib/socket";
import { MessageSender } from "../../../types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
  TextInput,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ChatParams = {
  id: string;
  participantId: string;
  name: string;
  avatar: string;
};

const ChatDetailScreen = () => {
  const {
    id: chatId,
    avatar,
    name,
    participantId,
  } = useLocalSearchParams<ChatParams>();

  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: currentUser } = useCurrentUser();
  const { data: messages, isLoading } = useMessages(chatId);

  const {
    joinChat,
    leaveChat,
    sendMessage,
    sendTyping,
    isConnected,
    onlineUsers,
    typingUsers,
  } = useSocketStore();

  const isOnline = participantId ? onlineUsers.has(participantId) : false;
  const isTyping = typingUsers.get(chatId) === participantId;

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // join chat room on mount, leave on unmount
  useEffect(() => {
    if (chatId && isConnected) joinChat(chatId);
    return () => {
      if (chatId) leaveChat(chatId);
    };
  }, [chatId, isConnected, joinChat, leaveChat]);

  // scroll to bottom when new messages arrive or keyboard opens
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleTyping = useCallback(
    (text: string) => {
      setMessageText(text);

      if (!isConnected || !chatId) return;

      if (text.length > 0) {
        sendTyping(chatId, true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(chatId, false);
        }, 2000);
      } else {
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        sendTyping(chatId, false);
      }
    },
    [chatId, isConnected, sendTyping],
  );

  const handleSend = () => {
    if (!messageText.trim() || isSending || !isConnected || !currentUser)
      return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(chatId, false);

    setIsSending(true);
    sendMessage(chatId, messageText.trim(), {
      _id: currentUser._id,
      name: currentUser.name,
      email: currentUser.email,
      avatar: currentUser.avatar,
    });

    setMessageText("");
    setIsSending(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // const canSend = messageText.trim().length > 0 && !isSending;
  const insets = useSafeAreaInsets();
  const canSend = messageText.trim().length > 0 && !isSending;
  return (
    // 1. Root view with your background color
    <View style={{ flex: 1, backgroundColor: "#1A1A1D" }}>
      {/* 2. KeyboardAvoidingView wraps EVERYTHING now, including the header */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* 3. Header - Now safely inside the KAV */}
        <View
          style={{ paddingTop: insets.top }}
          className="bg-surface border-b border-surface-light z-10 shadow-sm"
        >
          <View className="flex-row items-center px-4 py-3">
            <Pressable
              className="w-10 h-10 rounded-full bg-surface-card items-center justify-center active:opacity-70 mr-3"
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={24} color="#F4A261" />
            </Pressable>

            <View className="flex-row items-center flex-1">
              <View className="relative">
                {avatar && (
                  <Image
                    source={{ uri: avatar }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                )}
                {isOnline && (
                  <View className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-surface" />
                )}
              </View>

              <View className="ml-3 flex-1 justify-center">
                <Text
                  className="text-foreground font-bold text-lg leading-tight"
                  numberOfLines={1}
                >
                  {name}
                </Text>
                {isTyping ? (
                  <Text className="text-primary text-xs font-medium tracking-wide">
                    typing...
                  </Text>
                ) : (
                  <Text className="text-subtle-foreground text-xs font-medium">
                    {isOnline ? "Active now" : "Offline"}
                  </Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable className="w-10 h-10 rounded-full items-center justify-center active:bg-surface-light">
                <Ionicons name="call" size={20} color="#F4A261" />
              </Pressable>
              <Pressable className="w-10 h-10 rounded-full items-center justify-center active:bg-surface-light">
                <Ionicons name="videocam" size={22} color="#F4A261" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* 4. Chat Area */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center bg-surface-dark">
            <ActivityIndicator size="large" color="#F4A261" />
          </View>
        ) : !messages || messages.length === 0 ? (
          <View className="flex-1 bg-surface-dark">
            <EmptyUI
              title="No messages yet"
              subtitle={`Send a message to start chatting with ${name.split(" ")[0]}`}
              iconName="chatbubble-ellipses-outline"
              iconColor="#F4A261"
              iconSize={72}
            />
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            className="bg-surface-dark"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 24,
            }}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }}
          >
            {messages.map((message, index) => {
              const senderId = (message.sender as MessageSender)._id;
              const isFromMe = currentUser
                ? senderId === currentUser._id
                : false;
              const isLast = index === messages.length - 1;

              return (
                <View
                  key={message._id}
                  style={{ marginBottom: isLast ? 0 : 12 }}
                >
                  <MessageBubble message={message} isFromMe={isFromMe} />
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* 5. Input Bar */}
        <View
          className="px-4 pt-3 bg-surface border-t border-surface-light"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="flex-row items-end bg-surface-card rounded-[28px] px-2 py-1.5 border border-surface-light">
            <Pressable className="w-10 h-10 rounded-full items-center justify-center mb-0.5 active:bg-surface-light">
              <Ionicons name="add" size={26} color="#F4A261" />
            </Pressable>

            <TextInput
              placeholder="Message..."
              placeholderTextColor="#6B6B70"
              className="flex-1 text-foreground text-base pt-3 pb-3 px-2 min-h-[44px]"
              multiline
              style={{ maxHeight: 120 }}
              value={messageText}
              onChangeText={handleTyping}
              editable={!isSending}
            />

            <Pressable
              className={`w-10 h-10 rounded-full items-center justify-center mb-0.5 transition-opacity ${
                canSend
                  ? "bg-primary opacity-100"
                  : "bg-surface-light opacity-50"
              }`}
              onPress={handleSend}
              disabled={!canSend}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#0D0D0F" />
              ) : (
                <Ionicons
                  name="send"
                  size={18}
                  color={canSend ? "#0D0D0F" : "#6B6B70"}
                  style={{ marginLeft: 3 }}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatDetailScreen;
