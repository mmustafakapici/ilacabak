import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Medicine } from "../types/medicine";

interface EditMedicineModalProps {
  visible: boolean;
  medicine: Medicine;
  onClose: () => void;
  onUpdate: (updatedMedicine: Medicine) => void;
  onDelete: (id: string) => void;
}

const EditMedicineModal = ({
  visible,
  medicine,
  onClose,
  onUpdate,
  onDelete,
}: EditMedicineModalProps) => {
  const [name, setName] = useState(medicine?.name || "");
  const [dosage, setDosage] = useState(
    medicine?.dosage.amount.toString() || ""
  );
  const [unit, setUnit] = useState(medicine?.dosage.unit || "");
  const [type, setType] = useState(medicine?.type || "");
  const [times, setTimes] = useState(medicine?.usage.time || []);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(-1);

  const handleUpdate = () => {
    if (!name || !dosage || !unit || !type || times.length === 0) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    const updatedMedicine = {
      ...medicine,
      name,
      dosage: {
        amount: parseFloat(dosage),
        unit,
      },
      type,
      usage: {
        ...medicine.usage,
        time: times,
      },
    };

    onUpdate(updatedMedicine);
  };

  const handleDelete = () => {
    Alert.alert("İlacı Sil", "Bu ilacı silmek istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: () => onDelete(medicine.id),
      },
    ]);
  };

  const handleAddTime = () => {
    setSelectedTimeIndex(-1);
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
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

  const handleEditTime = (index: number) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const handleDeleteTime = (index: number) => {
    setTimes(times.filter((_, i) => i !== index));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>İlaç Düzenle</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
              >
                <MaterialIcons name="delete" size={24} color="#F44336" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.form}>
            <View style={styles.medicineInfo}>
              <MaterialIcons
                name={
                  type.toLowerCase() === "tablet" ? "medication" : "healing"
                }
                size={32}
                color="#2196F3"
              />
              <Text style={styles.medicineTitle}>{medicine.name}</Text>
              <Text style={styles.medicineSubtitle}>
                {medicine.dosage.amount} {medicine.dosage.unit} -{" "}
                {medicine.type}
              </Text>
            </View>

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
                      <MaterialIcons
                        name="schedule"
                        size={20}
                        color="#2196F3"
                      />
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
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>Güncelle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#F5F5F5",
    borderRadius: 16,
    margin: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  form: {
    padding: 16,
  },
  medicineInfo: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
  },
  medicineTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#212121",
    marginTop: 8,
  },
  medicineSubtitle: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timeList: {
    marginTop: 8,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  timeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#212121",
  },
  deleteTimeButton: {
    padding: 8,
    marginLeft: 8,
  },
  addTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2196F3",
    marginTop: 8,
  },
  addTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2196F3",
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
  updateButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default EditMedicineModal;
