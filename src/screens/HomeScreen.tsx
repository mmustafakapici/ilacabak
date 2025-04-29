import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  Dimensions,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StorageService, Relative, Medicine } from "../services/storage";
import { NotificationService } from "../services/notification";
import { useMedicine } from "../context/MedicineContext";
import { formatTime } from "../utils/dateUtils";

console.log("🏠 Ana ekran yükleniyor...");

interface HomeItem {
  id: string;
  type:
    | "welcome"
    | "emergency"
    | "nextMedicine"
    | "dailyProgram"
    | "quickAccess"
    | "medicineChain"
    | "weeklyProgress";
}

const HomeScreen = () => {
  const navigation = useNavigation();
  const { medicines, toggleMedicineTaken } = useMedicine();
  const [userName, setUserName] = useState<string>("");
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  console.log("👤 Kullanıcı durumu:", {
    userName,
    relativesCount: relatives.length,
  });

  useEffect(() => {
    console.log("🔄 Başlangıç verileri yükleniyor...");
    loadInitialData();
    loadRelatives();
  }, []);

  const loadInitialData = async () => {
    try {
      console.log("📥 Kullanıcı profili yükleniyor...");
      await Promise.all([loadUserProfile()]);
    } catch (error) {
      console.error("❌ Veriler yüklenirken hata oluştu:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      if (profile) {
        console.log("✅ Kullanıcı profili yüklendi:", profile.name);
        setUserName(profile.name);
      }
    } catch (error) {
      console.error("❌ Profil yüklenirken hata oluştu:", error);
    }
  };

  const loadRelatives = async () => {
    try {
      console.log("👥 Yakınlar yükleniyor...");
      const loadedRelatives = await StorageService.getRelatives();
      console.log("✅ Yakınlar yüklendi, sayı:", loadedRelatives.length);
      setRelatives(loadedRelatives);
    } catch (error) {
      console.error("❌ Yakınlar yüklenirken hata:", error);
    }
  };

  const getNextMedicine = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const nextMed = medicines.find(
      (medicine) =>
        !medicine.taken &&
        medicine.usage.time.some((time) => time > currentTime)
    );

    if (nextMed) {
      const nextTime =
        nextMed.usage.time.find((time) => time > currentTime) ||
        nextMed.usage.time[0];
      return {
        name: nextMed.name,
        time: nextTime,
        dosage: `${nextMed.dosage.amount} ${nextMed.dosage.unit}`,
      };
    }

    return null;
  };

  const handleMedicineTaken = async (id: string, time: string) => {
    console.log("✅ İlaç alındı olarak işaretleniyor:", id);
    await toggleMedicineTaken(id, time);
  };

  const handleEmergency = () => {
    console.log("🚨 Acil durum butonuna basıldı");
    Alert.alert(
      "Acil Durum",
      "Yakınlarınıza bildirim gönderilecek. Devam etmek istiyor musunuz?",
      [
        {
          text: "İptal",
          style: "cancel",
          onPress: () => console.log("❌ Acil durum iptal edildi"),
        },
        {
          text: "Evet",
          onPress: async () => {
            console.log("📤 Acil durum bildirimi gönderiliyor...");
            await NotificationService.sendEmergencyNotification();
            console.log("✅ Acil durum bildirimi gönderildi");
            Alert.alert("Bildirim Gönderildi", "Yakınlarınıza bilgi verildi.");
          },
        },
      ]
    );
  };

  const handleAddMedicine = () => {
    console.log("➕ Yeni ilaç ekleme ekranına geçiliyor");
    navigation.navigate("AddMedicine" as never);
  };

  const handleCalendar = () => {
    console.log("📅 Takvim ekranına geçiliyor");
    navigation.navigate("GunlukProgram" as never);
  };

  const handleRelatives = () => {
    console.log("👥 Yakınlar ekranına geçiliyor");
    navigation.navigate("Relatives" as never);
  };

  const nextMedicine = getNextMedicine();

  const MedicineChain = ({ medicines }: { medicines: Medicine[] }) => {
    console.log("⛓️ İlaç zinciri hesaplanıyor...");
    const today = new Date().toISOString().split("T")[0];

    const todaysMedicines = medicines.filter(
      (m) => m.schedule.startDate === today
    );
    const takenCount = todaysMedicines.filter((m) => m.taken).length;
    const totalCount = todaysMedicines.length;
    const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

    console.log("📊 İlaç zinciri durumu:", {
      toplam: totalCount,
      alınan: takenCount,
      ilerleme: progress,
    });

    return (
      <View style={styles.chainContainer}>
        <View style={styles.chainHeader}>
          <MaterialIcons name="timeline" size={24} color="#2196F3" />
          <Text style={styles.chainTitle}>İlaç Kullanım Zinciri</Text>
        </View>

        <View style={styles.chainProgress}>
          <View style={styles.chainInfo}>
            <Text style={styles.chainCount}>
              {takenCount}/{totalCount}
            </Text>
            <Text style={styles.chainLabel}>İlaç Alındı</Text>
          </View>

          <View style={styles.chainBar}>
            <View style={[styles.chainFill, { width: `${progress}%` }]} />
          </View>
        </View>
      </View>
    );
  };

  const WeeklyProgress = ({ medicines }: { medicines: Medicine[] }) => {
    const getLast7Days = () => {
      const days = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date);
      }
      return days;
    };

    const days = getLast7Days();
    const today = new Date().toISOString().split("T")[0];

    return (
      <View style={styles.weeklyContainer}>
        <View style={styles.weeklyHeader}>
          <MaterialIcons name="calendar-today" size={24} color="#2196F3" />
          <Text style={styles.weeklyTitle}>Haftalık İlaç Takibi</Text>
        </View>

        <View style={styles.weeklyGrid}>
          {days.map((day, index) => {
            const dayString = day.toISOString().split("T")[0];
            const dayMedicines = medicines.filter((medicine) => {
              return medicine.schedule.startDate === dayString;
            });

            const takenCount = dayMedicines.filter((m) => m.taken).length;
            const totalCount = dayMedicines.length;
            const progress =
              totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

            return (
              <View key={index} style={styles.weeklyDay}>
                <Text style={styles.weeklyDayName}>
                  {day.toLocaleDateString("tr-TR", { weekday: "short" })}
                </Text>
                <View style={styles.weeklyProgressBar}>
                  <View
                    style={[
                      styles.weeklyProgressFill,
                      { height: `${progress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.weeklyDate}>
                  {day.toLocaleDateString("tr-TR", { day: "numeric" })}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderHomeItem = ({ item }: { item: HomeItem }) => {
    switch (item.type) {
      case "welcome":
        return (
          <View style={styles.welcomeCard}>
            <Image
              source={require("../../assets/default-avatar.png")}
              style={styles.avatar}
            />
            <View style={styles.welcomeText}>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.userName}>{userName || "Kullanıcı"}</Text>
            </View>
          </View>
        );
      case "emergency":
        return (
          <TouchableOpacity
            style={styles.emergencyButton}
            onPress={handleEmergency}
          >
            <MaterialIcons name="emergency" size={32} color="white" />
            <Text style={styles.emergencyButtonText}>ACİL DURUM</Text>
          </TouchableOpacity>
        );
      case "nextMedicine":
        if (!nextMedicine) return null;
        return (
          <View style={styles.nextMedicineCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons
                name="notification-important"
                size={24}
                color="white"
              />
              <Text style={styles.cardTitle}>Sıradaki İlacınız</Text>
            </View>
            <View style={styles.nextMedicineInfo}>
              <Text style={styles.medicineName}>{nextMedicine.name}</Text>
              <Text style={styles.medicineTime}>{nextMedicine.time}</Text>
              <Text style={styles.medicineDosage}>{nextMedicine.dosage}</Text>
            </View>
          </View>
        );
      case "dailyProgram":
        return renderDailyProgram();
      case "quickAccess":
        return (
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.addMedicineButton}
              onPress={handleAddMedicine}
            >
              <MaterialIcons name="add-circle" size={32} color="#2196F3" />
              <Text style={styles.quickAccessText}>İlaç Ekle</Text>
            </TouchableOpacity>
          </View>
        );
      case "medicineChain":
        return <MedicineChain medicines={medicines} />;
      case "weeklyProgress":
        return <WeeklyProgress medicines={medicines} />;
      default:
        return null;
    }
  };

  const renderDailyProgram = () => {
    const today = new Date().toISOString().split("T")[0];
    const todaysMedicines = medicines.filter(
      (m) => m.schedule.startDate === today
    );

    return (
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="today" size={24} color="#2196F3" />
          <Text style={styles.sectionTitle}>Günlük İlaç Programı</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {todaysMedicines.filter((m) => m.taken).length}/
              {todaysMedicines.length}
            </Text>
            <Text style={styles.progressLabel}>İlaç Alındı</Text>
          </View>
        </View>

        {todaysMedicines.length > 0 ? (
          <View style={styles.medicineList}>
            {todaysMedicines.map((medicine) => (
            <TouchableOpacity
              key={medicine.id}
              style={[
                  styles.medicineCard,
                  medicine.taken && styles.medicineCardTaken,
              ]}
                onPress={() =>
                  handleMedicineTaken(medicine.id, medicine.usage.time[0])
                }
            >
                <View style={styles.medicineCardLeft}>
                  <View style={styles.medicineIconContainer}>
                    <MaterialIcons
                      name={getMedicineIcon(medicine.type)}
                      size={24}
                      color={medicine.taken ? "#4CAF50" : "#2196F3"}
                    />
                  </View>
                  <View style={styles.medicineInfo}>
                    <Text style={styles.medicineName}>{medicine.name}</Text>
                    <Text style={styles.medicineDetails}>
                      {medicine.dosage.amount} {medicine.dosage.unit} •{" "}
                      {medicine.type}
                    </Text>
                    <Text style={styles.medicineTime}>
                      {medicine.usage.time.join(", ")}
                    </Text>
                  </View>
                </View>
                <View style={styles.medicineStatus}>
                <MaterialIcons
                  name={
                    medicine.taken ? "check-circle" : "radio-button-unchecked"
                  }
                  size={24}
                  color={medicine.taken ? "#4CAF50" : "#757575"}
                />
                </View>
              </TouchableOpacity>
            ))}
              </View>
        ) : (
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

  const homeItems: HomeItem[] = [
    { id: "1", type: "welcome" },
    { id: "2", type: "emergency" },
    { id: "3", type: "nextMedicine" },
    { id: "4", type: "dailyProgram" },
    { id: "5", type: "quickAccess" },
    { id: "6", type: "medicineChain" },
    { id: "7", type: "weeklyProgress" },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
      <FlatList
        data={homeItems}
        renderItem={renderHomeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    padding: 8,
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 20,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  welcomeText: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    color: "white",
    fontWeight: "500",
  },
  userName: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
  },
  emergencyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    padding: 16,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emergencyButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  nextMedicineCard: {
    backgroundColor: "#FF5722",
    padding: 20,
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
  nextMedicineInfo: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  medicineName: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  medicineTime: {
    fontSize: 20,
    color: "white",
    marginTop: 4,
  },
  medicineDosage: {
    fontSize: 18,
    color: "white",
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: "white",
    padding: 16,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#2196F3",
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    alignItems: "center",
    marginLeft: 16,
  },
  progressText: {
    fontSize: 24,
    color: "#2196F3",
    fontWeight: "bold",
  },
  progressLabel: {
    fontSize: 12,
    color: "#757575",
  },
  medicineList: {
    gap: 12,
  },
  medicineCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
    marginHorizontal: 4,
  },
  medicineCardTaken: {
    backgroundColor: "#E8F5E9",
    borderLeftColor: "#4CAF50",
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
    fontSize: 14,
    color: "#757575",
    marginBottom: 2,
  },
  medicineTime: {
    fontSize: 14,
    color: "#2196F3",
    fontWeight: "500",
  },
  medicineStatus: {
    marginLeft: 12,
  },
  quickAccessGrid: {
    padding: 8,
  },
  addMedicineButton: {
    width: "100%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  quickAccessText: {
    fontSize: 16,
    color: "#2196F3",
    marginTop: 8,
    fontWeight: "500",
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
  chainContainer: {
    backgroundColor: "white",
    padding: 16,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chainHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  chainTitle: {
    fontSize: 20,
    color: "#2196F3",
    fontWeight: "bold",
    marginLeft: 8,
  },
  chainProgress: {
    marginBottom: 20,
  },
  chainInfo: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  chainCount: {
    fontSize: 24,
    color: "#212121",
    fontWeight: "bold",
    marginRight: 8,
  },
  chainLabel: {
    fontSize: 16,
    color: "#757575",
  },
  chainBar: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  chainFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
  },
  weeklyContainer: {
    backgroundColor: "white",
    padding: 16,
    margin: 8,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  weeklyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  weeklyTitle: {
    fontSize: 20,
    color: "#2196F3",
    fontWeight: "bold",
    marginLeft: 8,
  },
  weeklyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 120,
  },
  weeklyDay: {
    alignItems: "center",
    flex: 1,
  },
  weeklyDayName: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
  },
  weeklyProgressBar: {
    width: 24,
    height: 80,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
  weeklyProgressFill: {
    width: "100%",
    backgroundColor: "#4CAF50",
    position: "absolute",
    bottom: 0,
  },
  weeklyDate: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "500",
  },
  listContainer: {
    padding: 8,
  },
});

export default HomeScreen;
