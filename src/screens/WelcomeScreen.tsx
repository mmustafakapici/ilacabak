import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StorageService } from "../services/storage";
import { useTheme } from "../context/ThemeContext";

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    try {
      const userProfile = {
        name: name.trim(),
        age: parseInt(age),
        city,
        phone,
      };

      await StorageService.saveUserProfile(userProfile);
      await StorageService.setFirstLaunch(false);
      navigation.navigate("Home");
    } catch (error) {
      console.error("Kullanıcı bilgileri kaydedilirken hata:", error);
      Alert.alert("Hata", "Kullanıcı bilgileri kaydedilirken bir hata oluştu");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <MaterialIcons
          name="medication"
          size={64}
          color={theme.colors.primary}
        />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          İlaç Takip Uygulamasına Hoş Geldiniz
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Lütfen kendiniz hakkında bilgi verin
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Adınız
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Adınızı girin"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Yaşınız
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={age}
            onChangeText={setAge}
            placeholder="Yaşınızı girin"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Şehir
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={city}
            onChangeText={setCity}
            placeholder="Şehir girin"
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text }]}>
            Telefon Numarası
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
              },
            ]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Telefon numarası girin"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Başla</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: "center",
  },
  formGroup: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  button: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
