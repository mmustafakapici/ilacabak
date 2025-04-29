import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StorageService } from "../services/storage";
import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { Medicine } from "../types/medicine";
import { ImgToMedicineService } from "../services/ImgToMedicineService";
import { UsageService } from "../services/UsageService";
import { MedicineUsage } from "../types/usage";
import { MedicineContext } from "../context/MedicineContext";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMedicine } from "../context/MedicineContext";

console.log("💊 İlaç ekleme ekranı yükleniyor...");

type AddMedicineScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddMedicine"
>;

const TIME_OPTIONS = [
  { label: "Sabah", value: "08:00" },
  { label: "Öğle", value: "12:00" },
  { label: "Akşam", value: "18:00" },
  { label: "Gece", value: "22:00" },
];

const FREQUENCY_OPTIONS = [
  { label: "Günlük", value: "GÜNLÜK" },
  { label: "Haftalık", value: "HAFTALIK" },
  { label: "Aylık", value: "AYLIK" },
  { label: "Özel", value: "ÖZEL" },
];

const TYPE_OPTIONS = [
  { label: "Tablet", value: "TABLET" },
  { label: "Kapsül", value: "KAPSÜL" },
  { label: "Şurup", value: "ŞURUP" },
  { label: "İğne", value: "İĞNE" },
  { label: "Ampul", value: "AMPUL" },
  { label: "Damla", value: "DAMLA" },
  { label: "Gargara", value: "GARGARA" },
];

const UNIT_OPTIONS = [
  { label: "MG", value: "MG" },
  { label: "ML", value: "ML" },
  { label: "MCG", value: "MCG" },
  { label: "GR", value: "GR" },
];

