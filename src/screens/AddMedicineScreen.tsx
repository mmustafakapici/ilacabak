import React, { useState } from "react";
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
import { OCRService } from "../services/OCRService";
import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type AddMedicineScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AddMedicine"
>;

const MEDICINE_TYPES = [
  "Tablet",
  "Kapsül",
  "Şurup",
  "İğne",
  "İnhaler",
  "Merhem",
  "Damla",
];

const USAGE_TYPES = [
  "Aç karnına",
  "Tok karnına",
  "Yemeklerle birlikte",
  "Herhangi bir zamanda",
];

const FREQUENCY_OPTIONS = [
  { id: "daily", label: "Her Gün", icon: "today" as const },
  { id: "weekly", label: "Haftalık", icon: "date-range" as const },
  { id: "monthly", label: "Aylık", icon: "calendar-month" as const },
  { id: "custom", label: "Özel", icon: "edit-calendar" as const },
];

const WEEK_DAYS = [
  { id: 0, label: "Pazar", short: "Paz" },
  { id: 1, label: "Pazartesi", short: "Pzt" },
  { id: 2, label: "Salı", short: "Sal" },
  { id: 3, label: "Çarşamba", short: "Çar" },
  { id: 4, label: "Perşembe", short: "Per" },
  { id: 5, label: "Cuma", short: "Cum" },
  { id: 6, label: "Cumartesi", short: "Cmt" },
];

const TIMING_OPTIONS = [
  { label: "15 dakika önce", value: "15 dakika önce" },
  { label: "30 dakika önce", value: "30 dakika önce" },
  { label: "1 saat önce", value: "1 saat önce" },
  { label: "15 dakika sonra", value: "15 dakika sonra" },
  { label: "30 dakika sonra", value: "30 dakika sonra" },
  { label: "1 saat sonra", value: "1 saat sonra" },
];

const STOCK_UNITS = [
  { id: "tablet", label: "Tablet" },
  { id: "kapsül", label: "Kapsül" },
  { id: "ml", label: "ML" },
  { id: "damla", label: "Damla" },
  { id: "puf", label: "Puf" },
  { id: "ampul", label: "Ampul" },
  { id: "şurup", label: "Şurup" },
];

