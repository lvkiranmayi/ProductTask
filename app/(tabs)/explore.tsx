import { View, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ExploreScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View className="flex-1 bg-white dark:bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black p-6">
        <Text className="text-black dark:text-white text-lg text-center mb-4">
          Camera access is required to use this feature.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="bg-[#7C5FFF] px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-bold text-center">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView className="flex-1" facing="back" />
    </View>
  );
}
