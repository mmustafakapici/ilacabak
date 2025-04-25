import React, { createContext, useContext, useState, useEffect } from "react";
import { StorageService, Medicine } from "../services/storage";

type ReminderMedicine = Medicine & {
  isLate: boolean;
  minutesLate?: number;
  timeUntil?: number;
};

interface MedicineContextType {
  medicines: ReminderMedicine[];
  reminderCount: number;
  loadMedicines: () => Promise<void>;
  updateMedicine: (medicine: Medicine) => Promise<void>;
  addMedicine: (medicine: Medicine) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  toggleMedicineTaken: (id: string) => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | undefined>(
  undefined
);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [medicines, setMedicines] = useState<ReminderMedicine[]>([]);
  const [reminderCount, setReminderCount] = useState(0);

  const calculateMedicineStatus = (medicine: Medicine): ReminderMedicine => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [hours, minutes] = medicine.time.split(":").map(Number);
    const medicineTime = hours * 60 + minutes;
    const timeDiff = currentTime - medicineTime;

    return {
      ...medicine,
      isLate: !medicine.taken && timeDiff >= 10,
      minutesLate: timeDiff >= 0 ? timeDiff : undefined,
      timeUntil: timeDiff < 0 ? Math.abs(timeDiff) : undefined,
    };
  };

  const loadMedicines = async () => {
    try {
      const allMedicines = await StorageService.getMedicines();
      const processedMedicines = allMedicines.map(calculateMedicineStatus);

      // Sıralama: Önce gecikenler, sonra yaklaşanlar
      const sortedMedicines = processedMedicines.sort((a, b) => {
        if (a.isLate && !b.isLate) return -1;
        if (!a.isLate && b.isLate) return 1;
        if (a.timeUntil && b.timeUntil) return a.timeUntil - b.timeUntil;
        return 0;
      });

      setMedicines(sortedMedicines);
      const lateCount = sortedMedicines.filter((med) => med.isLate).length;
      setReminderCount(lateCount);
    } catch (error) {
      console.error("İlaçlar yüklenirken hata:", error);
    }
  };

  const updateMedicine = async (medicine: Medicine) => {
    try {
      const updatedMedicines = medicines.map((med) =>
        med.id === medicine.id ? calculateMedicineStatus(medicine) : med
      );
      await StorageService.saveMedicines(updatedMedicines);
      await loadMedicines();
    } catch (error) {
      console.error("İlaç güncellenirken hata:", error);
    }
  };

  const addMedicine = async (medicine: Medicine) => {
    try {
      const newMedicine = calculateMedicineStatus(medicine);
      const updatedMedicines = [...medicines, newMedicine];
      await StorageService.saveMedicines(updatedMedicines);
      await loadMedicines();
    } catch (error) {
      console.error("İlaç eklenirken hata:", error);
    }
  };

  const deleteMedicine = async (id: string) => {
    try {
      const updatedMedicines = medicines.filter((med) => med.id !== id);
      await StorageService.saveMedicines(updatedMedicines);
      await loadMedicines();
    } catch (error) {
      console.error("İlaç silinirken hata:", error);
    }
  };

  const toggleMedicineTaken = async (id: string) => {
    try {
      const updatedMedicines = medicines.map((med) =>
        med.id === id
          ? calculateMedicineStatus({ ...med, taken: !med.taken })
          : med
      );
      await StorageService.saveMedicines(updatedMedicines);
      await loadMedicines();
    } catch (error) {
      console.error("İlaç durumu güncellenirken hata:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(loadMedicines, 60000); // Her dakika güncelle
    loadMedicines();
    return () => clearInterval(interval);
  }, []);

  const value = {
    medicines,
    reminderCount,
    loadMedicines,
    updateMedicine,
    addMedicine,
    deleteMedicine,
    toggleMedicineTaken,
  };

  return (
    <MedicineContext.Provider value={value}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicine = () => {
  const context = useContext(MedicineContext);
  if (context === undefined) {
    throw new Error("useMedicine must be used within a MedicineProvider");
  }
  return context;
};
