import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useMedicine } from "../context/MedicineContext";
import { useNavigation } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";

console.log("💊 Günlük ilaç ekranı yükleniyor...");

const DailyMedicineScreen = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { medicines, updateMedicine } = useMedicine();
  const [dailyDoses, setDailyDoses] = useState<
    Array<{
      id: string;
      medicineId: string;
      name: string;
      dosage: string;
      type: string;
      time: string;
      taken: boolean;
    }>
  >([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const doses: Array<{
      id: string;
      medicineId: string;
      name: string;
      dosage: string;
      type: string;
      time: string;
      taken: boolean;
    }> = [];

    medicines.forEach((medicine) => {
      if (medicine.schedule.startDate === today) {
        medicine.usage.time.forEach((time) => {
          // Her doz için ayrı taken durumu
          const doseId = `${medicine.id}-${time}`;
          const doseTaken = medicine.takenDoses?.includes(doseId) || false;

          doses.push({
            id: doseId,
            medicineId: medicine.id,
            name: medicine.name,
            dosage: `${medicine.dosage.amount} ${medicine.dosage.unit}`,
            type: medicine.type,
            time: time,
            taken: doseTaken,
          });
        });
      }
    });

    doses.sort((a, b) => a.time.localeCompare(b.time));
    setDailyDoses(doses);
  }, [medicines]);

  const handleMedicinePress = (medicineId: string) => {
    navigation.navigate("Medicines");
  };

  const handleToggleTaken = async (dose: (typeof dailyDoses)[0]) => {
    try {
      const medicine = medicines.find((m) => m.id === dose.medicineId);
      if (medicine) {
        // Mevcut alınan dozları al veya boş array oluştur
        const takenDoses = medicine.takenDoses || [];

        // Dozu ekle veya çıkar
        const updatedTakenDoses = dose.taken
          ? takenDoses.filter((id) => id !== dose.id)
          : [...takenDoses, dose.id];

        const updatedMedicine = {
          ...medicine,
          takenDoses: updatedTakenDoses,
          // En az bir doz alındıysa true, hiç alınmadıysa false
          taken: updatedTakenDoses.length > 0,
          lastTaken:
            updatedTakenDoses.length > 0 ? new Date().toISOString() : undefined,
        };

        await updateMedicine(updatedMedicine);

        // Sadece ilgili dozu güncelle
        setDailyDoses((prevDoses) =>
          prevDoses.map((d) =>
            d.id === dose.id ? { ...d, taken: !dose.taken } : d
          )
        );
      }
    } catch (error) {
      console.error("İlaç durumu güncellenirken hata:", error);
      Alert.alert("Hata", "İlaç durumu güncellenirken bir hata oluştu.");
    }
  };

  const renderDoseCard = ({ item }: { item: (typeof dailyDoses)[0] }) => {
    return (
      <TouchableOpacity
        style={[styles.doseCard, item.taken && styles.doseCardTaken]}
        onPress={() => handleToggleTaken(item)}
        activeOpacity={0.7}
      >
        <View style={styles.doseCardLeft}>
          <View style={styles.medicineIconContainer}>
            <MaterialIcons
              name={getMedicineIcon(item.type)}
              size={24}
              color={item.taken ? "#4CAF50" : "#2196F3"}
            />
          </View>
          <View style={styles.medicineInfo}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <View style={styles.medicineDetails}>
              <Text style={styles.medicineDosage}>{item.dosage}</Text>
              <View style={styles.medicineTypeContainer}>
                <Text style={styles.medicineType}>{item.type}</Text>
              </View>
            </View>
            <View style={styles.medicineTimeContainer}>
              <MaterialIcons name="schedule" size={16} color="#757575" />
              <Text style={styles.medicineTime}>{item.time}</Text>
            </View>
          </View>
        </View>
        <View style={styles.medicineStatus}>
          <MaterialIcons
            name={item.taken ? "check-circle" : "radio-button-unchecked"}
            size={32}
            color={item.taken ? "#4CAF50" : "#757575"}
          />
        </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Günlük İlaç Dozları</Text>
        <Text style={styles.subtitle}>
          Bugün alınması gereken tüm ilaç dozları
        </Text>
      </View>

      <FlatList
        data={dailyDoses}
        renderItem={renderDoseCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
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
  doseCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  doseCardTaken: {
    backgroundColor: "#E8F5E9",
  },
  doseCardLeft: {
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
  medicineTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  medicineTime: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 4,
  },
  medicineStatus: {
    marginLeft: 12,
  },
});

export default DailyMedicineScreen;
