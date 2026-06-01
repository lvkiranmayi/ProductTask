import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

type Method = "email" | "sms";

const emailSchema = yup.object({
  value: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email address"),
});

const smsSchema = yup.object({
  value: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[0-9]{10,14}$/, "Enter a valid phone number (10–14 digits)"),
});

const METHODS: {
  key: Method;
  icon: string;
  label: string;
  desc: string;
  placeholder: string;
  keyboardType: "email-address" | "phone-pad";
}[] = [
  {
    key: "email",
    icon: "mail-outline",
    label: "Via Email",
    desc: "We'll send a password reset link to your email address",
    placeholder: "you@example.com",
    keyboardType: "email-address",
  },
  {
    key: "sms",
    icon: "phone-portrait-outline",
    label: "Via SMS",
    desc: "We'll send a verification code to your phone number",
    placeholder: "+1 234 567 8900",
    keyboardType: "phone-pad",
  },
];

export default function ForgotPasswordScreen() {
  const [selected, setSelected] = useState<Method | null>(null);
  const [sent, setSent] = useState(false);
  const [sentValue, setSentValue] = useState("");

  const activeMethod = METHODS.find((m) => m.key === selected);
  const validationSchema = selected === "email" ? emailSchema : smsSchema;

  function handleSelectMethod(method: Method) {
    setSelected(method);
    setSent(false);
    setSentValue("");
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-[#F6F3FF]"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="dark" />

      {/* Dismiss keyboard on outside tap */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      {/* Background blob */}
      <View className="absolute -top-[100px] -right-[80px] w-[280px] h-[280px] rounded-full bg-[#EDE8FF] opacity-70" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-14 pb-10">

          {/* Back button */}
          <TouchableOpacity
            className="flex-row items-center gap-1 mb-8 self-start"
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color="#7C5FFF" />
            <Text className="text-[14px] text-[#7C5FFF] font-semibold">Back</Text>
          </TouchableOpacity>

          {/* Header */}
          <View className="mb-8">
            <View
              className="w-[60px] h-[60px] rounded-[18px] bg-[#7C5FFF] items-center justify-center mb-5"
              style={{
                shadowColor: "#7C5FFF",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 10,
              }}
            >
              <Ionicons name="lock-closed-outline" size={26} color="#fff" />
            </View>
            <Text className="text-[26px] font-bold text-[#1E1B4B] mb-2">
              Forgot Password?
            </Text>
            <Text className="text-[14px] text-[#7C7CB0] leading-5">
              No worries! Choose how you'd like to reset your password.
            </Text>
          </View>

          {/* Method cards */}
          <View className="gap-3 mb-6">
            {METHODS.map((method) => {
              const isActive = selected === method.key;
              return (
                <TouchableOpacity
                  key={method.key}
                  onPress={() => handleSelectMethod(method.key)}
                  activeOpacity={0.8}
                  className={`flex-row items-center gap-4 p-4 rounded-2xl border ${
                    isActive
                      ? "bg-[#EDE8FF] border-[#7C5FFF]"
                      : "bg-white border-[#D4CBFF]"
                  }`}
                  style={
                    isActive
                      ? {
                          shadowColor: "#7C5FFF",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.15,
                          shadowRadius: 8,
                          elevation: 4,
                        }
                      : undefined
                  }
                >
                  <View
                    className={`w-[46px] h-[46px] rounded-full items-center justify-center ${
                      isActive ? "bg-[#7C5FFF]" : "bg-[#F6F3FF]"
                    }`}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={22}
                      color={isActive ? "#fff" : "#7C7CB0"}
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-[15px] font-semibold mb-[2px] ${
                        isActive ? "text-[#7C5FFF]" : "text-[#1E1B4B]"
                      }`}
                    >
                      {method.label}
                    </Text>
                    <Text className="text-[12px] text-[#7C7CB0] leading-4">
                      {method.desc}
                    </Text>
                  </View>
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                      isActive ? "border-[#7C5FFF] bg-[#7C5FFF]" : "border-[#D4CBFF]"
                    }`}
                  >
                    {isActive && (
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Formik form — shown after method selection */}
          {selected && !sent && (
            <Formik
              key={selected}
              initialValues={{ value: "" }}
              validationSchema={validationSchema}
              validateOnBlur
              validateOnChange={false}
              onSubmit={(values) => {
                setSentValue(values.value);
                setSent(true);
              }}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View className="gap-4">
                  <View className="gap-[6px]">
                    <Text className="text-[13px] font-semibold text-[#1E1B4B] tracking-wide ml-1">
                      {selected === "email" ? "Email Address" : "Phone Number"}
                    </Text>
                    <TextInput
                      className={`bg-white rounded-2xl px-4 h-[52px] text-[#1E1B4B] text-[15px] border ${
                        touched.value && errors.value
                          ? "border-red-400"
                          : "border-[#D4CBFF]"
                      }`}
                      placeholder={activeMethod?.placeholder}
                      placeholderTextColor="#B0A8D9"
                      value={values.value}
                      onChangeText={handleChange("value")}
                      onBlur={handleBlur("value")}
                      keyboardType={activeMethod?.keyboardType}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={() => handleSubmit()}
                      autoFocus
                    />
                    {touched.value && errors.value && (
                      <View className="flex-row items-center gap-1 ml-1">
                        <Ionicons name="alert-circle-outline" size={13} color="#f87171" />
                        <Text className="text-red-400 text-[12px]">{errors.value}</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    className="bg-[#7C5FFF] rounded-2xl h-[54px] items-center justify-center"
                    style={{
                      shadowColor: "#7C5FFF",
                      shadowOffset: { width: 0, height: 8 },
                      shadowOpacity: 0.35,
                      shadowRadius: 14,
                      elevation: 10,
                    }}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.85}
                  >
                    <Text className="text-white font-bold text-[15px] tracking-widest">
                      {selected === "email" ? "Send Reset Link" : "Send Code"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          )}

          {/* Success state */}
          {sent && (
            <View className="gap-4">
              <View className="bg-[#EDE8FF] border border-[#A78BFA] rounded-2xl p-4 flex-row items-start gap-3">
                <Ionicons name="checkmark-circle" size={22} color="#7C5FFF" />
                <View className="flex-1">
                  <Text className="text-[14px] font-semibold text-[#1E1B4B] mb-1">
                    {selected === "email" ? "Reset link sent!" : "Code sent!"}
                  </Text>
                  <Text className="text-[13px] text-[#7C7CB0] leading-[18px]">
                    {selected === "email"
                      ? `We've sent a password reset link to ${sentValue}. Check your inbox.`
                      : `We've sent a verification code to ${sentValue}. Check your messages.`}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                className="bg-[#A78BFA] rounded-2xl h-[54px] items-center justify-center"
                style={{
                  shadowColor: "#7C5FFF",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.35,
                  shadowRadius: 14,
                  elevation: 10,
                }}
                onPress={() => router.back()}
                activeOpacity={0.85}
              >
                <Text className="text-white font-bold text-[15px] tracking-widest">
                  Back to Sign In
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to sign in (no method selected) */}
          {!selected && (
            <TouchableOpacity
              className="items-center mt-4"
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Text className="text-[14px] text-[#7C7CB0]">
                Remember your password?{" "}
                <Text className="text-[#7C5FFF] font-semibold">Sign In</Text>
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
