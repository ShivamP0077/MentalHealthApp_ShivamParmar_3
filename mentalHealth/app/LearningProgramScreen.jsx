"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
// import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
// import { db } from "../App"

// Sample data for the 30-day program
const programData = [
  {
    day: 1,
    title: "Introduction to Mindfulness",
    content:
      "Mindfulness is the practice of being fully present and engaged in the moment, aware of your thoughts and feelings without distraction or judgment. Today, we'll explore the basics of mindfulness and how it can improve your mental well-being.",
    exercise:
      "Find a quiet place and sit comfortably. Focus on your breath for 5 minutes. When your mind wanders, gently bring your attention back to your breath.",
  },
  {
    day: 2,
    title: "Understanding Stress",
    content:
      "Stress is your body's response to pressure. Learning to recognize stress triggers and symptoms is the first step in managing it effectively.",
    exercise:
      "Write down three situations that caused you stress recently. For each one, note how your body felt and what thoughts you had.",
  },
  {
    day: 3,
    title: "The Power of Deep Breathing",
    content:
      "Deep breathing activates your parasympathetic nervous system, which helps reduce stress and anxiety. It's a simple yet powerful tool for mental wellness.",
    exercise:
      "Practice 4-7-8 breathing: Inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Repeat 5 times.",
  },
  {
    day: 4,
    title: "Mindful Eating",
    content:
      "Mindful eating involves paying full attention to the experience of eating and drinking. It can help improve your relationship with food and increase enjoyment.",
    exercise:
      "For one meal today, eat without distractions. Notice the colors, smells, textures, and flavors of your food.",
  },
  {
    day: 5,
    title: "Body Scan Meditation",
    content:
      "A body scan meditation involves paying attention to parts of your body and bodily sensations in a gradual sequence, usually from feet to head.",
    exercise:
      "Lie down comfortably and spend 10 minutes scanning your body from toes to head, noticing any sensations without judgment.",
  },
  // Additional days would be added here
]

// Fill in the remaining days
for (let i = 6; i <= 30; i++) {
  programData.push({
    day: i,
    title: `Day ${i} of Your Wellness Journey`,
    content:
      "Content for this day will be revealed when you reach it. Continue your daily practice to unlock more insights and exercises.",
    exercise: "Continue practicing the techniques you've learned so far.",
  })
}

