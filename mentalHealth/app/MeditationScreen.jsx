"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native"
import { Audio } from "expo-av"
import { Ionicons } from "@expo/vector-icons"
import { router, useRouter } from "expo-router"
// import { ref, listAll, getDownloadURL } from "firebase/storage"
// import { storage } from "../App"

const meditationCategories = [
  { id: "mindfulness", title: "Mindfulness", description: "Focus on the present moment", icon: "🧠" },
  { id: "breathing", title: "Breathing", description: "Calm your mind with breath", icon: "🫁" },
  { id: "guided", title: "Guided", description: "Follow along with narration", icon: "🗣️" },
  { id: "sleep", title: "Sleep", description: "Drift into peaceful sleep", icon: "💤" },
]

const MeditationScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [meditations, setMeditations] = useState([])
  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentMeditation, setCurrentMeditation] = useState(null)
  const [duration, setDuration] = useState(0)
  const [position, setPosition] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync()
        }
      : undefined
  }, [sound])

  // const fetchMeditations = async (categoryId) => {
  //   setLoading(true)
  //   try {
  //     // In a real app, you would fetch from Firebase Storage based on category
  //     // This is a simplified example
  //     const meditationsRef = ref(storage, `meditations/${categoryId}`)
  //     const result = await listAll(meditationsRef)

  //     const meditationFiles = await Promise.all(
  //       result.items.map(async (itemRef) => {
  //         const url = await getDownloadURL(itemRef)
  //         return {
  //           id: itemRef.name,
  //           title: itemRef.name.replace(".mp3", "").replace(/_/g, " "),
  //           duration: "10:00", // In a real app, you'd get actual duration
  //           url: url,
  //         }
  //       }),
  //     )

  //     setMeditations(meditationFiles)
  //   } catch (error) {
  //     console.log("Error fetching meditations:", error)
  //     // Fallback to sample data for demo purposes
  //     setMeditations([
  //       { id: "1", title: "Morning Mindfulness", duration: "10:00", url: "https://example.com/sample.mp3" },
  //       { id: "2", title: "Breath Awareness", duration: "5:00", url: "https://example.com/sample2.mp3" },
  //       { id: "3", title: "Body Scan", duration: "15:00", url: "https://example.com/sample3.mp3" },
  //     ])
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    fetchMeditations(category.id)
  }

  const playSound = async (meditation) => {
    if (sound) {
      await sound.unloadAsync()
    }

    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: meditation.url },
        { shouldPlay: true },
        onPlaybackStatusUpdate,
      )

      setSound(newSound)
      setIsPlaying(true)
      setCurrentMeditation(meditation)
      await newSound.playAsync()
    } catch (error) {
      console.log("Error playing sound:", error)
    }
  }

  const goTo30Days = ()=>{
      router.push("/LearningProgramScreen")
  }

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0)
      setPosition(status.positionMillis || 0)
      setIsPlaying(status.isPlaying)
    }
  }

  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    }
  }

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000)
    const seconds = ((millis % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.categoryItem, selectedCategory?.id === item.id && styles.selectedCategoryItem]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={styles.categoryTitle}>{item.title}</Text>
      <Text style={styles.categoryDescription}>{item.description}</Text>
    </TouchableOpacity>
  )

  const renderMeditationItem = ({ item }) => (
    <TouchableOpacity style={styles.meditationItem} onPress={() => playSound(item)}>
      <View style={styles.meditationInfo}>
        <Text style={styles.meditationTitle}>{item.title}</Text>
        <Text style={styles.meditationDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} onPress={() => playSound(item)}>
        <Ionicons name="play" size={24} color="#4A90E2" />
      </TouchableOpacity>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Meditation</Text>

      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={meditationCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      />

      {selectedCategory ? (
        <>
          <Text style={styles.sectionTitle}>{selectedCategory.title} Meditations</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text>Loading meditations...</Text>
            </View>
          ) : (
            <FlatList
              data={meditations}
              renderItem={renderMeditationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.meditationsContainer}
            />
          )}
        </>
      ) : (
        <View style={styles.emptyStateContainer}>
          {/* <Image source={require("../assets/meditation.png")} style={styles.emptyStateImage} /> */}
          <Text style={styles.emptyStateText}>Select a category to explore meditations</Text>
        </View>
      )}

      {currentMeditation && (
        <View style={styles.playerContainer}>
          <View style={styles.playerInfo}>
            <Text style={styles.playerTitle}>{currentMeditation.title}</Text>
            <Text style={styles.playerTime}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity onPress={handlePlayPause}>
              <Ionicons name={isPlaying ? "pause-circle" : "play-circle"} size={50} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

      )}


         <TouchableOpacity style={styles.button} onPress={goTo30Days}>
          <Text style={styles.buttonText}>GO TO 30 Day Chalangs</Text>
        </TouchableOpacity>
    </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingBottom: 16,
  },
  categoryItem: {
    width: 140,
    height: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCategoryItem: {
    borderColor: "#4A90E2",
    borderWidth: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 12,
    color: "#666",
  },
  meditationsContainer: {
    paddingBottom: 100, // Space for player
  },
  meditationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  meditationInfo: {
    flex: 1,
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  meditationDuration: {
    fontSize: 14,
    color: "#666",
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F7FF",
    alignItems: "center",
    justifyContent: "center",
  },
  playerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  playerInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  playerTime: {
    fontSize: 14,
    color: "#666",
  },
  playerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyStateImage: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  button: {
    backgroundColor: "#4A90E2",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
})

export default MeditationScreen

