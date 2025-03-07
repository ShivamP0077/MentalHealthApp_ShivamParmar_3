"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import AsyncStorage from "@react-native-async-storage/async-storage"
// import { collection, addDoc, serverTimestamp } from "firebase/firestore"
// import { db } from "../App"

const WalkingTrackerScreen = () => {
  const [isTracking, setIsTracking] = useState(false)
  const [hasPermission, setHasPermission] = useState(null)
  const [steps, setSteps] = useState(0)
  const [distance, setDistance] = useState(0)
  const [duration, setDuration] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [previousLocation, setPreviousLocation] = useState(null)

  const locationSubscription = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    requestLocationPermission()
    return () => {
      stopTracking()
    }
  }, [])

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    setHasPermission(status === "granted")

    if (status !== "granted") {
      Alert.alert("Permission Required", "Please grant location permissions to use the walking tracker.")
    }
  }

  const startTracking = async () => {
    if (!hasPermission) {
      await requestLocationPermission()
      if (!hasPermission) return
    }

    setIsTracking(true)
    setStartTime(new Date())
    setSteps(0)
    setDistance(0)
    setDuration(0)
    setPreviousLocation(null)

    // Start location tracking
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 1, // update every 1 meter
        timeInterval: 1000, // update every 1 second
      },
      (location) => {
        updateLocation(location)
      },
    )

    // Start timer
    timerRef.current = setInterval(() => {
      if (startTime) {
        const elapsed = Math.floor((new Date() - startTime) / 1000)
        setDuration(elapsed)
      }
    }, 1000)
  }

  const stopTracking = async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove()
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsTracking(false)

    if (distance > 0 || steps > 0) {
      try {
        const userName = await AsyncStorage.getItem("userName")

        await addDoc(collection(db, "walks"), {
          userId: userName,
          steps,
          distance: distance.toFixed(2),
          duration,
          timestamp: serverTimestamp(),
        })
      } catch (error) {
        console.log("Error saving walk data:", error)
      }
    }
  }

  const updateLocation = (location) => {
    if (previousLocation) {
      // Calculate distance between current and previous location
      const newDistance = calculateDistance(
        previousLocation.coords.latitude,
        previousLocation.coords.longitude,
        location.coords.latitude,
        location.coords.longitude,
      )

      // Update distance
      setDistance((prev) => prev + newDistance)

      // Estimate steps (roughly 1.3 steps per meter)
      const newSteps = Math.floor(newDistance * 1.3)
      setSteps((prev) => prev + newSteps)
    }

    setPreviousLocation(location)
  }

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    return distance / 1000 // Convert to kilometers
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.screenTitle}>Walking Tracker</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="footsteps" size={32} color="#4A90E2" />
          <Text style={styles.statValue}>{steps}</Text>
          <Text style={styles.statLabel}>Steps</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="map" size={32} color="#4A90E2" />
          <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Kilometers</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="time" size={32} color="#4A90E2" />
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Walking Benefits</Text>
        <View style={styles.benefitItem}>
          <Ionicons name="heart" size={24} color="#E53935" style={styles.benefitIcon} />
          <View>
            <Text style={styles.benefitTitle}>Reduces Stress</Text>
            <Text style={styles.benefitDescription}>Walking helps reduce stress hormones and increases endorphins</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="fitness" size={24} color="#43A047" style={styles.benefitIcon} />
          <View>
            <Text style={styles.benefitTitle}>Improves Mood</Text>
            <Text style={styles.benefitDescription}>
              Regular walking can help alleviate symptoms of anxiety and depression
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="brain" size={24} color="#7B1FA2" style={styles.benefitIcon} />
          <View>
            <Text style={styles.benefitTitle}>Boosts Creativity</Text>
            <Text style={styles.benefitDescription}>
              Walking increases creative thinking and problem-solving abilities
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.trackButton, isTracking ? styles.stopButton : styles.startButton]}
        onPress={isTracking ? stopTracking : startTracking}
      >
        <Text style={styles.trackButtonText}>{isTracking ? "Stop Walking" : "Start Walking"}</Text>
        <Ionicons name={isTracking ? "stop-circle" : "play-circle"} size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {!hasPermission && (
        <Text style={styles.permissionText}>Location permission is required to track your walking activity</Text>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  benefitIcon: {
    marginRight: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: "#4A90E2",
  },
  stopButton: {
    backgroundColor: "#E53935",
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
  },
  permissionText: {
    textAlign: "center",
    color: "#E53935",
    marginBottom: 24,
  },
})

export default WalkingTrackerScreen

