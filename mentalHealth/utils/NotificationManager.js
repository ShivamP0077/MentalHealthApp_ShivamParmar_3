import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Platform } from "react-native"

// Notification channels
const CHANNELS = {
  MEDITATION: "meditation-reminders",
  JOURNALING: "journaling-reminders",
  WELLNESS: "wellness-challenges",
  STREAK: "streak-reminders",
}

// Notification IDs for cancellation
const NOTIFICATION_IDS = {
  MEDITATION: "meditation-daily",
  JOURNALING: "journaling-daily",
  WELLNESS_CHALLENGE: "wellness-challenge",
  STREAK_REMINDER: "streak-reminder",
}

// AsyncStorage keys
const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled"
const NOTIFICATION_SETTINGS_KEY = "notification_settings"

// Default notification times
const DEFAULT_SETTINGS = {
  meditationTime: { hour: 8, minute: 0 }, // 8:00 AM
  journalingTime: { hour: 20, minute: 0 }, // 8:00 PM
  wellnessChallengeTime: { hour: 10, minute: 0 }, // 10:00 AM
  streakReminderTime: { hour: 19, minute: 0 }, // 7:00 PM
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// Initialize notification channels (Android only)
export const initializeNotifications = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNELS.MEDITATION, {
      name: "Meditation Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    })

    await Notifications.setNotificationChannelAsync(CHANNELS.JOURNALING, {
      name: "Journaling Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    })

    await Notifications.setNotificationChannelAsync(CHANNELS.WELLNESS, {
      name: "Wellness Challenges",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    })

    await Notifications.setNotificationChannelAsync(CHANNELS.STREAK, {
      name: "Streak Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#4A90E2",
    })
  }
}

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    alert("Notifications are not available in the simulator")
    return false
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== "granted") {
    alert("You need to enable notification permissions to receive reminders")
    return false
  }

  return true
}

// Schedule all notifications based on user settings
export const scheduleAllNotifications = async () => {
  const permissionGranted = await requestNotificationPermissions()
  if (!permissionGranted) return false

  // Get user settings or use defaults
  const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY)
  const settings = settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS

  // Cancel any existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync()

  // Schedule meditation reminder
  await scheduleMeditationReminder(settings.meditationTime)

  // Schedule journaling reminder
  await scheduleJournalingReminder(settings.journalingTime)

  // Schedule wellness challenge
  await scheduleWellnessChallenge(settings.wellnessChallengeTime)

  // Schedule streak reminder
  await scheduleStreakReminder(settings.streakReminderTime)

  // Save notification state
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true")

  return true
}

// Schedule meditation reminder
export const scheduleMeditationReminder = async ({ hour, minute }) => {
  const trigger = new Date()
  trigger.setHours(hour, minute, 0)

  // If time has already passed today, schedule for tomorrow
  if (trigger <= new Date()) {
    trigger.setDate(trigger.getDate() + 1)
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.MEDITATION,
    content: {
      title: "Time for Mindfulness",
      body: "Take a few minutes to meditate and center yourself.",
      data: { screen: "Meditation" },
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    },
  })
}

// Schedule journaling reminder
export const scheduleJournalingReminder = async ({ hour, minute }) => {
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.JOURNALING,
    content: {
      title: "Reflect on Your Day",
      body: "Take a moment to journal your thoughts and feelings.",
      data: { screen: "Journal" },
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    },
  })
}

// Schedule wellness challenge
export const scheduleWellnessChallenge = async ({ hour, minute }) => {
  // Array of wellness challenges
  const challenges = [
    "Try a 5-minute breathing exercise today.",
    "Drink 8 glasses of water today.",
    "Take a 15-minute walk outside.",
    "Practice gratitude by writing down 3 things you're thankful for.",
    "Reach out to a friend or family member you haven't spoken to in a while.",
    "Try a new healthy recipe today.",
    "Spend 10 minutes stretching or doing yoga.",
    "Take a break from social media today.",
    "Listen to your favorite uplifting music.",
    "Practice mindful eating during one meal today.",
  ]

  // Pick a random challenge
  const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)]

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.WELLNESS_CHALLENGE,
    content: {
      title: "Daily Wellness Challenge",
      body: randomChallenge,
      data: { screen: "Home" },
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    },
  })
}

// Schedule streak reminder
export const scheduleStreakReminder = async ({ hour, minute }) => {
  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDS.STREAK_REMINDER,
    content: {
      title: "Don't Break Your Streak!",
      body: "You're on a roll! Complete an activity today to maintain your streak.",
      data: { screen: "Home" },
      sound: true,
    },
    trigger: {
      hour: hour,
      minute: minute,
      repeats: true,
    },
  })
}

// Cancel all notifications
export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync()
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false")
}

// Check if notifications are enabled
export const areNotificationsEnabled = async () => {
  const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY)
  return enabled === "true"
}

// Save notification settings
export const saveNotificationSettings = async (settings) => {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings))

  // Reschedule notifications with new settings
  if (await areNotificationsEnabled()) {
    await scheduleAllNotifications()
  }
}

// Get notification settings
export const getNotificationSettings = async () => {
  const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY)
  return settingsJson ? JSON.parse(settingsJson) : DEFAULT_SETTINGS
}

// Handle notification response (when user taps on notification)
export const handleNotificationResponse = (response, navigation) => {
  if (response.notification.request.content.data.screen) {
    navigation.navigate(response.notification.request.content.data.screen)
  }
}

