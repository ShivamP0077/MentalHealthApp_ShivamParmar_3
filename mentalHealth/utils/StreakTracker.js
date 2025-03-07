import AsyncStorage from "@react-native-async-storage/async-storage"
// import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
// import { db } from "../App"

// Keys for AsyncStorage
const STREAK_KEY = "mindfulme_streak"
const LAST_ACTIVITY_KEY = "mindfulme_last_activity"

// Activity types
export const ACTIVITY_TYPES = {
  MEDITATION: "meditation",
  JOURNALING: "journaling",
  WALKING: "walking",
  SLEEP: "sleep",
}

// Get current streak
export const getCurrentStreak = async () => {
  try {
    const streakData = await AsyncStorage.getItem(STREAK_KEY)
    if (streakData) {
      return JSON.parse(streakData)
    }
    return {
      current: 0,
      best: 0,
      lastUpdated: null,
      activities: {
        [ACTIVITY_TYPES.MEDITATION]: 0,
        [ACTIVITY_TYPES.JOURNALING]: 0,
        [ACTIVITY_TYPES.WALKING]: 0,
        [ACTIVITY_TYPES.SLEEP]: 0,
      },
    }
  } catch (error) {
    console.log("Error getting streak:", error)
    return {
      current: 0,
      best: 0,
      lastUpdated: null,
      activities: {
        [ACTIVITY_TYPES.MEDITATION]: 0,
        [ACTIVITY_TYPES.JOURNALING]: 0,
        [ACTIVITY_TYPES.WALKING]: 0,
        [ACTIVITY_TYPES.SLEEP]: 0,
      },
    }
  }
}

// Check if streak is still valid (not broken)
const isStreakValid = (lastUpdated) => {
  if (!lastUpdated) return false

  const lastDate = new Date(lastUpdated)
  const today = new Date()

  // Reset hours, minutes, seconds to compare dates only
  lastDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  // Calculate difference in days
  const diffTime = Math.abs(today - lastDate)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  // Streak is valid if last activity was today or yesterday
  return diffDays <= 1
}

// Update streak when user completes an activity
export const updateStreak = async (activityType) => {
  try {
    // Get current streak data
    const streakData = await getCurrentStreak()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if we already recorded this activity type today
    const lastActivityData = await AsyncStorage.getItem(LAST_ACTIVITY_KEY)
    const lastActivities = lastActivityData ? JSON.parse(lastActivityData) : {}

    // If this activity was already done today, don't count it again
    if (
      lastActivities[activityType] &&
      new Date(lastActivities[activityType]).setHours(0, 0, 0, 0) === today.getTime()
    ) {
      return streakData
    }

    // Update last activity time for this type
    lastActivities[activityType] = today.toISOString()
    await AsyncStorage.setItem(LAST_ACTIVITY_KEY, JSON.stringify(lastActivities))

    // Increment activity count
    streakData.activities[activityType] = (streakData.activities[activityType] || 0) + 1

    // Check if streak is still valid
    if (isStreakValid(streakData.lastUpdated)) {
      // If last update was yesterday, increment streak
      if (streakData.lastUpdated && new Date(streakData.lastUpdated).setHours(0, 0, 0, 0) !== today.getTime()) {
        streakData.current += 1
      }
    } else {
      // Streak broken, reset to 1
      streakData.current = 1
    }

    // Update best streak if needed
    if (streakData.current > streakData.best) {
      streakData.best = streakData.current
    }

    // Update last updated timestamp
    streakData.lastUpdated = today.toISOString()

    // Save updated streak data
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData))

    // Also save to Firestore for backup
    const userName = await AsyncStorage.getItem("userName")
    if (userName) {
      const streakRef = doc(db, "streaks", userName)
      const streakDoc = await getDoc(streakRef)

      if (streakDoc.exists()) {
        await updateDoc(streakRef, {
          current: streakData.current,
          best: streakData.best,
          lastUpdated: streakData.lastUpdated,
          activities: streakData.activities,
          updatedAt: serverTimestamp(),
        })
      } else {
        await setDoc(streakRef, {
          current: streakData.current,
          best: streakData.best,
          lastUpdated: streakData.lastUpdated,
          activities: streakData.activities,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    }

    return streakData
  } catch (error) {
    console.log("Error updating streak:", error)
    return null
  }
}

// Sync local streak data with Firestore
export const syncStreakData = async () => {
  try {
    const userName = await AsyncStorage.getItem("userName")
    if (!userName) return

    const streakRef = doc(db, "streaks", userName)
    const streakDoc = await getDoc(streakRef)

    if (streakDoc.exists()) {
      const firestoreData = streakDoc.data()
      const localData = await getCurrentStreak()

      // Use the most recent data
      if (
        firestoreData.lastUpdated &&
        (!localData.lastUpdated || new Date(firestoreData.lastUpdated) > new Date(localData.lastUpdated))
      ) {
        await AsyncStorage.setItem(
          STREAK_KEY,
          JSON.stringify({
            current: firestoreData.current,
            best: firestoreData.best,
            lastUpdated: firestoreData.lastUpdated,
            activities: firestoreData.activities || {
              [ACTIVITY_TYPES.MEDITATION]: 0,
              [ACTIVITY_TYPES.JOURNALING]: 0,
              [ACTIVITY_TYPES.WALKING]: 0,
              [ACTIVITY_TYPES.SLEEP]: 0,
            },
          }),
        )
      } else if (localData.lastUpdated) {
        // Update Firestore with local data
        await updateDoc(streakRef, {
          current: localData.current,
          best: localData.best,
          lastUpdated: localData.lastUpdated,
          activities: localData.activities,
          updatedAt: serverTimestamp(),
        })
      }
    } else {
      // No Firestore data, create from local
      const localData = await getCurrentStreak()
      if (localData.lastUpdated) {
        await setDoc(streakRef, {
          current: localData.current,
          best: localData.best,
          lastUpdated: localData.lastUpdated,
          activities: localData.activities,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
    }
  } catch (error) {
    console.log("Error syncing streak data:", error)
  }
}

// Check if streak needs to be reset (if user missed a day)
export const checkAndUpdateStreak = async () => {
  try {
    const streakData = await getCurrentStreak()
    if (!streakData.lastUpdated) return streakData

    if (!isStreakValid(streakData.lastUpdated)) {
      // Streak broken, reset to 0
      streakData.current = 0
      streakData.lastUpdated = new Date().toISOString()

      await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streakData))

      // Update Firestore
      const userName = await AsyncStorage.getItem("userName")
      if (userName) {
        const streakRef = doc(db, "streaks", userName)
        await updateDoc(streakRef, {
          current: 0,
          lastUpdated: streakData.lastUpdated,
          updatedAt: serverTimestamp(),
        })
      }
    }

    return streakData
  } catch (error) {
    console.log("Error checking streak:", error)
    return null
  }
}