const LearningProgramScreen = () => {
  const [currentDay, setCurrentDay] = useState(1)
  const [lastCompletedDay, setLastCompletedDay] = useState(0)
  const [selectedDay, setSelectedDay] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [])

  const loadProgress = async () => {
    setLoading(true)
    try {
      const userName = await AsyncStorage.getItem("userName")
      const progressRef = doc(db, "learningProgress", userName)
      const progressDoc = await getDoc(progressRef)

      if (progressDoc.exists()) {
        const data = progressDoc.data()
        setLastCompletedDay(data.lastCompletedDay || 0)

        // Calculate current day based on start date
        if (data.startDate) {
          const startDate = data.startDate.toDate()
          const today = new Date()
          const diffTime = Math.abs(today - startDate)
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          setCurrentDay(Math.min(diffDays, 30))
        }
      } else {
        // First time user, create progress document
        await setDoc(progressRef, {
          startDate: serverTimestamp(),
          lastCompletedDay: 0,
        })
        setCurrentDay(1)
      }
    } catch (error) {
      console.log("Error loading progress:", error)
    } finally {
      setLoading(false)
    }
  }

  const markDayAsCompleted = async (day) => {
    if (day <= lastCompletedDay) return

    try {
      const userName = await AsyncStorage.getItem("userName")
      const progressRef = doc(db, "learningProgress", userName)

      await setDoc(
        progressRef,
        {
          lastCompletedDay: day,
        },
        { merge: true },
      )

      setLastCompletedDay(day)
    } catch (error) {
      console.log("Error updating progress:", error)
    }
  }

  const openDayDetails = (day) => {
    if (day > currentDay) return // Can't view future days

    setSelectedDay(programData[day - 1])
    setModalVisible(true)
  }

  const renderDayItem = (day) => {
    const isCompleted = day <= lastCompletedDay
    const isUnlocked = day <= currentDay
    const isToday = day === currentDay

    return (
      <TouchableOpacity
        key={day}
        style={[
          styles.dayItem,
          isCompleted && styles.completedDay,
          isToday && styles.todayDay,
          !isUnlocked && styles.lockedDay,
        ]}
        onPress={() => isUnlocked && openDayDetails(day)}
        disabled={!isUnlocked}
      >
        <Text
          style={[
            styles.dayNumber,
            isCompleted && styles.completedDayText,
            isToday && styles.todayDayText,
            !isUnlocked && styles.lockedDayText,
          ]}
        >
          {day}
        </Text>

        {isCompleted && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
          </View>
        )}

        {!isUnlocked && (
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={14} color="#999" />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>30-Day Wellness Program</Text>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>{lastCompletedDay}/30 days completed</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(lastCompletedDay / 30) * 100}%` }]} />
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading your progress...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Your Journey</Text>

          <View style={styles.daysContainer}>{Array.from({ length: 30 }, (_, i) => renderDayItem(i + 1))}</View>

          <View style={styles.todayContainer}>
            <Text style={styles.sectionTitle}>Today's Focus</Text>

            <View style={styles.todayCard}>
              <Text style={styles.todayTitle}>
                Day {currentDay}: {programData[currentDay - 1].title}
              </Text>

              <TouchableOpacity style={styles.startButton} onPress={() => openDayDetails(currentDay)}>
                <Text style={styles.startButtonText}>
                  {lastCompletedDay >= currentDay ? "Review" : "Start"} Today's Lesson
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedDay && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Day {selectedDay.day}: {selectedDay.title}
                  </Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollView}>
                  <Text style={styles.contentTitle}>Today's Lesson</Text>
                  <Text style={styles.contentText}>{selectedDay.content}</Text>

                  <Text style={styles.contentTitle}>Practice Exercise</Text>
                  <View style={styles.exerciseContainer}>
                    <Ionicons name="fitness" size={24} color="#4A90E2" style={styles.exerciseIcon} />
                    <Text style={styles.exerciseText}>{selectedDay.exercise}</Text>
                  </View>

                  {/* <Image source={require("../assets/meditation.png")} style={styles.lessonImage} resizeMode="contain" /> */}

                  <Text style={styles.tipTitle}>Wellness Tip</Text>
                  <Text style={styles.tipText}>
                    Consistency is key to building a mindfulness practice. Even just a few minutes each day can make a
                    significant difference in your mental well-being.
                  </Text>
                </ScrollView>

                {selectedDay.day <= currentDay && selectedDay.day > lastCompletedDay && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => {
                      markDayAsCompleted(selectedDay.day)
                      setModalVisible(false)
                    }}
                  >
                    <Text style={styles.completeButtonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E0E0E0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4A90E2",
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  dayItem: {
    width: "18%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    position: "relative",
  },
  completedDay: {
    backgroundColor: "#4A90E2",
  },
  todayDay: {
    borderColor: "#4A90E2",
    borderWidth: 2,
  },
  lockedDay: {
    backgroundColor: "#F0F0F0",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  completedDayText: {
    color: "#FFFFFF",
  },
  todayDayText: {
    color: "#4A90E2",
  },
  lockedDayText: {
    color: "#999",
  },
  checkmark: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  lockIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  todayContainer: {
    marginBottom: 32,
  },
  todayCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 16,
  },
  modalScrollView: {
    marginBottom: 16,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    marginTop: 16,
  },
  contentText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    marginBottom: 16,
  },
  exerciseContainer: {
    backgroundColor: "#F0F7FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  exerciseIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  exerciseText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    flex: 1,
  },
  lessonImage: {
    width: "100%",
    height: 200,
    marginBottom: 24,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    fontStyle: "italic",
    marginBottom: 16,
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
})

export default LearningProgramScreen

