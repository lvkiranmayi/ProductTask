import { useRef, useState } from "react";
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
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

type SavedCard = {
  id: string;
  label: string;
  last4: string;
  expiry: string;
  type: "credit" | "debit";
};

type SavedUPI = { id: string; upiId: string };

type CardFormValues = {
  number: string;
  expiry: string;
  cvv: string;
  holder: string;
};

type UPIFormValues = { upiId: string };

const cardSchema = yup.object({
  number: yup
    .string()
    .required("Card number is required")
    .matches(/^[0-9]{16}$/, "Enter a valid 16-digit card number"),
  expiry: yup
    .string()
    .required("Expiry is required")
    .matches(/^(0[1-9]|1[0-2])\/[0-9]{2}$/, "Format: MM/YY"),
  cvv: yup
    .string()
    .required("CVV is required")
    .matches(/^[0-9]{3,4}$/, "Enter 3–4 digit CVV"),
  holder: yup.string().required("Name on card is required"),
});

const upiSchema = yup.object({
  upiId: yup
    .string()
    .required("UPI ID is required")
    .matches(/.+@.+/, "Enter a valid UPI ID (e.g. name@upi)"),
});

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 }}>
      <Ionicons name="alert-circle-outline" size={12} color="#f87171" />
      <Text style={{ fontSize: 11, color: "#f87171" }}>{message}</Text>
    </View>
  );
}

const inputStyle = {
  height: 50,
  borderRadius: 14,
  borderWidth: 1,
  borderColor: "#EDE8FF",
  backgroundColor: "#FAFAFF",
  paddingHorizontal: 14,
  color: "#1E1B4B",
  fontSize: 14,
};

const inputErrStyle = { ...inputStyle, borderColor: "#f87171" };

