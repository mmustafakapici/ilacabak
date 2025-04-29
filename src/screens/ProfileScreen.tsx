import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import {
  StorageService,
  UserProfile,
  Settings,
  Relative,
} from "../services/storage";
import { NotificationSettingsScreen } from "./NotificationSettingsScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Profile: undefined;
  NotificationSettings: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

type ThemeMode = "light" | "dark" | "auto";

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<Settings | null>({
    soundEnabled: true,
    vibrationEnabled: true,
    notifyRelatives: true,
    voiceEnabled: true,
    theme: "light",
    fontSize: "normal",
    notificationTimes: [15, 30, 60],
  });
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<
    "profile" | "settings" | "relatives" | "notifications"
  >("profile");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    city: "",
    phone: "",
  });
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);

  // Verileri yükle
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedProfile, loadedSettings, loadedRelatives] =
        await Promise.all([
          StorageService.getUserProfile(),
          StorageService.getSettings(),
          StorageService.getRelatives(),
        ]);

      setProfile(loadedProfile);
      setSettings(loadedSettings);
      setRelatives(loadedRelatives);

      if (loadedProfile) {
        setFormData({
          name: loadedProfile.name,
          age: loadedProfile.age.toString(),
          city: loadedProfile.city,
          phone: loadedProfile.phone,
        });
      }
    } catch (error) {
      console.error("Veriler yüklenirken hata oluştu:", error);
    }
  };

  const handleOpenModal = (
    type: "profile" | "settings" | "relatives" | "notifications"
  ) => {
    setModalType(type);
    setModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      const newProfile: UserProfile = {
        name: formData.name,
        age: parseInt(formData.age),
        city: formData.city,
        phone: formData.phone,
      };
      await StorageService.saveUserProfile(newProfile);
      setProfile(newProfile);
      setModalVisible(false);
    } catch (error) {
      console.error("Profil kaydedilirken hata oluştu:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (settings) {
        await StorageService.saveSettings(settings);
        setModalVisible(false);
      }
    } catch (error) {
      console.error("Ayarlar kaydedilirken hata oluştu:", error);
    }
  };

  const handleToggleSetting = (key: keyof Settings) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    if (settings) {
      setSettings({
        ...settings,
        theme: newTheme,
      });
    }
  };

  const handleAddRelative = async () => {
    try {
      const newRelative: Relative = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        relation: formData.city, // Geçici olarak city alanını relation olarak kullanıyoruz
        notifyForMissedMeds: true,
        notifyForEmergency: true,
        notifyEnabled: true,
      };
      const updatedRelatives = [...relatives, newRelative];
      await StorageService.saveRelatives(updatedRelatives);
      setRelatives(updatedRelatives);
      setModalVisible(false);
      setFormData({ name: "", age: "", city: "", phone: "" });
    } catch (error) {
      console.error("Yakın eklenirken hata oluştu:", error);
    }
  };

  const handleDeleteRelative = async (id: string) => {
    try {
      const updatedRelatives = relatives.filter((rel) => rel.id !== id);
      await StorageService.saveRelatives(updatedRelatives);
      setRelatives(updatedRelatives);
    } catch (error) {
      console.error("Yakın silinirken hata oluştu:", error);
    }
  };

  const requestContactsPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });
        setContacts(data);
      }
    } catch (error) {
      console.error("Rehber erişim hatası:", error);
    }
  };

  const handleContactSelect = async (contact: Contacts.Contact) => {
    if (relatives.length >= 3) {
      Alert.alert("Uyarı", "En fazla 3 yakın kişi ekleyebilirsiniz.", [
        { text: "Tamam" },
      ]);
      return;
    }

    try {
      const phoneNumber = contact.phoneNumbers?.[0]?.number;
      if (!phoneNumber) {
        Alert.alert("Hata", "Bu kişinin telefon numarası bulunamadı.");
        return;
      }

      const newRelative: Relative = {
        id: Date.now().toString(),
        name: contact.name,
        phone: phoneNumber,
        relation: "Yakın",
        notifyForMissedMeds: true,
        notifyForEmergency: true,
        notifyEnabled: true,
      };

      const updatedRelatives = [...relatives, newRelative];
      await StorageService.saveRelatives(updatedRelatives);
      setRelatives(updatedRelatives);
      setShowContactPicker(false);
    } catch (error) {
      console.error("Yakın eklenirken hata oluştu:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Tüm verileri temizle
      await StorageService.clearAllData();

      // Ana ekrana dön
      navigation.reset({
        index: 0,
        routes: [{ name: "Welcome" }],
      });
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
      Alert.alert(
        "Hata",
        "Çıkış yapılırken bir hata oluştu. Lütfen tekrar deneyiniz."
      );
    }
  };

  const renderHeader = (title: string) => (
    <View style={styles.modalHeader}>
      <TouchableOpacity
        style={styles.modalBackButton}
        onPress={() => setModalVisible(false)}
      >
        <MaterialIcons name="arrow-back" size={24} color="#212121" />
      </TouchableOpacity>
      <Text style={styles.modalHeaderTitle}>{title}</Text>
    </View>
  );

  const renderContactPicker = () => (
    <View style={styles.modalContainer}>
      {renderHeader("Rehberden Kişi Seç")}
      <ScrollView style={styles.modalBody}>
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactItem}
            onPress={() => handleContactSelect(contact)}
          >
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <Text style={styles.contactPhone}>
                {contact.phoneNumbers?.[0]?.number || "Telefon numarası yok"}
              </Text>
            </View>
            <MaterialIcons name="add-circle" size={24} color="#4CAF50" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case "profile":
        return (
          <View style={styles.modalContainer}>
            {renderHeader("Kişisel Bilgiler")}
            <ScrollView style={styles.modalBody}>
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Yaş"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Şehir"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfile}
              >
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );

      case "notifications":
        return (
          <NotificationSettingsScreen onClose={() => setModalVisible(false)} />
        );

      case "settings":
        return (
          <View style={styles.modalContainer}>
            {renderHeader("Ayarlar")}
            <ScrollView style={styles.modalBody}>
              {settings && (
                <>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Sesli Bildirimler</Text>
                    <Switch
                      value={settings.soundEnabled}
                      onValueChange={() => handleToggleSetting("soundEnabled")}
                      trackColor={{ false: "#757575", true: "#81C784" }}
                      thumbColor={settings.soundEnabled ? "#4CAF50" : "#f4f3f4"}
                    />
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Titreşim</Text>
                    <Switch
                      value={settings.vibrationEnabled}
                      onValueChange={() =>
                        handleToggleSetting("vibrationEnabled")
                      }
                      trackColor={{ false: "#757575", true: "#81C784" }}
                      thumbColor={
                        settings.vibrationEnabled ? "#4CAF50" : "#f4f3f4"
                      }
                    />
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Sesli Komutlar</Text>
                    <Switch
                      value={settings.voiceEnabled}
                      onValueChange={() => handleToggleSetting("voiceEnabled")}
                      trackColor={{ false: "#757575", true: "#81C784" }}
                      thumbColor={settings.voiceEnabled ? "#4CAF50" : "#f4f3f4"}
                    />
                  </View>
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>Yakınlara Bildirim</Text>
                    <Switch
                      value={settings.notifyRelatives}
                      onValueChange={() =>
                        handleToggleSetting("notifyRelatives")
                      }
                      trackColor={{ false: "#757575", true: "#81C784" }}
                      thumbColor={
                        settings.notifyRelatives ? "#4CAF50" : "#f4f3f4"
                      }
                    />
                  </View>

                  <Text style={styles.settingsGroupTitle}>Tema</Text>
                  <View style={styles.themeOptionsContainer}>
                    <TouchableOpacity
                      style={styles.themeOption}
                      onPress={() => handleThemeChange("light")}
                    >
                      <View style={styles.themeIconContainer}>
                        <MaterialIcons
                          name="wb-sunny"
                          size={24}
                          color="#2196F3"
                        />
                        <Text style={styles.themeOptionText}>
                          Gündüz Teması
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          settings.theme === "light" &&
                            styles.radioButtonSelected,
                        ]}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.themeOption}
                      onPress={() => handleThemeChange("dark")}
                    >
                      <View style={styles.themeIconContainer}>
                        <MaterialIcons
                          name="nights-stay"
                          size={24}
                          color="#2196F3"
                        />
                        <Text style={styles.themeOptionText}>Gece Teması</Text>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          settings.theme === "dark" &&
                            styles.radioButtonSelected,
                        ]}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.themeOption, { borderBottomWidth: 0 }]}
                      onPress={() => handleThemeChange("auto")}
                    >
                      <View style={styles.themeIconContainer}>
                        <MaterialIcons
                          name="brightness-auto"
                          size={24}
                          color="#2196F3"
                        />
                        <Text style={styles.themeOptionText}>
                          Otomatik Tema
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioButton,
                          settings.theme === "auto" &&
                            styles.radioButtonSelected,
                        ]}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSaveSettings}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        );

      case "relatives":
        return (
          <View style={styles.modalContainer}>
            {renderHeader("Yakın Ekle")}
            <ScrollView style={styles.modalBody}>
              <TouchableOpacity
                style={styles.addContactButton}
                onPress={() => {
                  requestContactsPermission();
                  setShowContactPicker(true);
                }}
              >
                <MaterialIcons name="contacts" size={24} color="#2196F3" />
                <Text style={styles.addContactButtonText}>
                  Rehberden Kişi Seç
                </Text>
              </TouchableOpacity>

              <Text style={styles.divider}>veya</Text>

              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="İlişki"
                value={formData.city}
                onChangeText={(text) =>
                  setFormData({ ...formData, city: text })
                }
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddRelative}
              >
                <Text style={styles.saveButtonText}>Ekle</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profil Kartı */}
      <View style={styles.profileCard}>
        <Image
          source={require("../../assets/default-avatar.png")}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{profile?.name || "Kullanıcı"}</Text>
          <Text style={styles.profileDetails}>
            {profile?.age ? `${profile.age} yaş` : ""}
            {profile?.city ? ` • ${profile.city}` : ""}
          </Text>
        </View>
      </View>

      {/* Menü Öğeleri */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleOpenModal("profile")}
        >
          <MaterialIcons name="person" size={24} color="#2196F3" />
          <Text style={styles.menuItemText}>Kişisel Bilgiler</Text>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleOpenModal("notifications")}
        >
          <MaterialIcons name="notifications" size={24} color="#2196F3" />
          <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleOpenModal("relatives")}
        >
          <MaterialIcons name="people" size={24} color="#2196F3" />
          <Text style={styles.menuItemText}>Yakınlarım</Text>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => handleOpenModal("settings")}
        >
          <MaterialIcons name="settings" size={24} color="#2196F3" />
          <Text style={styles.menuItemText}>Ayarlar</Text>
          <MaterialIcons name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      {/* Yakınlar Listesi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Yakınlarım</Text>
        {relatives.map((relative) => (
          <View key={relative.id} style={styles.relativeItem}>
            <View style={styles.relativeInfo}>
              <Text style={styles.relativeName}>{relative.name}</Text>
              <Text style={styles.relativeDetails}>
                {relative.relation} • {relative.phone}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteRelative(relative.id)}
              style={styles.deleteButton}
            >
              <MaterialIcons name="delete" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Çıkış Butonu */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            "Çıkış Yap",
            "Çıkış yapmak istediğinize emin misiniz? Tüm verileriniz silinecektir.",
            [
              {
                text: "İptal",
                style: "cancel",
              },
              {
                text: "Çıkış Yap",
                style: "destructive",
                onPress: handleLogout,
              },
            ]
          );
        }}
      >
        <MaterialIcons name="logout" size={24} color="#F44336" />
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        {showContactPicker ? renderContactPicker() : renderModalContent()}
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 4,
  },
  profileDetails: {
    fontSize: 16,
    color: "#757575",
  },
  menuSection: {
    backgroundColor: "white",
    marginBottom: 16,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: "#212121",
    marginLeft: 16,
  },
  section: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    marginBottom: 16,
  },
  relativeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  relativeInfo: {
    flex: 1,
  },
  relativeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  relativeDetails: {
    fontSize: 14,
    color: "#757575",
  },
  deleteButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  logoutButtonText: {
    color: "#F44336",
    fontSize: 18,
    fontWeight: "500",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#212121",
    flex: 1,
    marginLeft: 16,
  },
  modalBackButton: {
    padding: 8,
  },
  modalBody: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 18,
    elevation: 1,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
  },
  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingLabel: {
    fontSize: 16,
    color: "#212121",
    marginLeft: 12,
  },
  settingsGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212121",
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  themeOptionsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 16,
    elevation: 1,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  themeIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeOptionText: {
    fontSize: 16,
    color: "#212121",
    marginLeft: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#757575",
  },
  radioButtonSelected: {
    borderColor: "#2196F3",
    backgroundColor: "#2196F3",
  },
  themeSettingItem: {
    marginTop: 8,
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#757575",
  },
  addContactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addContactButtonText: {
    fontSize: 16,
    color: "#2196F3",
    marginLeft: 8,
    fontWeight: "600",
  },
  divider: {
    textAlign: "center",
    fontSize: 16,
    color: "#757575",
    marginVertical: 16,
  },
});
