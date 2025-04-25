import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface UserInfo {
  name: string;
  age: string;
  city: string;
  phone: string;
  email: string;
  emergencyContact: string;
}

export const UserInfoForm = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: "Ahmet Yılmaz",
    age: "65",
    city: "İstanbul",
    phone: "0532 123 45 67",
    email: "ahmet.yilmaz@email.com",
    emergencyContact: "0533 765 43 21",
  });

  const handleSave = () => {
    // TODO: Bilgileri kaydetme işlemi
    console.log("Bilgiler kaydedildi:", userInfo);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput
          style={styles.input}
          value={userInfo.name}
          onChangeText={(text) => setUserInfo({ ...userInfo, name: text })}
          placeholder="Ad Soyad"
          fontSize={18}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Yaş</Text>
        <TextInput
          style={styles.input}
          value={userInfo.age}
          onChangeText={(text) => setUserInfo({ ...userInfo, age: text })}
          keyboardType="numeric"
          placeholder="Yaş"
          fontSize={18}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Şehir</Text>
        <TextInput
          style={styles.input}
          value={userInfo.city}
          onChangeText={(text) => setUserInfo({ ...userInfo, city: text })}
          placeholder="Şehir"
          fontSize={18}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Telefon</Text>
        <TextInput
          style={styles.input}
          value={userInfo.phone}
          onChangeText={(text) => setUserInfo({ ...userInfo, phone: text })}
          keyboardType="phone-pad"
          placeholder="Telefon"
          fontSize={18}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>E-posta</Text>
        <TextInput
          style={styles.input}
          value={userInfo.email}
          onChangeText={(text) => setUserInfo({ ...userInfo, email: text })}
          keyboardType="email-address"
          placeholder="E-posta"
          fontSize={18}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Acil Durum İletişim</Text>
        <TextInput
          style={styles.input}
          value={userInfo.emergencyContact}
          onChangeText={(text) =>
            setUserInfo({ ...userInfo, emergencyContact: text })
          }
          keyboardType="phone-pad"
          placeholder="Acil Durum İletişim"
          fontSize={18}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#424242",
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
