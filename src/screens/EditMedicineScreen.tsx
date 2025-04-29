import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StorageService } from "../services/storage";
import AddMedicineScreen from "./AddMedicineScreen";
import { useMedicine } from "../context/MedicineContext";
import { Medicine } from "../types/medicine";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from '../context/ThemeContext';

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

const EditMedicineScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { medicines, updateMedicine, deleteMedicine } = useMedicine();
  const medicineId = route.params?.medicineId;
  const medicine = medicines.find(m => m.id === medicineId);

  const [name, setName] = useState(medicine?.name || '');
  const [dosage, setDosage] = useState(medicine?.dosage.amount.toString() || '');
  const [unit, setUnit] = useState(medicine?.dosage.unit || '');
  const [type, setType] = useState(medicine?.type || '');
  const [times, setTimes] = useState(medicine?.usage.time || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);

  const handleUpdateMedicine = async () => {
    if (!name || !dosage || !unit || !type || times.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }

    try {
      const updatedMedicine = {
        ...medicine,
        name,
        dosage: {
          amount: parseFloat(dosage),
          unit
        },
        type,
        usage: {
          ...medicine.usage,
          time: times
        }
      };

      await updateMedicine(updatedMedicine);
      Alert.alert('Başarılı', 'İlaç bilgileri güncellendi.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'İlaç güncellenirken bir hata oluştu.');
    }
  };

  const handleDeleteMedicine = () => {
    Alert.alert(
      'İlacı Sil',
      'Bu ilacı silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMedicine(medicineId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Hata', 'İlaç silinirken bir hata oluştu.');
            }
          },
        },
      ]
    );
  };

  const handleAddTime = () => {
    setSelectedTimeIndex(-1);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const timeString = selectedDate.toLocaleTimeString().slice(0, 5);
      if (selectedTimeIndex === -1) {
        setTimes([...times, timeString].sort());
      } else {
        const newTimes = [...times];
        newTimes[selectedTimeIndex] = timeString;
        setTimes(newTimes.sort());
      }
    }
  };

  const handleEditTime = (index) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const handleDeleteTime = (index) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İlaç Düzenle</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteMedicine}
        >
          <MaterialIcons name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlaç Adı</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="İlaç adını girin"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 2 }]}>
            <Text style={styles.label}>Doz Miktarı</Text>
            <TextInput
              style={styles.input}
              value={dosage}
              onChangeText={setDosage}
              keyboardType="numeric"
              placeholder="Miktar"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
            <Text style={styles.label}>Birim</Text>
            <TextInput
              style={styles.input}
              value={unit}
              onChangeText={setUnit}
              placeholder="mg, ml"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>İlaç Tipi</Text>
          <TextInput
            style={styles.input}
            value={type}
            onChangeText={setType}
            placeholder="Tablet, Şurup, vb."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kullanım Saatleri</Text>
          <View style={styles.timeList}>
            {times.map((time, index) => (
              <View key={index} style={styles.timeItem}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => handleEditTime(index)}
                >
                  <MaterialIcons name="schedule" size={20} color="#2196F3" />
                  <Text style={styles.timeText}>{time}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteTimeButton}
                  onPress={() => handleDeleteTime(index)}
                >
                  <MaterialIcons name="close" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addTimeButton}
              onPress={handleAddTime}
            >
              <MaterialIcons name="add" size={24} color="#2196F3" />
              <Text style={styles.addTimeText}>Saat Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showTimePicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleUpdateMedicine}
        >
          <Text style={styles.updateButtonText}>Güncelle</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  deleteButton: {
    padding: 8,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeList: {
    marginTop: 8,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#212121',
  },
  deleteTimeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
    marginTop: 8,
  },
  addTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2196F3',
  },
  updateButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default EditMedicineScreen;