const AddMedicineScreen = () => {
  const navigation = useNavigation<AddMedicineScreenNavigationProp>();
  const { addMedicine } = useMedicine();
  const [medicine, setMedicine] = useState<Medicine>({
    id: Date.now().toString(),
    name: "",
    dosage: {
      amount: 0,
      unit: "MG",
    },
    type: "TABLET",
    usage: {
      frequency: "GÜNLÜK",
      time: [],
      condition: "",
    },
    schedule: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      reminders: [],
    },
    notes: "",
    taken: false,
  });
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>("");
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  console.log("📝 İlaç formu durumu:", {
    isim: medicine.name,
    tip: medicine.type,
    dozaj: medicine.dosage,
    kullanım: medicine.usage,
  });

  const processImage = async (uri: string) => {
    console.log("🖼️ Görüntü işleme başlatılıyor...");
    console.log("📸 İşlenecek görüntü URI:", uri);

    try {
      setIsProcessing(true);
      console.log(
        "🔍 ImgToMedicineService.processImageToMedicine çağrılıyor..."
      );
      const result = await ImgToMedicineService.processImageToMedicine(uri);
      console.log("✅ Görüntü işleme sonucu:", JSON.stringify(result, null, 2));

      setMedicine(result);
      setOcrText(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error("❌ Görüntü işlenirken hata oluştu:", error);
      Alert.alert("Hata", "Görüntü işlenirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
      console.log("🏁 Görüntü işleme tamamlandı");
    }
  };

  const pickImage = async () => {
    console.log("📱 Galeriden görüntü seçme işlemi başlatılıyor...");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.warn("⚠️ Galeri izni reddedildi");
      Alert.alert("İzin Gerekli", "Galeriye erişim izni gerekiyor.");
      return;
    }

    console.log("🖼️ Galeri açılıyor...");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("✅ Görüntü seçildi:", result.assets[0].uri);
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    } else {
      console.log("❌ Görüntü seçme işlemi iptal edildi");
    }
  };

  const takePhoto = async () => {
    console.log("📸 Kamera ile fotoğraf çekme işlemi başlatılıyor...");

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      console.warn("⚠️ Kamera izni reddedildi");
      Alert.alert("İzin Gerekli", "Kameraya erişim izni gerekiyor.");
      return;
    }

    console.log("📷 Kamera açılıyor...");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      console.log("✅ Fotoğraf çekildi:", result.assets[0].uri);
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    } else {
      console.log("❌ Fotoğraf çekme işlemi iptal edildi");
    }
  };

  const showImagePickerOptions = () => {
    console.log("🖼️ Görüntü seçme seçenekleri gösteriliyor...");
    Alert.alert(
      "İlaç Görüntüsü Ekle",
      "Nasıl bir görüntü eklemek istersiniz?",
      [
        {
          text: "Galeriden Seç",
          onPress: pickImage,
        },
        {
          text: "Kamera ile Çek",
          onPress: takePhoto,
        },
        {
          text: "İptal",
          style: "cancel",
          onPress: () => console.log("❌ Görüntü seçme işlemi iptal edildi"),
        },
      ]
    );
  };

  const handleSave = () => {
    console.log("💾 İlaç kaydetme işlemi başlatılıyor...");
    if (!medicine.name || medicine.usage.time.length === 0) {
      console.warn("⚠️ Eksik bilgi: İlaç adı veya kullanım zamanları");
      Alert.alert("Hata", "Lütfen ilaç adı ve kullanım zamanlarını belirtin");
      return;
    }

    console.log("📝 İlaç bilgileri kontrol ediliyor...");
    const medicineToSave = {
      ...medicine,
      dosage:
        medicine.dosage.amount > 0
          ? medicine.dosage
          : {
              amount: 0,
              unit: "MG",
            },
    };

    console.log("✅ İlaç kaydediliyor:", medicineToSave);
    addMedicine(medicineToSave);
    console.log("🏁 İlaç kaydedildi, ana ekrana dönülüyor");
    navigation.goBack();
  };

  const renderHelpText = (text: string) => (
    <Text style={styles.helpText}>{text}</Text>
  );

  const renderModal = (
    visible: boolean,
    title: string,
    children: React.ReactNode,
    onClose: () => void
  ) => {
    console.log(`📱 Modal gösteriliyor: ${title}`);
    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
            {children}
          </View>
        </View>
      </Modal>
    );
  };

  const handleTimeSelect = (time: string) => {
    console.log("⏰ Zaman seçimi yapılıyor:", time);
    if (medicine.usage.time.includes(time)) {
      console.log("❌ Zaman zaten seçili, kaldırılıyor");
      setMedicine({
        ...medicine,
        usage: {
          ...medicine.usage,
          time: medicine.usage.time.filter((t) => t !== time),
        },
      });
    } else {
      console.log("✅ Yeni zaman eklendi");
      setMedicine({
        ...medicine,
        usage: {
          ...medicine.usage,
          time: [...medicine.usage.time, time],
        },
      });
    }
  };

  const handleTypeChange = (value: string) => {
    setMedicine({ ...medicine, type: value });
  };

  const handleFrequencyChange = (value: string) => {
    setMedicine({
      ...medicine,
      usage: { ...medicine.usage, frequency: value },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={showImagePickerOptions}
      >
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Görüntü İşleniyor...</Text>
          </View>
        ) : image ? (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="camera" size={32} color="#2196F3" />
            <Text style={styles.imageButtonText}>Görüntü ile İlaç Ekle</Text>
          </View>
        )}
      </TouchableOpacity>

      {ocrText && (
        <View style={styles.ocrResultContainer}>
          <Text style={styles.ocrResultTitle}>OCR Sonucu:</Text>
          <Text style={styles.ocrResultText}>{ocrText}</Text>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>İlaç Adı</Text>
        {renderHelpText("İlacın tam adını yazınız")}
        <TextInput
          style={styles.input}
          value={medicine.name}
          onChangeText={(text) => setMedicine({ ...medicine, name: text })}
          placeholder="Örn: Aspirin"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Dozaj (Opsiyonel)</Text>
        {renderHelpText("İlacın dozaj miktarını yazınız")}
        <View style={styles.dosageContainer}>
          <TextInput
            style={[styles.input, styles.dosageInput]}
            value={medicine.dosage.amount.toString()}
            onChangeText={(text) =>
              setMedicine({
                ...medicine,
                dosage: { ...medicine.dosage, amount: parseFloat(text) || 0 },
              })
            }
            keyboardType="numeric"
            placeholder="Miktar"
            placeholderTextColor="#757575"
          />
          <TouchableOpacity
            style={styles.unitButton}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={styles.unitButtonText}>{medicine.dosage.unit}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>İlaç Tipi</Text>
        {renderHelpText("İlacın kullanım şeklini seçiniz")}
        <Picker
          selectedValue={medicine.type}
          style={styles.picker}
          onValueChange={handleTypeChange}
        >
          {TYPE_OPTIONS.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kullanım Sıklığı</Text>
        {renderHelpText("İlacı ne sıklıkta kullanacağınızı seçiniz")}
        <Picker
          selectedValue={medicine.usage.frequency}
          style={styles.picker}
          onValueChange={handleFrequencyChange}
        >
          {FREQUENCY_OPTIONS.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kullanım Zamanları</Text>
        {renderHelpText("İlacı hangi saatlerde almanız gerektiğini seçiniz")}
        <View style={styles.timeContainer}>
          {TIME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeButton,
                medicine.usage.time.includes(option.value) &&
                  styles.timeButtonSelected,
              ]}
              onPress={() => handleTimeSelect(option.value)}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  medicine.usage.time.includes(option.value) &&
                    styles.timeButtonTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Başlangıç Tarihi</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text>
            {new Date(medicine.schedule.startDate).toLocaleDateString("tr-TR")}
          </Text>
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={new Date(medicine.schedule.startDate)}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setMedicine({
                  ...medicine,
                  schedule: {
                    ...medicine.schedule,
                    startDate: selectedDate.toISOString().split("T")[0],
                  },
                });
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Bitiş Tarihi (Opsiyonel)</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text>
            {medicine.schedule.endDate
              ? new Date(medicine.schedule.endDate).toLocaleDateString("tr-TR")
              : "Seçilmedi"}
          </Text>
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={
              medicine.schedule.endDate
                ? new Date(medicine.schedule.endDate)
                : new Date()
            }
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                setMedicine({
                  ...medicine,
                  schedule: {
                    ...medicine.schedule,
                    endDate: selectedDate.toISOString().split("T")[0],
                  },
                });
              }
            }}
          />
        )}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notlar</Text>
        {renderHelpText("İlaç hakkında eklemek istediğiniz notlar")}
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={medicine.notes}
          onChangeText={(text) => setMedicine({ ...medicine, notes: text })}
          placeholder="Örn: Yemeklerden sonra alınmalı"
          placeholderTextColor="#757575"
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <MaterialIcons name="save" size={28} color="white" />
        <Text style={styles.saveButtonText}>İlacı Kaydet</Text>
      </TouchableOpacity>

      {renderModal(
        showTypeModal,
        "İlaç Tipi Seçin",
        <View style={styles.modalOptions}>
          {TYPE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modalOption}
              onPress={() => {
                handleTypeChange(option.value as string);
                setShowTypeModal(false);
              }}
            >
              <MaterialIcons name="medication" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowTypeModal(false)
      )}

      {renderModal(
        showFrequencyModal,
        "Kullanım Sıklığı Seçin",
        <View style={styles.modalOptions}>
          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modalOption}
              onPress={() => {
                handleFrequencyChange(option.value as string);
                setShowFrequencyModal(false);
              }}
            >
              <MaterialIcons name="today" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowFrequencyModal(false)
      )}

      {renderModal(
        showTimingModal,
        "Kullanım Zamanı Seçin",
        <View style={styles.modalOptions}>
          {TIME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modalOption}
              onPress={() => {
                handleTimeSelect(option.value);
                setShowTimingModal(false);
              }}
            >
              <MaterialIcons name="access-time" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowTimingModal(false)
      )}
    </ScrollView>
  );
};

export default AddMedicineScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 24,
    fontWeight: "500",
    color: "#212121",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    color: "#212121",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  notesInput: {
    height: 120,
    textAlignVertical: "top",
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectButtonText: {
    fontSize: 20,
    color: "#212121",
    marginLeft: 12,
  },
  dosageContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dosageInput: {
    flex: 1,
  },
  unitButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: 80,
    alignItems: "center",
  },
  unitButtonText: {
    fontSize: 20,
    color: "#212121",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "500",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#212121",
  },
  modalOptions: {
    gap: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  modalOptionText: {
    fontSize: 20,
    color: "#212121",
    marginLeft: 12,
  },
  imageButton: {
    width: "100%",
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageButtonText: {
    marginTop: 8,
    fontSize: 16,
    color: "#2196F3",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#2196F3",
  },
  ocrResultContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  ocrResultTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  ocrResultText: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  timeButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  timeButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  timeButtonTextSelected: {
    color: "#fff",
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#fff",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
});
