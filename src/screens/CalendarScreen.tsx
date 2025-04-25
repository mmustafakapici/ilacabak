import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useMedicine } from "../context/MedicineContext";

export const DailyMedicineScreen = () => {
  const { medicines, toggleMedicineTaken } = useMedicine();

  const renderDayMedicines = () => {
    const sortedMedicines = [...medicines].sort((a, b) => {
      // Önce alınmamış ilaçları göster
      if (a.taken !== b.taken) {
        return a.taken ? 1 : -1;
      }
      // Sonra saate göre sırala
      return a.time.localeCompare(b.time);
    });

    return (
      <View style={styles.dayContainer}>
        <Text style={styles.dayTitle}>Bugünkü İlaçlar</Text>
        {sortedMedicines.map((medicine) => (
          <TouchableOpacity
            key={medicine.id}
            style={[styles.medicineCard, medicine.taken && styles.medicineTaken]}
            onPress={() => toggleMedicineTaken(medicine.id)}
          >
            <View style={styles.medicineHeader}>
              <MaterialIcons
                name={medicine.taken ? "check-circle" : "radio-button-unchecked"}
                size={24}
                color={medicine.taken ? "#4CAF50" : "#757575"}
              />
              <Text style={styles.medicineTime}>{medicine.time}</Text>
            </View>
            <View style={styles.medicineInfo}>
              <Text style={styles.medicineName}>{medicine.name}</Text>
              <Text style={styles.medicineDosage}>
                {medicine.dosage} • {medicine.type}
              </Text>
              <Text style={styles.medicineUsage}>
                {medicine.usageType}
                {medicine.timingNote ? ` (${medicine.timingNote})` : ""}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        {medicines.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="info" size={48} color="#757575" />
            <Text style={styles.emptyStateText}>
              Bugün için planlanmış ilaç bulunmuyor.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>{renderDayMedicines()}</ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollView: {
    flex: 1,
  },
  dayContainer: {
    padding: 16,
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 16,
  },
  medicineCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  medicineTaken: {
    backgroundColor: "#E8F5E9",
  },
  medicineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  medicineTime: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2196F3",
    marginLeft: 12,
  },
  medicineInfo: {
    marginLeft: 36,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#212121",
    marginBottom: 4,
  },
  medicineDosage: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 4,
  },
  medicineUsage: {
    fontSize: 14,
    color: "#2196F3",
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
  },
});
