import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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

  // Demo bildirimi gönder
  async sendDemoNotification(minutes: number) {
    try {
      await this.requestPermissions();

      // Bildirim içeriği
      const notificationContent = {
        title: "İlaç Hatırlatması",
        body: `${minutes} dakika sonra ilaç saatiniz gelecek!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'demo', minutes },
      };

      // 10 saniye sonra bildirim gönder
      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: { seconds: 10 },
      });

      return true;
    } catch (error) {
      console.error('Demo bildirimi gönderilirken hata:', error);
      return false;
    }
  },

  // Acil durum bildirimi gönder
  async sendEmergencyNotification() {
    try {
      await this.requestPermissions();

      // Bildirim içeriği
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

  // Tüm bildirimleri temizle
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}; 