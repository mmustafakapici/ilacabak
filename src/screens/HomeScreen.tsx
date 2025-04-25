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
import Sms from "react-native-sms";
import Geolocation from "react-native-geolocation-service";

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

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { medicines, toggleMedicineTaken } = useMedicine();
  const [userName, setUserName] = useState<string>("");
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    loadInitialData();
    loadRelatives();
    requestLocationPermission();
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadUserProfile()]);
    } catch (error) {
      console.error("Veriler yüklenirken hata oluştu:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      if (profile) {
        setUserName(profile.name);
      }
    } catch (error) {
      console.error("Profil yüklenirken hata oluştu:", error);
    }
  };

  const loadRelatives = async () => {
    try {
      const loadedRelatives = await StorageService.getRelatives();
      setRelatives(loadedRelatives);
    } catch (error) {
      console.error("Yakınlar yüklenirken hata:", error);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === "ios") {
      const auth = await Geolocation.requestAuthorization("whenInUse");
      if (auth === "granted") {
        getCurrentLocation();
      }
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Konum İzni",
            message: "Acil durum mesajı için konum bilginize ihtiyacımız var.",
            buttonNeutral: "Daha Sonra Sor",
            buttonNegative: "İptal",
            buttonPositive: "Tamam",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Konum alınamadı:", error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const getNextMedicine = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    return medicines.find(
      (medicine) => !medicine.taken && medicine.time > currentTime
    );
  };

  const handleMedicineTaken = async (id: string) => {
    await toggleMedicineTaken(id);
  };

  const handleEmergency = () => {
    Alert.alert(
      "Acil Durum",
      "Yakınlarınıza bildirim gönderilecek. Devam etmek istiyor musunuz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Evet",
          onPress: async () => {
            await NotificationService.sendEmergencyNotification();
            Alert.alert("Bildirim Gönderildi", "Yakınlarınıza bilgi verildi.");
          },
        },
      ]
    );
  };

  const handleAddMedicine = () => {
    navigation.navigate("AddMedicine" as never);
  };

  const handleReminders = () => {
    navigation.navigate("Hatirlatmalar" as never);
  };

  const handleCalendar = () => {
    navigation.navigate("GunlukProgram" as never);
  };

  const handleRelatives = () => {
    navigation.navigate("Relatives" as never);
  };

  const sendEmergencySMS = async () => {
    if (relatives.length === 0) {
      Alert.alert(
        "Uyarı",
        "Henüz yakın kişi eklenmemiş. Lütfen önce yakın kişi ekleyin."
      );
      return;
    }

    let message =
      "ACİL DURUM! İlaç Takip Uygulamasından acil durum bildirimi:\n\n";

    if (location) {
      message += `Konum: https://www.google.com/maps?q=${location.latitude},${location.longitude}\n`;
      message += `Enlem: ${location.latitude}\n`;
      message += `Boylam: ${location.longitude}\n\n`;
    } else {
      message += "Konum bilgisi alınamadı.\n\n";
    }

    message += "Lütfen hemen yardıma gelin!";

    const phoneNumbers = relatives
      .filter((relative) => relative.notifyForEmergency)
      .map((relative) => relative.phone);

    if (phoneNumbers.length === 0) {
      Alert.alert(
        "Uyarı",
        "Acil durum bildirimi için ayarlanmış yakın kişi bulunamadı."
      );
      return;
    }

    try {
      Sms.send(
        {
          body: message,
          recipients: phoneNumbers,
        },
        (completed, cancelled, error) => {
          if (completed) {
            Alert.alert(
              "Başarılı",
              "Acil durum mesajı yakınlarınıza gönderildi."
            );
          } else if (cancelled) {
            Alert.alert("İptal", "Mesaj gönderimi iptal edildi.");
          } else if (error) {
            Alert.alert("Hata", "Mesaj gönderilirken bir hata oluştu.");
          }
        }
      );
    } catch (error) {
      console.error("SMS gönderme hatası:", error);
      Alert.alert("Hata", "Mesaj gönderilirken bir hata oluştu.");
    }
  };

  const nextMedicine = getNextMedicine();

  const MedicineChain = ({ medicines }: { medicines: Medicine[] }) => {
    // Bugünün tarihini al
    const today = new Date().toISOString().split("T")[0];

    // Sadece bugünün ilaçlarını filtrele
    const todaysMedicines = medicines.filter((m) => m.date === today);
    const takenCount = todaysMedicines.filter((m) => m.taken).length;
    const totalCount = todaysMedicines.length;
    const progress = totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

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

        <View style={styles.chainItems}>
          {todaysMedicines.map((medicine, index) => (
            <View key={medicine.id} style={styles.chainItem}>
              <View
                style={[
                  styles.chainDot,
                  medicine.taken
                    ? styles.chainDotTaken
                    : styles.chainDotPending,
                ]}
              >
                {medicine.taken && (
                  <MaterialIcons name="check" size={16} color="white" />
                )}
              </View>
              {index < todaysMedicines.length - 1 && (
                <View
                  style={[
                    styles.chainLine,
                    medicine.taken
                      ? styles.chainLineTaken
                      : styles.chainLinePending,
                  ]}
                />
              )}
            </View>
          ))}
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
              return medicine.date === dayString;
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
            onPress={sendEmergencySMS}
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
        return (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="today" size={24} color="#2196F3" />
              <Text style={styles.sectionTitle}>Günlük İlaç Programı</Text>
            </View>
            {medicines.length > 0 ? (
              medicines.map((medicine) => (
                <TouchableOpacity
                  key={medicine.id}
                  style={[
                    styles.medicineItem,
                    medicine.taken && styles.medicineTaken,
                  ]}
                  onPress={() => handleMedicineTaken(medicine.id)}
                >
                  <View style={styles.medicineItemLeft}>
                    <MaterialIcons
                      name={
                        medicine.taken
                          ? "check-circle"
                          : "radio-button-unchecked"
                      }
                      size={24}
                      color={medicine.taken ? "#4CAF50" : "#757575"}
                    />
                    <View style={styles.medicineItemInfo}>
                      <Text style={styles.medicineItemName}>
                        {medicine.name}
                      </Text>
                      <Text style={styles.medicineItemDosage}>
                        {medicine.dosage} • {medicine.type}
                      </Text>
                      <Text style={styles.medicineItemUsage}>
                        {medicine.usageType}
                        {medicine.timingNote ? ` (${medicine.timingNote})` : ""}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.medicineItemTime}>{medicine.time}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialIcons name="info" size={48} color="#757575" />
                <Text style={styles.emptyStateText}>
                  Henüz ilaç eklenmemiş. İlaç eklemek için "İlaç Ekle" butonunu
                  kullanabilirsiniz.
                </Text>
              </View>
            )}
          </View>
        );
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
    <View style={styles.container}>
      <FlatList
        data={homeItems}
        renderItem={renderHomeItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  welcomeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    padding: 20,
    margin: 16,
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
    padding: 20,
    margin: 16,
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
  },
  medicineItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginTop: 8,
  },
  medicineTaken: {
    backgroundColor: "#E8F5E9",
  },
  medicineItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  medicineItemInfo: {
    marginLeft: 12,
  },
  medicineItemName: {
    fontSize: 18,
    color: "#212121",
    fontWeight: "500",
  },
  medicineItemDosage: {
    fontSize: 16,
    color: "#757575",
    marginTop: 2,
  },
  medicineItemTime: {
    fontSize: 18,
    color: "#2196F3",
    fontWeight: "500",
  },
  medicineItemUsage: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 2,
  },
  quickAccessGrid: {
    padding: 16,
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
    padding: 20,
    margin: 16,
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
  chainItems: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  chainItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  chainDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  chainDotTaken: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  chainDotPending: {
    backgroundColor: "white",
    borderColor: "#E0E0E0",
  },
  chainLine: {
    width: 40,
    height: 2,
    marginHorizontal: 4,
  },
  chainLineTaken: {
    backgroundColor: "#4CAF50",
  },
  chainLinePending: {
    backgroundColor: "#E0E0E0",
  },
  weeklyContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 16,
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
    padding: 16,
  },
});
