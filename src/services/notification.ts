import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Medicine } from '../types/medicine';
import { MedicineUsage } from '../types/usage';

// Bildirim izinlerini ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationService = {
  // Bildirim izinlerini iste
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      return false;
    }
    return true;
  },

  // İlaç hatırlatma bildirimi gönder
  async scheduleMedicineNotification(medicine: Medicine) {
    try {
      await this.requestPermissions();

      // Her kullanım zamanı için bildirim oluştur
      for (const time of medicine.usage.time) {
        const notificationContent = {
          title: "💊 İlaç Saati",
          body: `${medicine.name} ilacınızı almanız gerekiyor.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: { 
            type: 'medicine',
            medicineId: medicine.id,
            time: time
          },
        };

        // Bildirim zamanını hesapla
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const notificationTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );

        // Eğer zaman geçmişse, ertesi güne ayarla
        if (notificationTime < now) {
          notificationTime.setDate(notificationTime.getDate() + 1);
        }

        // Bildirimi planla
        await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: {
            type: 'timeInterval',
            seconds: Math.floor((notificationTime.getTime() - now.getTime()) / 1000),
            repeats: true
          },
        });
      }

      return true;
    } catch (error) {
      console.error('İlaç bildirimi planlanırken hata:', error);
      return false;
    }
  },

  // İlaç alınmadı uyarı bildirimi gönder
  async sendMissedMedicineNotification(medicine: Medicine, time: string) {
    try {
      await this.requestPermissions();

      const notificationContent = {
        title: "⚠️ İlaç Hatırlatması",
        body: `${medicine.name} ilacınızı ${time} saatinde almadınız!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { 
          type: 'missed_medicine',
          medicineId: medicine.id,
          time: time
        },
      };

      // Hemen bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
      });

      return true;
    } catch (error) {
      console.error('İlaç alınmadı bildirimi gönderilirken hata:', error);
      return false;
    }
  },

  // Acil durum bildirimi gönder
  async sendEmergencyNotification() {
    try {
      await this.requestPermissions();

      const notificationContent = {
        title: "🚨 ACİL DURUM!",
        body: "Kullanıcı acil durum butonuna bastı! Lütfen hemen kontrol edin.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'emergency' },
      };

      // Hemen bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
      });

      return true;
    } catch (error) {
      console.error('Acil durum bildirimi gönderilirken hata:', error);
      return false;
    }
  },

  // Belirli bir ilacın tüm bildirimlerini iptal et
  async cancelMedicineNotifications(medicineId: string) {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    const medicineNotifications = notifications.filter(
      notification => notification.content.data.medicineId === medicineId
    );
    
    for (const notification of medicineNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  },

  // Tüm bildirimleri temizle
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}; 