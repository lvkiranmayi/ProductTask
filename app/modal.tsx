import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";

export default function Modal() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-black p-6">
      <Text className="text-2xl font-bold text-black dark:text-white mb-4">
        About TaskManager
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-8">
        A simple task manager app built with Expo, NativeWind, and expo-router.
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-red-400 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-bold">Close</Text>
      </TouchableOpacity>
    </View>
  );
}


    