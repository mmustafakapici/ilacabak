import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StorageService, UserProfile } from "../services/storage";

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen = ({ onComplete }: WelcomeScreenProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    phone: "",
  });

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.name || !formData.age) {
        alert("Lütfen adınızı ve yaşınızı giriniz.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.city || !formData.phone) {
        alert("Lütfen şehir ve telefon bilgilerinizi giriniz.");
        return;
      }
      try {
        // Önce kullanıcı profilini kaydet
        const profile: UserProfile = {
          name: formData.name,
          age: parseInt(formData.age),
          city: formData.city,
          phone: formData.phone,
        };
        await StorageService.saveUserProfile(profile);

        // Sonra örnek ilaçları yükle
        await StorageService.loadSampleMedicines();

        // Başarılı mesajı göster
        Alert.alert(
          "Hoş Geldiniz!",
          "Profiliniz oluşturuldu ve örnek ilaçlarınız eklendi. Şimdi ilaçlarınızı takip etmeye başlayabilirsiniz.",
          [
            {
              text: "Başla",
              onPress: onComplete,
            },
          ]
        );
      } catch (error) {
        console.error("Veriler kaydedilirken hata oluştu:", error);
        alert("Bir hata oluştu. Lütfen tekrar deneyiniz.");
      }
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Hoş Geldiniz!</Text>
      <Text style={styles.stepDescription}>
        Size daha iyi yardımcı olabilmem için bazı bilgilere ihtiyacım var.
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Adınız Soyadınız</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: Ahmet Yılmaz"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />
        <Text style={styles.inputLabel}>Yaşınız</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 65"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>İletişim Bilgileri</Text>
      <Text style={styles.stepDescription}>
        Acil durumlarda size ulaşabilmem için iletişim bilgilerinize ihtiyacım
        var.
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Şehir</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: İstanbul"
          value={formData.city}
          onChangeText={(text) => setFormData({ ...formData, city: text })}
        />
        <Text style={styles.inputLabel}>Telefon Numarası</Text>
        <TextInput
          style={styles.input}
          placeholder="Örn: 0555 555 55 55"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          keyboardType="phone-pad"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("../../assets/default-avatar.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>İlaç Takip Uygulaması</Text>
        <Text style={styles.subtitle}>
          İlaçlarınızı zamanında almanız için size yardımcı olacağım
        </Text>

        {step === 1 ? renderStep1() : renderStep2()}

        <View style={styles.progressContainer}>
          <View style={[styles.progressDot, step === 1 && styles.activeDot]} />
          <View style={[styles.progressDot, step === 2 && styles.activeDot]} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {step === 1 ? "Devam Et" : "Başla"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginBottom: 48,
  },
  stepContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 24,
  },
  inputContainer: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    color: "#212121",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: "row",
    marginBottom: 32,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 6,
  },
  activeDot: {
    backgroundColor: "#2196F3",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
