import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMedicine } from "../context/MedicineContext";
import { Medicine } from "../types/medicine";

type RootStackParamList = {
  MainTabs: undefined;
  AddMedicine: undefined;
  EditMedicine: { medicine: Medicine };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MedicinesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { medicines, updateMedicine, toggleMedicineTaken } = useMedicine();
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isStockModalVisible, setIsStockModalVisible] = useState(false);
  const [stockAmount, setStockAmount] = useState("");

  const handleAddMedicine = () => {
    navigation.navigate("AddMedicine");
  };

  const handleEditMedicine = (medicine: Medicine) => {
    navigation.navigate("EditMedicine", { medicine });
  };

  const handleUpdateStock = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setStockAmount(medicine.stockAmount.toString());
    setIsStockModalVisible(true);
  };

  const handleSaveStock = async () => {
    if (!selectedMedicine) return;

    const amount = parseInt(stockAmount);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Hata", "Lütfen geçerli bir miktar girin.");
      return;
    }

    const updatedMedicine = {
      ...selectedMedicine,
      stockAmount: amount,
      stockLastUpdated: new Date().toISOString().split("T")[0],
    };

    await updateMedicine(updatedMedicine);
    setIsStockModalVisible(false);
    setSelectedMedicine(null);
  };

  const getStockStatus = (medicine: Medicine) => {
    if (medicine.stockAmount <= 0) {
      return {
        color: "#F44336",
        text: "Stok Tükendi",
        icon: "error",
      };
    } else if (medicine.stockAmount <= medicine.stockThreshold) {
      return {
        color: "#FF9800",
        text: "Stok Azalıyor",
        icon: "warning",
      };
    }
    return {
      color: "#4CAF50",
      text: "Stok Yeterli",
      icon: "check-circle",
    };
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => (
    <View style={styles.medicineCard}>
      <View style={styles.medicineHeader}>
        <View style={styles.medicineInfo}>
          <MaterialIcons name="medication" size={20} color="#2196F3" />
          <Text style={styles.medicineName}>{item.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("EditMedicine", { medicine: item })
          }
        >
          <MaterialIcons name="edit" size={20} color="#757575" />
        </TouchableOpacity>
      </View>

      <View style={styles.medicineDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="access-time" size={16} color="#757575" />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="straighten" size={16} color="#757575" />
            <Text style={styles.detailText}>{item.dosage}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialIcons name="category" size={16} color="#757575" />
            <Text style={styles.detailText}>{item.type}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialIcons name="event-note" size={16} color="#757575" />
            <Text style={styles.detailText}>{item.usageType}</Text>
          </View>
        </View>
      </View>

      <View style={styles.stockInfo}>
        <View
          style={[
            styles.stockStatus,
            item.stockAmount > item.stockThreshold
              ? styles.stockOk
              : styles.stockLow,
          ]}
        >
          <MaterialIcons
            name={
              item.stockAmount > item.stockThreshold
                ? "check-circle"
                : "warning"
            }
            size={16}
            color={
              item.stockAmount > item.stockThreshold ? "#4CAF50" : "#FF9800"
            }
          />
          <Text
            style={[
              styles.stockText,
              item.stockAmount > item.stockThreshold
                ? styles.stockTextOk
                : styles.stockTextLow,
            ]}
          >
            Stok {item.stockAmount > item.stockThreshold ? "Yeterli" : "Az"}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        renderItem={renderMedicineItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="medication" size={64} color="#757575" />
            <Text style={styles.emptyStateText}>
              Henüz ilaç eklenmemiş. İlaç eklemek için aşağıdaki butonu
              kullanabilirsiniz.
            </Text>
          </View>
        }
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddMedicine}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isStockModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStockModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Stok Güncelle</Text>
            <Text style={styles.modalSubtitle}>
              {selectedMedicine?.name} - {selectedMedicine?.stockUnit}
            </Text>
            <TextInput
              style={styles.stockInput}
              keyboardType="numeric"
              value={stockAmount}
              onChangeText={setStockAmount}
              placeholder={`Mevcut ${selectedMedicine?.stockUnit} miktarı`}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsStockModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveStock}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  medicineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  medicineInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
  },
  medicineDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#757575",
  },
  stockInfo: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 8,
  },
  stockStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  stockOk: {
    backgroundColor: "#E8F5E9",
  },
  stockLow: {
    backgroundColor: "#FFF3E0",
  },
  stockText: {
    fontSize: 12,
    fontWeight: "500",
  },
  stockTextOk: {
    color: "#4CAF50",
  },
  stockTextLow: {
    color: "#FF9800",
  },
  addButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2196F3",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginTop: 12,
    marginHorizontal: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#212121",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 16,
  },
  stockInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});
