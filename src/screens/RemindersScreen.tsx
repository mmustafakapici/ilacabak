import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useMedicine } from "../context/MedicineContext";

export const RemindersScreen = () => {
  const navigation = useNavigation();
  const { medicines, toggleMedicineTaken } = useMedicine();

  const getLowStockMedicines = () => {
    return medicines.filter(
      (medicine) =>
        medicine.stockAmount <= medicine.stockThreshold &&
        medicine.stockAmount > 0
    );
  };

  const getEmptyStockMedicines = () => {
    return medicines.filter((medicine) => medicine.stockAmount <= 0);
  };

  const renderReminderItem = ({ item }) => {
    if (item.taken) return null; // Alınmış ilaçları gösterme

    const isUpcoming = !item.isLate;
    let timeText = "";
    if (isUpcoming && item.timeUntil) {
      timeText = `${item.timeUntil} dakika sonra`;
    } else if (item.minutesLate) {
      timeText = `${item.minutesLate} dakika gecikme`;
    }

    return (
      <TouchableOpacity
        style={[
          styles.reminderCard,
          item.isLate ? styles.lateCard : styles.upcomingCard,
        ]}
        onPress={() => toggleMedicineTaken(item.id)}
      >
        <View style={styles.reminderHeader}>
          <MaterialIcons
            name={item.isLate ? "warning" : "notifications"}
            size={24}
            color={item.isLate ? "white" : "#2196F3"}
          />
          <Text
            style={[
              styles.reminderTime,
              item.isLate ? styles.lateText : styles.upcomingText,
            ]}
          >
            {timeText}
          </Text>
        </View>
        <View style={styles.reminderContent}>
          <Text
            style={[
              styles.medicineName,
              item.isLate ? styles.lateText : styles.upcomingText,
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.medicineInfo,
              item.isLate ? styles.lateText : styles.upcomingText,
            ]}
          >
            {item.dosage} • {item.type}
          </Text>
          <Text
            style={[
              styles.medicineUsage,
              item.isLate ? styles.lateText : styles.upcomingText,
            ]}
          >
            {item.usageType}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.takeButton,
            item.isLate ? styles.lateTakeButton : styles.upcomingTakeButton,
          ]}
          onPress={() => toggleMedicineTaken(item.id)}
        >
          <Text
            style={[
              styles.takeButtonText,
              item.isLate ? styles.lateText : styles.upcomingText,
            ]}
          >
            İlacı Al
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderStockWarning = () => {
    const lowStockMedicines = getLowStockMedicines();
    const emptyStockMedicines = getEmptyStockMedicines();

    if (lowStockMedicines.length === 0 && emptyStockMedicines.length === 0) {
      return null;
    }

    return (
      <View style={styles.stockWarningsContainer}>
        {emptyStockMedicines.length > 0 && (
          <View style={[styles.stockWarningCard, styles.emptyStockCard]}>
            <MaterialIcons name="error" size={24} color="white" />
            <View style={styles.stockWarningContent}>
              <Text style={styles.stockWarningTitle}>Stok Tükenen İlaçlar</Text>
              {emptyStockMedicines.map((medicine) => (
                <Text key={medicine.id} style={styles.stockWarningText}>
                  • {medicine.name}
                </Text>
              ))}
            </View>
          </View>
        )}

        {lowStockMedicines.length > 0 && (
          <View style={[styles.stockWarningCard, styles.lowStockCard]}>
            <MaterialIcons name="warning" size={24} color="white" />
            <View style={styles.stockWarningContent}>
              <Text style={styles.stockWarningTitle}>Stok Azalan İlaçlar</Text>
              {lowStockMedicines.map((medicine) => (
                <Text key={medicine.id} style={styles.stockWarningText}>
                  • {medicine.name} ({medicine.stockAmount} {medicine.stockUnit}{" "}
                  kaldı)
                </Text>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={medicines}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderStockWarning}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="check-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>
              Tüm ilaçlarınızı zamanında aldınız!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  stockWarningsContainer: {
    padding: 16,
  },
  stockWarningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyStockCard: {
    backgroundColor: "#F44336",
  },
  lowStockCard: {
    backgroundColor: "#FF9800",
  },
  stockWarningContent: {
    flex: 1,
    marginLeft: 12,
  },
  stockWarningTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "white",
    marginBottom: 8,
  },
  stockWarningText: {
    fontSize: 16,
    color: "white",
    marginBottom: 4,
  },
  listContainer: {
    padding: 16,
  },
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  lateCard: {
    backgroundColor: "#F44336",
  },
  upcomingCard: {
    backgroundColor: "white",
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reminderTime: {
    fontSize: 16,
    marginLeft: 8,
  },
  reminderContent: {
    marginLeft: 32,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 4,
  },
  medicineInfo: {
    fontSize: 16,
    marginBottom: 4,
  },
  medicineUsage: {
    fontSize: 14,
  },
  lateText: {
    color: "white",
  },
  upcomingText: {
    color: "#212121",
  },
  takeButton: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  lateTakeButton: {
    backgroundColor: "white",
  },
  upcomingTakeButton: {
    backgroundColor: "#2196F3",
  },
  takeButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginTop: 12,
  },
});
