import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StorageService } from "../services/storage";
import { AddMedicineScreen } from "./AddMedicineScreen";

export const EditMedicineScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const medicine = (route.params as any)?.medicine;

  const handleDelete = async () => {
    Alert.alert("İlacı Sil", "Bu ilacı silmek istediğinizden emin misiniz?", [
      {
        text: "İptal",
        style: "cancel",
      },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            const medicines = await StorageService.getMedicines();
            const updatedMedicines = medicines.filter(
              (med) => med.id !== medicine.id
            );
            await StorageService.saveMedicines(updatedMedicines);
            navigation.goBack();
          } catch (error) {
            console.error("İlaç silinirken hata oluştu:", error);
            Alert.alert("Hata", "İlaç silinirken bir hata oluştu.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <AddMedicineScreen isEditMode medicine={medicine} />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <MaterialIcons name="delete" size={28} color="white" />
        <Text style={styles.deleteButtonText}>İlacı Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F44336",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
  },
  deleteButtonText: {
    fontSize: 24,
    color: "white",
    fontWeight: "500",
    marginLeft: 12,
  },
});