export default function PaymentMethodsScreen() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [upis, setUpis] = useState<SavedUPI[]>([]);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showAddUPI, setShowAddUPI] = useState(false);
  const [cardType, setCardType] = useState<"credit" | "debit">("credit");

  /* ── Card form — React Hook Form ── */
  const cardForm = useForm<CardFormValues>({
    resolver: yupResolver(cardSchema),
    mode: "onBlur",
    defaultValues: { number: "", expiry: "", cvv: "", holder: "" },
  });

  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const holderRef = useRef<TextInput>(null);

  function onSaveCard(values: CardFormValues) {
    setCards((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        label: values.holder,
        last4: values.number.slice(-4),
        expiry: values.expiry,
        type: cardType,
      },
    ]);
    cardForm.reset();
    setShowAddCard(false);
  }

  /* ── UPI form — React Hook Form ── */
  const upiForm = useForm<UPIFormValues>({
    resolver: yupResolver(upiSchema),
    mode: "onBlur",
    defaultValues: { upiId: "" },
  });

  function onSaveUPI(values: UPIFormValues) {
    setUpis((prev) => [...prev, { id: Date.now().toString(), upiId: values.upiId.trim() }]);
    upiForm.reset();
    setShowAddUPI(false);
  }

  function removeCard(id: string) {
    Alert.alert("Remove Card", "Remove this card?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setCards((p) => p.filter((c) => c.id !== id)) },
    ]);
  }

  function removeUPI(id: string) {
    Alert.alert("Remove UPI", "Remove this UPI ID?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setUpis((p) => p.filter((u) => u.id !== id)) },
    ]);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: "#F6F3FF" }}>
          <StatusBar style="dark" />

          {/* Header */}
          <View style={{
            backgroundColor: "#F6F3FF", paddingTop: 56,
            paddingHorizontal: 20, paddingBottom: 16,
            flexDirection: "row", alignItems: "center",
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
              <Text style={{ fontSize: 12, color: "#7C7CB0" }}>Manage your methods</Text>
              <Text style={{ fontSize: 22, fontWeight: "bold", color: "#1E1B4B" }}>Payment Methods</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          >
            {/* ── Cards section ── */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B", marginBottom: 12 }}>
              Saved Cards
            </Text>

            {cards.length === 0 && !showAddCard && (
              <View style={{
                backgroundColor: "white", borderRadius: 18, padding: 20,
                borderWidth: 1, borderColor: "#EDE8FF", alignItems: "center", marginBottom: 12,
              }}>
                <Ionicons name="card-outline" size={32} color="#D4CBFF" />
                <Text style={{ fontSize: 13, color: "#7C7CB0", marginTop: 8 }}>No saved cards</Text>
              </View>
            )}

            {cards.map((card) => (
              <View key={card.id} style={{
                backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: "#EDE8FF", flexDirection: "row", alignItems: "center",
                shadowColor: "#7C5FFF", shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: "#EDE8FF",
                  alignItems: "center", justifyContent: "center", marginRight: 14,
                }}>
                  <Ionicons name="card" size={22} color="#7C5FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#1E1B4B" }}>{card.label}</Text>
                  <Text style={{ fontSize: 12, color: "#7C7CB0", marginTop: 2 }}>
                    {card.type === "credit" ? "Credit" : "Debit"} •••• {card.last4} · Exp {card.expiry}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeCard(card.id)}>
                  <Ionicons name="trash-outline" size={18} color="#F0A0D8" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add card form — React Hook Form */}
            {showAddCard ? (
              <View style={{
                backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: "#EDE8FF", gap: 12,
              }}>
                {/* Card type toggle */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {(["credit", "debit"] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setCardType(t)}
                      style={{
                        flex: 1, height: 40, borderRadius: 12, borderWidth: 1.5,
                        borderColor: cardType === t ? "#7C5FFF" : "#EDE8FF",
                        backgroundColor: cardType === t ? "#EDE8FF" : "white",
                        alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "600", color: cardType === t ? "#7C5FFF" : "#7C7CB0" }}>
                        {t === "credit" ? "Credit Card" : "Debit Card"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Card number */}
                <View>
                  <Controller
                    control={cardForm.control}
                    name="number"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Card Number (16 digits)"
                        placeholderTextColor="#B0A8D9"
                        style={cardForm.formState.errors.number ? inputErrStyle : inputStyle}
                        keyboardType="number-pad"
                        maxLength={16}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="next"
                        onSubmitEditing={() => expiryRef.current?.focus()}
                        blurOnSubmit={false}
                      />
                    )}
                  />
                  <FieldError message={cardForm.formState.errors.number?.message} />
                </View>

                {/* Expiry + CVV */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={cardForm.control}
                      name="expiry"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          ref={expiryRef}
                          placeholder="MM / YY"
                          placeholderTextColor="#B0A8D9"
                          style={cardForm.formState.errors.expiry ? inputErrStyle : inputStyle}
                          maxLength={5}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          returnKeyType="next"
                          onSubmitEditing={() => cvvRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      )}
                    />
                    <FieldError message={cardForm.formState.errors.expiry?.message} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Controller
                      control={cardForm.control}
                      name="cvv"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                          ref={cvvRef}
                          placeholder="CVV"
                          placeholderTextColor="#B0A8D9"
                          style={cardForm.formState.errors.cvv ? inputErrStyle : inputStyle}
                          keyboardType="number-pad"
                          maxLength={4}
                          secureTextEntry
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          returnKeyType="next"
                          onSubmitEditing={() => holderRef.current?.focus()}
                          blurOnSubmit={false}
                        />
                      )}
                    />
                    <FieldError message={cardForm.formState.errors.cvv?.message} />
                  </View>
                </View>

                {/* Name on card */}
                <View>
                  <Controller
                    control={cardForm.control}
                    name="holder"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        ref={holderRef}
                        placeholder="Name on Card"
                        placeholderTextColor="#B0A8D9"
                        style={cardForm.formState.errors.holder ? inputErrStyle : inputStyle}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        returnKeyType="done"
                        onSubmitEditing={cardForm.handleSubmit(onSaveCard)}
                      />
                    )}
                  />
                  <FieldError message={cardForm.formState.errors.holder?.message} />
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowAddCard(false); cardForm.reset(); }}
                    style={{
                      flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
                      borderColor: "#EDE8FF", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#7C7CB0", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={cardForm.handleSubmit(onSaveCard)}
                    style={{
                      flex: 1, height: 44, borderRadius: 12,
                      backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>Save Card</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowAddCard(true)}
                style={{
                  height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: "#7C5FFF",
                  borderStyle: "dashed", alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6, marginBottom: 24,
                }}
              >
                <Ionicons name="add" size={18} color="#7C5FFF" />
                <Text style={{ color: "#7C5FFF", fontWeight: "600", fontSize: 14 }}>Add Card</Text>
              </TouchableOpacity>
            )}

            {/* ── UPI section ── */}
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E1B4B", marginBottom: 12 }}>
              UPI IDs
            </Text>

            {upis.length === 0 && !showAddUPI && (
              <View style={{
                backgroundColor: "white", borderRadius: 18, padding: 20,
                borderWidth: 1, borderColor: "#EDE8FF", alignItems: "center", marginBottom: 12,
              }}>
                <Ionicons name="phone-portrait-outline" size={32} color="#D4CBFF" />
                <Text style={{ fontSize: 13, color: "#7C7CB0", marginTop: 8 }}>No UPI IDs saved</Text>
              </View>
            )}

            {upis.map((u) => (
              <View key={u.id} style={{
                backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 10,
                borderWidth: 1, borderColor: "#EDE8FF", flexDirection: "row", alignItems: "center",
              }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 12, backgroundColor: "#FDE8F5",
                  alignItems: "center", justifyContent: "center", marginRight: 14,
                }}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#F0A0D8" />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: "#1E1B4B" }}>{u.upiId}</Text>
                <TouchableOpacity onPress={() => removeUPI(u.id)}>
                  <Ionicons name="trash-outline" size={18} color="#F0A0D8" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add UPI form — React Hook Form */}
            {showAddUPI ? (
              <View style={{
                backgroundColor: "white", borderRadius: 18, padding: 16, marginBottom: 12,
                borderWidth: 1, borderColor: "#EDE8FF", gap: 12,
              }}>
                <View>
                  <Controller
                    control={upiForm.control}
                    name="upiId"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        placeholder="Enter UPI ID (e.g. name@upi)"
                        placeholderTextColor="#B0A8D9"
                        style={upiForm.formState.errors.upiId ? inputErrStyle : inputStyle}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={upiForm.handleSubmit(onSaveUPI)}
                        autoFocus
                      />
                    )}
                  />
                  <FieldError message={upiForm.formState.errors.upiId?.message} />
                </View>

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setShowAddUPI(false); upiForm.reset(); }}
                    style={{
                      flex: 1, height: 44, borderRadius: 12, borderWidth: 1,
                      borderColor: "#EDE8FF", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#7C7CB0", fontWeight: "600" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={upiForm.handleSubmit(onSaveUPI)}
                    style={{
                      flex: 1, height: 44, borderRadius: 12,
                      backgroundColor: "#7C5FFF", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "700" }}>Save UPI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setShowAddUPI(true)}
                style={{
                  height: 48, borderRadius: 14, borderWidth: 1.5, borderColor: "#7C5FFF",
                  borderStyle: "dashed", alignItems: "center", justifyContent: "center",
                  flexDirection: "row", gap: 6,
                }}
              >
                <Ionicons name="add" size={18} color="#7C5FFF" />
                <Text style={{ color: "#7C5FFF", fontWeight: "600", fontSize: 14 }}>Add UPI ID</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
