import React, { useState, useCallback } from "react";
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
import EditMedicineModal from "../components/EditMedicineModal";

console.log("💊 İlaçlar ekranı yükleniyor...");

type RootStackParamList = {
  MainTabs: undefined;
  AddMedicine: undefined;
  EditMedicine: { medicine: Medicine };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MedicinesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const {
    medicines,
    updateMedicine,
    toggleMedicineTaken,
    refreshMedicines,
    deleteMedicine,
  } = useMedicine();
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(
    null
  );
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  console.log("📊 İlaç listesi durumu:", {
    toplamİlaç: medicines.length,
    seçiliİlaç: selectedMedicine?.name,
  });

  const onRefresh = useCallback(async () => {
    console.log("🔄 İlaç listesi yenileniyor...");
    setRefreshing(true);
    try {
      await refreshMedicines();
      console.log("✅ İlaç listesi başarıyla yenilendi");
    } catch (error) {
      console.error("❌ İlaçlar yenilenirken hata:", error);
      Alert.alert("Hata", "İlaçlar yenilenirken bir hata oluştu.");
    } finally {
      setRefreshing(false);
      console.log("🏁 Yenileme işlemi tamamlandı");
    }
  }, [refreshMedicines]);

  const handleAddMedicine = () => {
    console.log("➕ Yeni ilaç ekleme ekranına geçiliyor");
    navigation.navigate("AddMedicine");
  };

  const handleEditMedicine = (medicine: Medicine) => {
    console.log("✏️ İlaç düzenleme ekranına geçiliyor:", medicine.name);
    navigation.navigate("EditMedicine", { medicine });
  };

  const handleToggleTaken = async (medicine: Medicine) => {
    console.log("🔄 İlaç durumu değiştiriliyor:", medicine.name);
    try {
      const updatedMedicine = {
        ...medicine,
        taken: !medicine.taken,
        lastTaken: medicine.taken ? undefined : new Date().toISOString(),
      };
      console.log("📝 Yeni ilaç durumu:", {
        isim: updatedMedicine.name,
        alındı: updatedMedicine.taken,
        sonAlım: updatedMedicine.lastTaken,
      });
      await updateMedicine(updatedMedicine);
      console.log("✅ İlaç durumu güncellendi");
    } catch (error) {
      console.error("❌ İlaç durumu güncellenirken hata:", error);
      Alert.alert("Hata", "İlaç durumu güncellenirken bir hata oluştu.");
    }
  };

  const handleMedicinePress = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsModalVisible(true);
  };

  const handleUpdateMedicine = async (updatedMedicine: Medicine) => {
    try {
      await updateMedicine(updatedMedicine);
      setIsModalVisible(false);
      setSelectedMedicine(null);
    } catch (error) {
      Alert.alert("Hata", "İlaç güncellenirken bir hata oluştu.");
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    try {
      await deleteMedicine(id);
      setIsModalVisible(false);
      setSelectedMedicine(null);
    } catch (error) {
      Alert.alert("Hata", "İlaç silinirken bir hata oluştu.");
    }
  };

  const MedicineItem = ({ medicine, onPress }: MedicineItemProps) => {
    return (
      <TouchableOpacity
        style={styles.medicineCard}
        onPress={() => onPress(medicine)}
      >
        <View style={styles.medicineCardLeft}>
          <View style={styles.medicineIconContainer}>
            <MaterialIcons
              name={getMedicineIcon(medicine.type)}
              size={28}
              color="#2196F3"
            />
          </View>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{medicine.name}</Text>
            <View style={styles.medicineDetails}>
              <Text style={styles.medicineDosage}>
                {medicine.dosage.amount} {medicine.dosage.unit}
              </Text>
              <View style={styles.medicineTypeContainer}>
                <Text style={styles.medicineType}>{medicine.type}</Text>
              </View>
            </View>
            <View style={styles.medicineSchedule}>
              <MaterialIcons name="schedule" size={16} color="#757575" />
              <Text style={styles.medicineTime}>
                {medicine.usage.time.join(", ")}
              </Text>
            </View>
            <Text style={styles.medicineFrequency}>
              {medicine.usage.frequency}
              {medicine.usage.condition ? ` (${medicine.usage.condition})` : ""}
            </Text>
          </View>
        </View>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color="#757575"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>
    );
  };

  const getMedicineIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "tablet":
        return "medication";
      case "şurup":
        return "local-drink";
      case "damla":
        return "water-drop";
      case "krem":
        return "spa";
      default:
        return "medication";
    }
  };

  console.log("🎯 İlaç listesi render ediliyor...");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>İlaçlarım</Text>
        <Text style={styles.subtitle}>Kayıtlı tüm ilaçlarınız</Text>
      </View>

      <FlatList
        data={medicines}
        renderItem={({ item }) => (
          <MedicineItem
            medicine={item}
            onPress={(medicine) => handleMedicinePress(medicine)}
          />
        )}
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
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddMedicine}>
        <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

      {selectedMedicine && (
        <EditMedicineModal
          visible={isModalVisible}
          medicine={selectedMedicine}
          onClose={() => {
            setIsModalVisible(false);
            setSelectedMedicine(null);
          }}
          onUpdate={handleUpdateMedicine}
          onDelete={handleDeleteMedicine}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#757575",
  },
  listContainer: {
    padding: 16,
  },
  medicineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 8,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicineCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  medicineIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    color: "#212121",
    fontWeight: "500",
    marginBottom: 4,
  },
  medicineDetails: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 14,
    color: "#757575",
    marginRight: 8,
  },
  medicineTypeContainer: {
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  medicineType: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "500",
  },
  medicineSchedule: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  medicineTime: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 4,
  },
  medicineFrequency: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "500",
  },
  chevronIcon: {
    marginLeft: 8,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
  },
});

export default MedicinesScreen;
