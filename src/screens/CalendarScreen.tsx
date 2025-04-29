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
import { format, isSameDay, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Medicine } from "../types/medicine";
import { StorageService } from "../services/storage";
import { formatDate, formatTime } from "../utils/dateUtils";
import { Calendar } from "react-native-calendars";

console.log("📅 Takvim ekranı yükleniyor...");

const CalendarScreen = () => {
  const { medicines, toggleMedicineTaken, loadMedicines } = useMedicine();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);

  console.log("📊 Takvim durumu:", {
    seçiliTarih: format(selectedDate, "dd.MM.yyyy"),
    toplamİlaç: medicines.length,
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    filterMedicinesByDate(selectedDate, medicines);
  }, [selectedDate, medicines]);

  const filterMedicinesByDate = (date: Date, medicinesList: Medicine[]) => {
    const filtered = medicinesList.filter((medicine) => {
      const medicineStartDate = new Date(medicine.schedule.startDate);
      const medicineEndDate = medicine.schedule.endDate
        ? new Date(medicine.schedule.endDate)
        : null;

      return (
        medicineStartDate <= date &&
        (!medicineEndDate || medicineEndDate >= date)
      );
    });

    setFilteredMedicines(filtered);
  };

  const getMedicinesForDate = (date: Date) => {
    console.log("🔍 Tarih için ilaçlar aranıyor:", format(date, "dd.MM.yyyy"));
    const filteredMedicines = medicines.filter((medicine) => {
      return medicine.usage.time.some((time) => {
        const [hours, minutes] = time.split(":").map(Number);
        const medicineTime = new Date(date);
        medicineTime.setHours(hours, minutes, 0, 0);
        return isSameDay(medicineTime, date);
      });
    });
    console.log("✅ Bulunan ilaç sayısı:", filteredMedicines.length);
    return filteredMedicines;
  };

  const handleToggleTaken = async (medicineId: string, reminderId: string) => {
    console.log("🔄 İlaç durumu değiştiriliyor:", { medicineId, reminderId });
    try {
      await toggleMedicineTaken(medicineId, reminderId);
      console.log("✅ İlaç durumu güncellendi");
    } catch (error) {
      console.error("❌ İlaç durumu güncellenirken hata:", error);
      Alert.alert("Hata", "İlaç durumu güncellenirken bir hata oluştu.");
    }
  };

  const onDayPress = (day: any) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
  };

  const renderMedicineItem = ({ item }: { item: Medicine }) => {
    return (
      <TouchableOpacity
        style={[styles.medicineCard, item.taken && styles.medicineCardTaken]}
        onPress={() => handleToggleTaken(item.id, item.usage.time[0])}
      >
        <View style={styles.medicineCardLeft}>
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
              <Text style={styles.medicineDosage}>
                {item.dosage.amount} {item.dosage.unit}
              </Text>
              <View style={styles.medicineTypeContainer}>
                <Text style={styles.medicineType}>{item.type}</Text>
              </View>
            </View>
            <View style={styles.medicineSchedule}>
              <MaterialIcons name="schedule" size={16} color="#757575" />
              <Text style={styles.medicineTime}>
                {item.usage.time.join(", ")}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.medicineStatus}>
          <MaterialIcons
            name={item.taken ? "check-circle" : "radio-button-unchecked"}
            size={24}
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

  const renderDateSelector = () => {
    console.log("📅 Tarih seçici oluşturuluyor...");
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return date;
    });

    return (
      <FlatList
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.dateButton,
              item.toDateString() === selectedDate.toDateString() &&
                styles.selectedDate,
            ]}
            onPress={() => {
              console.log("📆 Tarih seçildi:", format(item, "dd.MM.yyyy"));
              setSelectedDate(item);
            }}
          >
            <Text style={styles.dateText}>{formatDate(item)}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.toISOString()}
        contentContainerStyle={styles.dateSelector}
      />
    );
  };

  const medicinesForDate = getMedicinesForDate(selectedDate);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [format(selectedDate, "yyyy-MM-dd")]: { selected: true },
        }}
        theme={{
          selectedDayBackgroundColor: "#2196F3",
          todayTextColor: "#2196F3",
          dotColor: "#2196F3",
          arrowColor: "#2196F3",
        }}
      />
      <View style={styles.medicinesContainer}>
        <Text style={styles.sectionTitle}>
          {format(selectedDate, "d MMMM yyyy", { locale: tr })} İlaçları
        </Text>
        {filteredMedicines.length > 0 ? (
          <FlatList
            data={filteredMedicines}
            renderItem={renderMedicineItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text style={styles.noMedicineText}>
            Bu tarihte alınacak ilaç bulunmamaktadır.
          </Text>
        )}
      </View>
    </View>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  dateSelector: {
    padding: 16,
  },
  dateButton: {
    padding: 12,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedDate: {
    backgroundColor: "#2196F3",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  medicinesContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
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
  medicineCardTaken: {
    backgroundColor: "#E8F5E9",
  },
  medicineCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  medicineIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(33, 150, 243, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
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
    paddingHorizontal: 6,
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
  },
  medicineTime: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 4,
  },
  medicineStatus: {
    marginLeft: 12,
  },
  noMedicineText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 32,
  },
});