export const AddMedicineScreen = () => {
  const navigation = useNavigation<AddMedicineScreenNavigationProp>();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [type, setType] = useState(MEDICINE_TYPES[0]);
  const [usageType, setUsageType] = useState(USAGE_TYPES[0]);
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timingNote, setTimingNote] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [image, setImage] = useState<string | null>(null);

  // Stok bilgileri için state'ler
  const [stockAmount, setStockAmount] = useState("");
  const [stockUnit, setStockUnit] = useState(STOCK_UNITS[0].id);
  const [stockThreshold, setStockThreshold] = useState("");
  const [showStockUnitModal, setShowStockUnitModal] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrText, setOcrText] = useState<string>("");
  const [ocrResult, setOcrResult] = useState<any>(null);

  const processImage = async (uri: string) => {
    try {
      setIsProcessing(true);
      const result = await OCRService.processImage(uri);
      setOcrText(result.text);
      setOcrResult(result.medicineInfo);

      // Otomatik form doldurma
      if (result.medicineInfo) {
        if (result.medicineInfo.name) setName(result.medicineInfo.name);
        if (result.medicineInfo.dosage) setDosage(result.medicineInfo.dosage);
        if (result.medicineInfo.type) setType(result.medicineInfo.type);
        if (result.medicineInfo.usage) setUsageType(result.medicineInfo.usage);
      }
    } catch (error) {
      Alert.alert("Hata", "Görüntü işlenirken bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Galeriye erişim izni gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Kameraya erişim izni gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      await processImage(result.assets[0].uri);
    }
  };

  const showImagePickerOptions = () => {
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
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name || !dosage || !stockAmount || !stockThreshold) {
      Alert.alert("Hata", "Lütfen tüm zorunlu alanları doldurunuz.");
      return;
    }

    try {
      const updatedMedicine = {
        id: Date.now().toString(),
        name,
        dosage,
        type,
        usageType,
        frequency,
        time,
        timingNote,
        selectedDays,
        notes,
        taken: false,
        // Stok bilgileri
        stockAmount: parseInt(stockAmount),
        stockUnit,
        stockThreshold: parseInt(stockThreshold),
        stockLastUpdated: new Date().toISOString().split("T")[0],
        image,
      };

      await StorageService.addMedicine(updatedMedicine);
      Alert.alert("Başarılı", "İlaç başarıyla eklendi.", [
        {
          text: "Tamam",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("İlaç kaydedilirken hata oluştu:", error);
      Alert.alert("Hata", "İlaç eklenirken bir hata oluştu.");
    }
  };

  const toggleDay = (dayId: number) => {
    setSelectedDays((prev) =>
      prev.includes(dayId)
        ? prev.filter((id) => id !== dayId)
        : [...prev, dayId]
    );
  };

  const renderHelpText = (text: string) => (
    <Text style={styles.helpText}>{text}</Text>
  );

  const renderModal = (
    visible: boolean,
    title: string,
    children: React.ReactNode,
    onClose: () => void
  ) => (
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

  const handleTimeSelect = (selectedTime: Date | null) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(
        selectedTime.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
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
          {ocrResult && (
            <View style={styles.ocrInfoContainer}>
              <Text style={styles.ocrInfoTitle}>Tespit Edilen Bilgiler:</Text>
              {ocrResult.name && (
                <Text style={styles.ocrInfoText}>
                  İlaç Adı: {ocrResult.name}
                </Text>
              )}
              {ocrResult.dosage && (
                <Text style={styles.ocrInfoText}>
                  Dozaj: {ocrResult.dosage}
                </Text>
              )}
              {ocrResult.type && (
                <Text style={styles.ocrInfoText}>Tip: {ocrResult.type}</Text>
              )}
              {ocrResult.usage && (
                <Text style={styles.ocrInfoText}>
                  Kullanım: {ocrResult.usage}
                </Text>
              )}
            </View>
          )}
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>İlaç Adı</Text>
        {renderHelpText("İlacın tam adını yazınız")}
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Örn: Aspirin"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Dozaj</Text>
        {renderHelpText("İlacın dozaj miktarını yazınız")}
        <TextInput
          style={styles.input}
          value={dosage}
          onChangeText={setDosage}
          placeholder="Örn: 1 tablet"
          placeholderTextColor="#757575"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>İlaç Tipi</Text>
        {renderHelpText("İlacın kullanım şeklini seçiniz")}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTypeModal(true)}
        >
          <MaterialIcons name="medication" size={28} color="#2196F3" />
          <Text style={styles.selectButtonText}>{type}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kullanım Şekli</Text>
        {renderHelpText("İlacı nasıl kullanacağınızı seçiniz")}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowUsageModal(true)}
        >
          <MaterialIcons name="restaurant" size={28} color="#2196F3" />
          <Text style={styles.selectButtonText}>{usageType}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kullanım Sıklığı</Text>
        {renderHelpText("İlacı ne sıklıkta kullanacağınızı seçiniz")}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowFrequencyModal(true)}
        >
          <MaterialIcons
            name={
              FREQUENCY_OPTIONS.find((f) => f.id === frequency)?.icon || "today"
            }
            size={28}
            color="#2196F3"
          />
          <Text style={styles.selectButtonText}>
            {FREQUENCY_OPTIONS.find((f) => f.id === frequency)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {frequency === "weekly" && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Günler</Text>
          {renderHelpText("İlacı hangi günlerde alacağınızı seçiniz")}
          <View style={styles.daysContainer}>
            {WEEK_DAYS.map((day) => (
              <TouchableOpacity
                key={day.id}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.id) && styles.dayButtonSelected,
                ]}
                onPress={() => toggleDay(day.id)}
              >
                <Text
                  style={[
                    styles.dayButtonText,
                    selectedDays.includes(day.id) &&
                      styles.dayButtonTextSelected,
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.formGroup}>
        <Text style={styles.label}>Kullanım Zamanı</Text>
        {renderHelpText("İlacı hangi saatte almanız gerektiğini seçiniz")}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={28} color="#2196F3" />
          <Text style={styles.selectButtonText}>{time || "Saat Seçin"}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Zamanlama Notu</Text>
        {renderHelpText("İlacı ne zaman almanız gerektiğine dair özel not")}
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setShowTimingModal(true)}
        >
          <MaterialIcons name="schedule" size={28} color="#2196F3" />
          <Text style={styles.selectButtonText}>
            {timingNote || "Zamanlama notu ekleyin"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notlar</Text>
        {renderHelpText("İlaç hakkında eklemek istediğiniz notlar")}
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Örn: Yemeklerden sonra alınmalı"
          placeholderTextColor="#757575"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Stok Bilgileri Bölümü */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stok Bilgileri</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Stok Birimi</Text>
          {renderHelpText("İlacın stok birimini seçiniz")}
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowStockUnitModal(true)}
          >
            <MaterialIcons name="inventory" size={28} color="#2196F3" />
            <Text style={styles.selectButtonText}>
              {STOCK_UNITS.find((unit) => unit.id === stockUnit)?.label}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mevcut Stok Miktarı</Text>
          {renderHelpText(
            `Mevcut ${
              STOCK_UNITS.find((unit) => unit.id === stockUnit)?.label
            } sayısını giriniz`
          )}
          <TextInput
            style={styles.input}
            value={stockAmount}
            onChangeText={setStockAmount}
            keyboardType="numeric"
            placeholder={`Örn: 30 ${stockUnit}`}
            placeholderTextColor="#757575"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Minimum Stok Uyarı Miktarı</Text>
          {renderHelpText("Bu miktarın altına düştüğünde uyarı alacaksınız")}
          <TextInput
            style={styles.input}
            value={stockThreshold}
            onChangeText={setStockThreshold}
            keyboardType="numeric"
            placeholder="Örn: 10"
            placeholderTextColor="#757575"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <MaterialIcons name="save" size={28} color="white" />
        <Text style={styles.saveButtonText}>İlacı Kaydet</Text>
      </TouchableOpacity>

      {showTimePicker && (
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerContent}>
              <View style={styles.timePickerHeader}>
                <Text style={styles.timePickerTitle}>Saat Seçin</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <MaterialIcons name="close" size={24} color="#757575" />
                </TouchableOpacity>
              </View>
              <View style={styles.timePicker}>
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => {
                    const newTime = new Date();
                    newTime.setHours(8, 0, 0);
                    handleTimeSelect(newTime);
                  }}
                >
                  <MaterialIcons name="wb-sunny" size={24} color="#2196F3" />
                  <Text style={styles.timeOptionText}>Sabah (08:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => {
                    const newTime = new Date();
                    newTime.setHours(12, 0, 0);
                    handleTimeSelect(newTime);
                  }}
                >
                  <MaterialIcons
                    name="brightness-5"
                    size={24}
                    color="#2196F3"
                  />
                  <Text style={styles.timeOptionText}>Öğle (12:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => {
                    const newTime = new Date();
                    newTime.setHours(18, 0, 0);
                    handleTimeSelect(newTime);
                  }}
                >
                  <MaterialIcons
                    name="brightness-4"
                    size={24}
                    color="#2196F3"
                  />
                  <Text style={styles.timeOptionText}>Akşam (18:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => {
                    const newTime = new Date();
                    newTime.setHours(22, 0, 0);
                    handleTimeSelect(newTime);
                  }}
                >
                  <MaterialIcons
                    name="brightness-3"
                    size={24}
                    color="#2196F3"
                  />
                  <Text style={styles.timeOptionText}>Gece (22:00)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.timeOption, styles.customTimeOption]}
                  onPress={() => {
                    const newTime = new Date();
                    handleTimeSelect(newTime);
                  }}
                >
                  <MaterialIcons name="access-time" size={24} color="#2196F3" />
                  <Text style={styles.timeOptionText}>Özel Saat Seç</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {renderModal(
        showTypeModal,
        "İlaç Tipi Seçin",
        <View style={styles.modalOptions}>
          {MEDICINE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.modalOption}
              onPress={() => {
                setType(type);
                setShowTypeModal(false);
              }}
            >
              <MaterialIcons name="medication" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowTypeModal(false)
      )}

      {renderModal(
        showUsageModal,
        "Kullanım Şekli Seçin",
        <View style={styles.modalOptions}>
          {USAGE_TYPES.map((usage) => (
            <TouchableOpacity
              key={usage}
              style={styles.modalOption}
              onPress={() => {
                setUsageType(usage);
                setShowUsageModal(false);
              }}
            >
              <MaterialIcons name="restaurant" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{usage}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowUsageModal(false)
      )}

      {renderModal(
        showFrequencyModal,
        "Kullanım Sıklığı Seçin",
        <View style={styles.modalOptions}>
          {FREQUENCY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.modalOption}
              onPress={() => {
                setFrequency(option.id);
                setShowFrequencyModal(false);
              }}
            >
              <MaterialIcons name={option.icon} size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowFrequencyModal(false)
      )}

      {renderModal(
        showTimingModal,
        "Zamanlama Notu Seçin",
        <View style={styles.modalOptions}>
          {TIMING_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modalOption}
              onPress={() => {
                setTimingNote(option.value);
                setShowTimingModal(false);
              }}
            >
              <MaterialIcons name="schedule" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowTimingModal(false)
      )}

      {/* Stok Birimi Seçme Modalı */}
      {renderModal(
        showStockUnitModal,
        "Stok Birimi Seçin",
        <View>
          {STOCK_UNITS.map((unit) => (
            <TouchableOpacity
              key={unit.id}
              style={[
                styles.modalOption,
                stockUnit === unit.id && styles.modalOptionSelected,
              ]}
              onPress={() => {
                setStockUnit(unit.id);
                setShowStockUnitModal(false);
              }}
            >
              <MaterialIcons
                name="inventory"
                size={24}
                color={stockUnit === unit.id ? "#2196F3" : "#757575"}
              />
              <Text
                style={[
                  styles.modalOptionText,
                  stockUnit === unit.id && styles.modalOptionTextSelected,
                ]}
              >
                {unit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>,
        () => setShowStockUnitModal(false)
      )}
    </ScrollView>
  );
};

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
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayButton: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    minWidth: 48,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dayButtonSelected: {
    backgroundColor: "#2196F3",
    borderColor: "#2196F3",
  },
  dayButtonText: {
    fontSize: 18,
    color: "#212121",
  },
  dayButtonTextSelected: {
    color: "white",
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
  timePickerModal: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    maxWidth: 400,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#212121",
  },
  timePicker: {
    gap: 12,
  },
  timeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
  },
  timeOptionText: {
    fontSize: 20,
    color: "#212121",
    marginLeft: 12,
  },
  customTimeOption: {
    backgroundColor: "#E3F2FD",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#212121",
    marginBottom: 16,
  },
  modalOptionSelected: {
    backgroundColor: "#E3F2FD",
  },
  modalOptionTextSelected: {
    color: "#2196F3",
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
  ocrInfoContainer: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
  },
  ocrInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 8,
  },
  ocrInfoText: {
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
  },
});
