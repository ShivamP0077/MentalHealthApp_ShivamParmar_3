"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as StreakTracker from "../utils/StreakTracker"

const StreakScreen = () => {
  const [streakData, setStreakData] = useState({
    current: 0,
    best: 0,
    activities: {
      meditation: 0,
      journaling: 0,
      walking: 0,
      sleep: 0,
    },
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStreakData()
  }, [])

  const loadStreakData = async () => {
    setLoading(true)
    try {
      // Check if streak needs to be reset
      await StreakTracker.checkAndUpdateStreak()

      // Get current streak data
      const data = await StreakTracker.getCurrentStreak()
      setStreakData(data)

      // Sync with Firestore
      await StreakTracker.syncStreakData()
    } catch (error) {
      console.log("Error loading streak data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStreakMessage = (current) => {
    if (current === 0) {
      return "Start your streak today by completing an activity!"
    } else if (current === 1) {
      return "Great start! You're on day 1 of your streak."
    } else if (current < 5) {
      return `You're building momentum! Keep it up!`
    } else if (current < 10) {
      return `Impressive! You've been consistent for ${current} days.`
    } else {
      return `Amazing! ${current} days of wellness practices!`
    }
  }

  const renderActivityItem = (icon, title, count, color) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={styles.activityTitle}>{title}</Text>
        <Text style={styles.activityCount}>{count} times</Text>
      </View>
    </View>
  )

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Your Streak</Text>

      <View style={styles.streakContainer}>
        <View style={styles.streakHeader}>
          <View style={styles.streakCircle}>
            <Text style={styles.streakNumber}>{streakData.current}</Text>
            <Text style={styles.streakLabel}>days</Text>
          </View>
        </View>

        <Text style={styles.streakMessage}>{getStreakMessage(streakData.current)}</Text>

        <View style={styles.bestStreakContainer}>
          <Ionicons name="trophy" size={20} color="#FFD700" />
          <Text style={styles.bestStreakText}>
            Best streak: <Text style={styles.bestStreakNumber}>{streakData.best} days</Text>
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Activity Breakdown</Text>

      <View style={styles.activitiesContainer}>
        {renderActivityItem("leaf", "Meditation", streakData.activities.meditation, "#4CAF50")}
        {renderActivityItem("journal", "Journaling", streakData.activities.journaling, "#2196F3")}
        {renderActivityItem("footsteps", "Walking", streakData.activities.walking, "#FF9800")}
        {renderActivityItem("moon", "Sleep Tracking", streakData.activities.sleep, "#9C27B0")}
      </View>

      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Streak Tips</Text>

        <View style={styles.tipItem}>
          <Ionicons name="time" size={20} color="#4A90E2" style={styles.tipIcon} />
          <Text style={styles.tipText}>Complete at least one activity daily to maintain your streak</Text>
        </View>

        <View style={styles.tipItem}>
          <Ionicons name="notifications" size={20} color="#4A90E2" style={styles.tipIcon} />
          <Text style={styles.tipText}>Set up notifications to remind you to practice daily</Text>
        </View>

        <View style={styles.tipItem}>
          <Ionicons name="calendar" size={20} color="#4A90E2" style={styles.tipIcon} />
          <Text style={styles.tipText}>Try to practice at the same time each day to build a habit</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={loadStreakData}>
        <Ionicons name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.refreshButtonText}>Refresh Streak Data</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  streakContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  streakHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  streakCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  streakLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  streakMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  bestStreakContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  bestStreakText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  bestStreakNumber: {
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  activitiesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  activityCount: {
    fontSize: 14,
    color: "#666",
  },
  tipsContainer: {
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    lineHeight: 20,
  },
  refreshButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
})

export default StreakScreen

