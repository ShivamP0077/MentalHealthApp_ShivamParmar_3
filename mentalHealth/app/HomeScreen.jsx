"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
// import { collection, addDoc, serverTimestamp } from "firebase/firestore"
// import { db } from "../App"

const moods = [
    { id: "happy", label: "Happy", emoji: "😊", color: "#4CAF50" },
    { id: "calm", label: "Calm", emoji: "😌", color: "#2196F3" },
    { id: "stressed", label: "Stressed", emoji: "😓", color: "#FF9800" },
    { id: "anxious", label: "Anxious", emoji: "😰", color: "#F44336" },
    { id: "sad", label: "Sad", emoji: "😢", color: "#9C27B0" },
    { id: "tired", label: "Tired", emoji: "😴", color: "#795548" },
]

const activities = {
    happy: [
        {
            id: "gratitude",
            title: "Practice Gratitude",
            description: "Write down three things you're grateful for",
            icon: "🙏",
        },
        { id: "share", title: "Share Your Joy", description: "Call a friend or family member", icon: "📞" },
    ],
    calm: [
        { id: "deepBreathing", title: "Deep Breathing", description: "5 minutes of deep breathing exercises", icon: "🧘‍♀️" },
        { id: "reading", title: "Mindful Reading", description: "Read a book for 15 minutes", icon: "📚" },
    ],
    stressed: [
        { id: "meditation", title: "Guided Meditation", description: "10-minute stress relief meditation", icon: "🧘‍♂️" },
        { id: "walking", title: "Take a Walk", description: "15-minute walk outside", icon: "🚶‍♀️" },
    ],
    anxious: [
        { id: "grounding", title: "5-4-3-2-1 Grounding", description: "Use your senses to ground yourself", icon: "👐" },
        { id: "journaling", title: "Journal Your Thoughts", description: "Write down what's on your mind", icon: "✏️" },
    ],
    sad: [
        { id: "selfCare", title: "Self-Care Activity", description: "Do something kind for yourself", icon: "💝" },
        { id: "music", title: "Listen to Music", description: "Play your favorite uplifting songs", icon: "🎵" },
    ],
    tired: [
        { id: "powerNap", title: "Power Nap", description: "20-minute refreshing nap", icon: "💤" },
        { id: "stretch", title: "Gentle Stretching", description: "5 minutes of energizing stretches", icon: "🤸‍♀️" },
    ],
}

const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState("");
    const [selectedMood, setSelectedMood] = useState(null);
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        const loadUserName = async () => {
            try {
                const name = await AsyncStorage.getItem("userName");
                if (name) {
                    setUserName(name);
                    generateGreeting(name);
                }
            } catch (error) {
                console.log("Error loading username:", error);
            }
        };

        loadUserName();
    }, []);

    const generateGreeting = (name) => {
        const hours = new Date().getHours();
        let greetingText = "";

        if (hours < 12) {
            greetingText = `Good Morning, ${name}! 🌞`;
        } else if (hours < 18) {
            greetingText = `Good Afternoon, ${name}! 🌤️`;
        } else {
            greetingText = `Good Evening, ${name}! 🌙`;
        }

        setGreeting(greetingText);
    };

    const handleMoodSelection = async (mood) => {
        setSelectedMood(mood);

        try {
            await AsyncStorage.setItem("selectedMood", JSON.stringify(mood));

            // Navigate to Main (TabNavigator) after mood selection
            navigation.replace("Main");
        } catch (error) {
            console.log("Error saving mood:", error);
        }
    };




    const navigateToActivity = (activityId) => {
        if (activityId === "meditation") {
            navigation.navigate("Meditation")
        } else if (activityId === "journaling") {
            navigation.navigate("Journal")
        } else if (activityId === "walking") {
            navigation.navigate("Walking")
        }
        // Other activities would have their own navigation or modal
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.userName}>{userName}</Text>

                <Text style={styles.question}>How are you feeling today?</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodContainer}>
                {moods.map((mood) => (
                    <TouchableOpacity
                        key={mood.id}
                        style={[styles.moodItem, selectedMood?.id === mood.id && { borderColor: mood.color, borderWidth: 3 }]}
                        onPress={() => handleMoodSelection(mood)}
                    >
                        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                        <Text style={styles.moodLabel}>{mood.label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {selectedMood && (
                <View style={styles.suggestedActivities}>
                    <Text style={styles.sectionTitle}>Suggested for you</Text>

                    {activities[selectedMood.id].map((activity) => (
                        <TouchableOpacity
                            key={activity.id}
                            style={styles.activityCard}
                            onPress={() => navigateToActivity(activity.id)}
                        >
                            <View style={styles.activityIconContainer}>
                                <Text style={styles.activityIcon}>{activity.icon}</Text>
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityDescription}>{activity.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {!selectedMood && (
                <View style={styles.emptyStateContainer}>
                    {/* <Image source={require("../assets/select-mood.png")} style={styles.emptyStateImage} /> */}
                    <Text style={styles.emptyStateText}>Select your mood to get personalized suggestions</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8F9FA",
        paddingTop: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 24,
    },
    greeting: {
        fontSize: 18,
        color: "#666",
    },
    userName: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 24,
    },
    question: {
        fontSize: 18,
        fontWeight: "500",
        color: "#333",
    },
    moodContainer: {
        paddingHorizontal: 10,
        paddingVertical: 0,
    },
    moodItem: {
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 8,
        width: 80,
        height: 80,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: 4,
    },
    moodLabel: {
        fontSize: 12,
        color: "#333",
    },
    suggestedActivities: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
        marginTop: -100,

    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
    },
    activityCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activityIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: "#F0F7FF",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 16,
    },
    activityIcon: {
        fontSize: 24,
    },
    activityInfo: {
        flex: 1,
        justifyContent: "center",
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 14,
        color: "#666",
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
})

export default HomeScreen

