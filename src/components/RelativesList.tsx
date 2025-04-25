import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Relative {
  id: string;
  name: string;
  relation: string;
  phone: string;
  notifyOnMedication: boolean;
}

export const RelativesList = () => {
  const [relatives, setRelatives] = useState<Relative[]>([
    {
      id: "1",
      name: "Ayşe Yılmaz",
      relation: "Kızı",
      phone: "0532 987 65 43",
      notifyOnMedication: true,
    },
    {
      id: "2",
      name: "Mehmet Yılmaz",
      relation: "Oğlu",
      phone: "0533 456 78 90",
      notifyOnMedication: true,
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newRelative, setNewRelative] = useState<Omit<Relative, "id">>({
    name: "",
    relation: "",
    phone: "",
    notifyOnMedication: true,
  });

  const handleAddRelative = () => {
    if (newRelative.name && newRelative.phone) {
      setRelatives([
        ...relatives,
        {
          id: Date.now().toString(),
          ...newRelative,
        },
      ]);
      setShowAddForm(false);
      setNewRelative({
        name: "",
        relation: "",
        phone: "",
        notifyOnMedication: true,
      });
    }
  };

  const renderRelative = ({ item }: { item: Relative }) => (
    <View style={styles.relativeItem}>
      <View style={styles.relativeInfo}>
        <Text style={styles.relativeName}>{item.name}</Text>
        <Text style={styles.relativeDetail}>{item.relation}</Text>
        <Text style={styles.relativeDetail}>{item.phone}</Text>
      </View>
      <View style={styles.relativeActions}>
        <TouchableOpacity
          style={[
            styles.notificationToggle,
            {
              backgroundColor: item.notifyOnMedication ? "#4CAF50" : "#757575",
            },
          ]}
          onPress={() => {
            setRelatives(
              relatives.map((rel) =>
                rel.id === item.id
                  ? { ...rel, notifyOnMedication: !rel.notifyOnMedication }
                  : rel
              )
            );
          }}
        >
          <MaterialIcons
            name={
              item.notifyOnMedication
                ? "notifications-active"
                : "notifications-off"
            }
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            setRelatives(relatives.filter((rel) => rel.id !== item.id));
          }}
        >
          <MaterialIcons name="delete" size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={relatives}
        renderItem={renderRelative}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddForm(true)}
          >
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Yeni Yakın Ekle</Text>
          </TouchableOpacity>
        }
      />

      {showAddForm && (
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Yeni Yakın Ekle</Text>
          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            value={newRelative.name}
            onChangeText={(text) =>
              setNewRelative({ ...newRelative, name: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Yakınlık Derecesi"
            value={newRelative.relation}
            onChangeText={(text) =>
              setNewRelative({ ...newRelative, relation: text })
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Telefon"
            value={newRelative.phone}
            onChangeText={(text) =>
              setNewRelative({ ...newRelative, phone: text })
            }
            keyboardType="phone-pad"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.saveButton]}
              onPress={handleAddRelative}
            >
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  relativeItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
  },
  relativeInfo: {
    flex: 1,
  },
  relativeName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  relativeDetail: {
    fontSize: 16,
    color: "#757575",
    marginBottom: 2,
  },
  relativeActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationToggle: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  addForm: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    elevation: 4,
    margin: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#F5F5F5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  formButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  formButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#757575",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#2196F3",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
