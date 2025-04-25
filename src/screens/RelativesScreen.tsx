import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StorageService } from "../services/storage";

interface Relative {
  id: string;
  name: string;
  phone: string;
  relation: string;
  notifyForMissedMeds: boolean;
  notifyForEmergency: boolean;
}

export const RelativesScreen = () => {
  const [relatives, setRelatives] = useState<Relative[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRelative, setEditingRelative] = useState<Relative | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relation: "",
    notifyForMissedMeds: true,
    notifyForEmergency: true,
  });

  useEffect(() => {
    loadRelatives();
  }, []);

  const loadRelatives = async () => {
    try {
      const savedRelatives = await StorageService.getRelatives();
      if (savedRelatives) {
        setRelatives(savedRelatives);
      }
    } catch (error) {
      console.error("Yakınlar yüklenirken hata oluştu:", error);
    }
  };

  const handleAddRelative = () => {
    setEditingRelative(null);
    setFormData({
      name: "",
      phone: "",
      relation: "",
      notifyForMissedMeds: true,
      notifyForEmergency: true,
    });
    setModalVisible(true);
  };

  const handleEditRelative = (relative: Relative) => {
    setEditingRelative(relative);
    setFormData({
      name: relative.name,
      phone: relative.phone,
      relation: relative.relation,
      notifyForMissedMeds: relative.notifyForMissedMeds,
      notifyForEmergency: relative.notifyForEmergency,
    });
    setModalVisible(true);
  };

  const handleDeleteRelative = async (id: string) => {
    Alert.alert(
      "Yakın Kişiyi Sil",
      "Bu kişiyi silmek istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedRelatives = relatives.filter((r) => r.id !== id);
              await StorageService.saveRelatives(updatedRelatives);
              setRelatives(updatedRelatives);
            } catch (error) {
              console.error("Yakın silinirken hata oluştu:", error);
              Alert.alert("Hata", "Yakın silinirken bir hata oluştu.");
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.relation) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurunuz.");
      return;
    }

    try {
      const newRelative = {
        id: editingRelative?.id || Date.now().toString(),
        ...formData,
      };

      let updatedRelatives;
      if (editingRelative) {
        updatedRelatives = relatives.map((r) =>
          r.id === editingRelative.id ? newRelative : r
        );
      } else {
        updatedRelatives = [...relatives, newRelative];
      }

      await StorageService.saveRelatives(updatedRelatives);
      setRelatives(updatedRelatives);
      setModalVisible(false);
    } catch (error) {
      console.error("Yakın kaydedilirken hata oluştu:", error);
      Alert.alert("Hata", "Yakın kaydedilirken bir hata oluştu.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {relatives.map((relative) => (
          <View key={relative.id} style={styles.relativeCard}>
            <View style={styles.relativeInfo}>
              <Text style={styles.relativeName}>{relative.name}</Text>
              <Text style={styles.relativeDetails}>
                {relative.relation} • {relative.phone}
              </Text>
              <View style={styles.notificationSettings}>
                <Text style={styles.notificationText}>
                  {relative.notifyForMissedMeds ? "🔔 İlaç Hatırlatma" : ""}
                  {relative.notifyForMissedMeds && relative.notifyForEmergency
                    ? " • "
                    : ""}
                  {relative.notifyForEmergency ? "🚨 Acil Durum" : ""}
                </Text>
              </View>
            </View>
            <View style={styles.relativeActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditRelative(relative)}
              >
                <MaterialIcons name="edit" size={24} color="#2196F3" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteRelative(relative.id)}
              >
                <MaterialIcons name="delete" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddRelative}>
        <MaterialIcons name="person-add" size={24} color="white" />
        <Text style={styles.addButtonText}>Yakın Ekle</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRelative ? "Yakın Düzenle" : "Yakın Ekle"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Ad Soyad"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Telefon"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Yakınlık Derecesi"
              value={formData.relation}
              onChangeText={(text) =>
                setFormData({ ...formData, relation: text })
              }
            />

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>İlaç Hatırlatma Bildirimi</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  formData.notifyForMissedMeds && styles.toggleButtonActive,
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    notifyForMissedMeds: !formData.notifyForMissedMeds,
                  })
                }
              >
                <MaterialIcons
                  name={formData.notifyForMissedMeds ? "check" : "close"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Acil Durum Bildirimi</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  formData.notifyForEmergency && styles.toggleButtonActive,
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    notifyForEmergency: !formData.notifyForEmergency,
                  })
                }
              >
                <MaterialIcons
                  name={formData.notifyForEmergency ? "check" : "close"}
                  size={20}
                  color="white"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <MaterialIcons name="check" size={24} color="white" />
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
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
  relativeCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    margin: 8,
    elevation: 2,
  },
  relativeInfo: {
    flex: 1,
  },
  relativeName: {
    fontSize: 18,
    color: "#212121",
    fontWeight: "500",
  },
  relativeDetails: {
    fontSize: 16,
    color: "#757575",
    marginTop: 4,
  },
  notificationSettings: {
    marginTop: 8,
  },
  notificationText: {
    fontSize: 14,
    color: "#2196F3",
  },
  relativeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "500",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    color: "#212121",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: "#212121",
  },
  toggleButton: {
    backgroundColor: "#757575",
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "500",
    marginLeft: 8,
  },
});
