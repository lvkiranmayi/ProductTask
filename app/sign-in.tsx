import {
  View, Text, TextInput, TouchableOpacity,
  TouchableWithoutFeedback, ScrollView,
  KeyboardAvoidingView, Keyboard, Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../context/AuthContext";
import { GOOGLE_WEB_CLIENT_ID } from "../lib/firebase";
import { StatusBar } from "expo-status-bar";

WebBrowser.maybeCompleteAuthSession();

const schema = yup.object({
  email: yup.string().required("Email is required").email("Enter a valid email address"),
  password: yup.string().required("Password is required").min(8, "Password must be at least 8 characters"),
});

type FormValues = { email: string; password: string };

function getFirebaseError(code: string): string {
  switch (code) {
    case "auth/user-not-found":       return "No account with this email. Sign up instead?";
    case "auth/wrong-password":       return "Incorrect password. Please try again.";
    case "auth/invalid-credential":   return "Invalid email or password.";
    case "auth/invalid-email":        return "Enter a valid email address.";
    case "auth/too-many-requests":    return "Too many attempts. Try again later.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default:                          return "Something went wrong. Please try again.";
  }
}

export default function SignInScreen() {
  const { signIn, signInWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  // Google OAuth via expo-auth-session
  const [, response, promptAsync] = Google.useIdTokenAuthRequest(
    { clientId: GOOGLE_WEB_CLIENT_ID },
    {}
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      setLoading(true);
      signInWithGoogle(id_token)
        .then(() => router.replace("/(tabs)"))
        .catch((e: any) => setFirebaseError(getFirebaseError(e.code)))
        .finally(() => setLoading(false));
    }
  }, [response, signInWithGoogle]);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setFirebaseError(null);
    setLoading(true);
    try {
      await signIn(values.email, values.password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setFirebaseError(getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  }

  const inputBase = "bg-white rounded-2xl px-4 h-[52px] text-[#1E1B4B] text-[15px]";
  const borderOk  = "border border-[#D4CBFF]";
  const borderErr = "border border-red-400";

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F6F3FF]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      {/* Background blobs */}
      <View className="absolute -top-[100px] -right-[80px] w-[300px] h-[300px] rounded-full bg-[#EDE8FF] opacity-80" />
      <View className="absolute -bottom-[80px] -left-[60px] w-[260px] h-[260px] rounded-full bg-[#D4CBFF] opacity-[0.45]" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-10">

          {/* Brand header */}
          <View className="items-center mb-10">
            <View
              className="w-[72px] h-[72px] rounded-[22px] bg-[#7C5FFF] items-center justify-center mb-4"
              style={{
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.4, shadowRadius: 16, elevation: 12,
              }}
            >
              <Ionicons name="sparkles" size={32} color="#fff" />
            </View>
            <Text className="text-[28px] font-bold text-[#1E1B4B] tracking-[6px]">mira</Text>
            <Text className="text-[13px] text-[#7C7CB0] mt-1 tracking-wide">Sign in to continue</Text>
          </View>

          {/* Firebase error banner */}
          {firebaseError && (
            <View style={{
              backgroundColor: "#FEE2E2", borderRadius: 14, padding: 12,
              flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16,
            }}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
              <Text style={{ fontSize: 13, color: "#EF4444", flex: 1, fontWeight: "500" }}>
                {firebaseError}
              </Text>
              <TouchableOpacity onPress={() => setFirebaseError(null)}>
                <Ionicons name="close" size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          <View className="gap-5">

            {/* Email */}
            <View className="gap-[6px]">
              <Text className="text-[13px] font-semibold text-[#1E1B4B] tracking-wide ml-1">Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`${inputBase} ${touchedFields.email && errors.email ? borderErr : borderOk}`}
                    placeholder="you@example.com"
                    placeholderTextColor="#B0A8D9"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                  />
                )}
              />
              {touchedFields.email && errors.email && (
                <View className="flex-row items-center gap-1 ml-1">
                  <Ionicons name="alert-circle-outline" size={13} color="#f87171" />
                  <Text className="text-red-400 text-[12px]">{errors.email.message}</Text>
                </View>
              )}
            </View>

            {/* Password */}
            <View className="gap-[6px]">
              <Text className="text-[13px] font-semibold text-[#1E1B4B] tracking-wide ml-1">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View className={`flex-row bg-white rounded-2xl px-4 h-[52px] items-center ${touchedFields.password && errors.password ? borderErr : borderOk}`}>
                    <TextInput
                      ref={passwordRef}
                      className="flex-1 text-[#1E1B4B] text-[15px]"
                      placeholder="Min. 8 characters"
                      placeholderTextColor="#B0A8D9"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((p) => !p)} className="pl-2">
                      <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#7C7CB0" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {touchedFields.password && errors.password && (
                <View className="flex-row items-center gap-1 ml-1">
                  <Ionicons name="alert-circle-outline" size={13} color="#f87171" />
                  <Text className="text-red-400 text-[12px]">{errors.password.message}</Text>
                </View>
              )}
            </View>

            {/* Forgot password */}
            <TouchableOpacity className="self-end -mt-2" onPress={() => router.push("/forgot-password")}>
              <Text className="text-[13px] text-[#7C5FFF] font-semibold">Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In button */}
            <TouchableOpacity
              className="bg-[#7C5FFF] rounded-2xl h-[54px] items-center justify-center mt-1"
              style={{
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 8 },
                shadowOpacity: loading ? 0.2 : 0.4, shadowRadius: 16, elevation: 12,
                opacity: loading ? 0.8 : 1,
              }}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold text-[16px]">Signing in…</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-[16px] tracking-widest">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* OR divider */}
            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-[1px] bg-[#D4CBFF]" />
              <Text className="text-[#7C7CB0] text-[12px] tracking-widest uppercase">or</Text>
              <View className="flex-1 h-[1px] bg-[#D4CBFF]" />
            </View>

            {/* Continue with Google */}
            <TouchableOpacity
              className="flex-row bg-white border border-[#D4CBFF] rounded-2xl h-[54px] items-center justify-center gap-3"
              activeOpacity={0.8}
              style={{
                shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
              }}
              onPress={() => promptAsync()}
              disabled={loading}
            >
              <FontAwesome name="google" size={20} color="#EA4335" />
              <Text className="text-[#1E1B4B] font-semibold text-[15px]">Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign up link */}
            <View className="flex-row justify-center items-center gap-1 mt-1">
              <Text className="text-[14px] text-[#7C7CB0]">Don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/sign-up" as any)}>
                <Text className="text-[14px] text-[#7C5FFF] font-semibold"> Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
