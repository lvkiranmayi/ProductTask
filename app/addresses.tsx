import { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Formik } from "formik";
import * as yup from "yup";
import { useAuth, type Address } from "../context/AuthContext";

const addressSchema = yup.object({
  name: yup.string().required("Full name is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+?[0-9]{7,15}$/, "Enter a valid phone number"),
  street: yup.string().required("Street address is required"),
  city: yup.string().required("City is required"),
  state: yup.string(),
  postal: yup
    .string()
    .required("Postal code is required")
    .matches(/^[A-Za-z0-9 -]{3,10}$/, "Enter a valid postal code"),
  country: yup.string(),
});

const EMPTY: Address = {
  name: "", phone: "", street: "", city: "", state: "", postal: "", country: "",
};

type FieldRef = React.RefObject<TextInput | null>;

function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  keyboardType,
  maxLength,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  secureTextEntry,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: (e?: any) => void;
  error?: string;
  touched?: boolean;
  keyboardType?: "default" | "phone-pad" | "number-pad" | "email-address";
  maxLength?: number;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: FieldRef;
  secureTextEntry?: boolean;
}) {
  const hasError = touched && !!error;
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#1E1B4B", marginLeft: 2 }}>
        {label}
      </Text>
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        placeholderTextColor="#B0A8D9"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType ?? "default"}
        maxLength={maxLength}
        returnKeyType={returnKeyType ?? "next"}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={returnKeyType === "done"}
        secureTextEntry={secureTextEntry}
        style={{
          height: 50,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: hasError ? "#f87171" : "#EDE8FF",
          backgroundColor: "white",
          paddingHorizontal: 14,
          color: "#1E1B4B",
          fontSize: 14,
        }}
      />
      {hasError && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginLeft: 2 }}>
          <Ionicons name="alert-circle-outline" size={12} color="#f87171" />
          <Text style={{ fontSize: 12, color: "#f87171" }}>{error}</Text>
        </View>
      )}
    </View>
  );
}

export default function AddressesScreen() {
  const { savedAddress, saveAddress } = useAuth();

  const phoneRef = useRef<TextInput>(null);
  const streetRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const postalRef = useRef<TextInput>(null);
  const countryRef = useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
          <StatusBar style="dark" />

          {/* Header */}
          <View style={{
            backgroundColor: "#F6F3FF",
            paddingTop: 56,
            paddingHorizontal: 20,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
                alignItems: "center", justifyContent: "center",
                borderWidth: 1, borderColor: "#EDE8FF", marginRight: 14,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 12, color: "#7C7CB0" }}>Delivery details</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Addresses</Text>
            </View>
          </View>

          <Formik
            initialValues={savedAddress ?? EMPTY}
            enableReinitialize
            validationSchema={addressSchema}
            validateOnBlur
            validateOnChange={false}
            onSubmit={(values) => {
              saveAddress(values as Address);
              Alert.alert("Saved!", "Your address has been saved.", [
                { text: "OK", onPress: () => router.back() },
              ]);
            }}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              >
                {/* Saved badge */}
                {savedAddress && (
                  <View style={{
                    flexDirection: "row", alignItems: "center", gap: 8,
                    backgroundColor: "#D1FAE5", borderRadius: 14, padding: 12, marginBottom: 20,
                  }}>
                    <Ionicons name="checkmark-circle" size={18} color="#065F46" />
                    <Text style={{ fontSize: 13, color: "#065F46", fontWeight: "600" }}>
                      You have a saved address
                    </Text>
                  </View>
                )}

                <View style={{
                  backgroundColor: "white", borderRadius: 20, padding: 20,
                  borderWidth: 1, borderColor: "#EDE8FF", gap: 14,
                  shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
                }}>
                  <FormField
                    label="Full Name *"
                    placeholder="Enter your full name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    error={errors.name}
                    touched={touched.name}
                    returnKeyType="next"
                    onSubmitEditing={() => phoneRef.current?.focus()}
                  />

                  <FormField
                    label="Phone Number *"
                    placeholder="Enter phone number"
                    value={values.phone}
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                    error={errors.phone}
                    touched={touched.phone}
                    keyboardType="phone-pad"
                    maxLength={15}
                    inputRef={phoneRef}
                    returnKeyType="next"
                    onSubmitEditing={() => streetRef.current?.focus()}
                  />

                  <FormField
                    label="Street Address *"
                    placeholder="House no., Street, Area"
                    value={values.street}
                    onChangeText={handleChange("street")}
                    onBlur={handleBlur("street")}
                    error={errors.street}
                    touched={touched.street}
                    inputRef={streetRef}
                    returnKeyType="next"
                    onSubmitEditing={() => cityRef.current?.focus()}
                  />

                  {/* City + State row */}
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="City *"
                        placeholder="City"
                        value={values.city}
                        onChangeText={handleChange("city")}
                        onBlur={handleBlur("city")}
                        error={errors.city}
                        touched={touched.city}
                        inputRef={cityRef}
                        returnKeyType="next"
                        onSubmitEditing={() => stateRef.current?.focus()}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="State"
                        placeholder="State"
                        value={values.state ?? ""}
                        onChangeText={handleChange("state")}
                        onBlur={handleBlur("state")}
                        error={errors.state}
                        touched={touched.state}
                        inputRef={stateRef}
                        returnKeyType="next"
                        onSubmitEditing={() => postalRef.current?.focus()}
                      />
                    </View>
                  </View>

                  {/* Postal + Country row */}
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="Postal Code *"
                        placeholder="PIN / ZIP"
                        value={values.postal}
                        onChangeText={handleChange("postal")}
                        onBlur={handleBlur("postal")}
                        error={errors.postal}
                        touched={touched.postal}
                        keyboardType="number-pad"
                        maxLength={10}
                        inputRef={postalRef}
                        returnKeyType="next"
                        onSubmitEditing={() => countryRef.current?.focus()}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FormField
                        label="Country"
                        placeholder="Country"
                        value={values.country ?? ""}
                        onChangeText={handleChange("country")}
                        onBlur={handleBlur("country")}
                        error={errors.country}
                        touched={touched.country}
                        inputRef={countryRef}
                        returnKeyType="done"
                        onSubmitEditing={() => handleSubmit()}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  style={{
                    marginTop: 24, backgroundColor: "#7C5FFF", borderRadius: 18,
                    height: 54, flexDirection: "row", alignItems: "center",
                    justifyContent: "center", gap: 8,
                    shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
                  }}
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
                    Save Address
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </Formik>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
