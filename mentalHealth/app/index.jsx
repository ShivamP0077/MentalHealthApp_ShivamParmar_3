"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useNavigation } from "@react-navigation/native"
import { StackActions } from '@react-navigation/native';
import { router, useRouter } from "expo-router"

const Index = () => {
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const navigation = useNavigation()

  const handleContinue = async () => {
    if (name.trim().length < 1) {
      setError("Please enter your name");
      return;
    }

    try {
      await AsyncStorage.setItem("userName", name);
      await AsyncStorage.setItem("hasLaunched", "true");

      // Navigate to Mood Selection instead of Main

      // navigation.dispatch(StackActions.replace("MoodSelection"));
      router.push("/HomeScreen")
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        {/* <Image
          source={require("../assets/welcome-image.png")}
          style={styles.image}
          defaultSource={require("../assets/welcome-image.png")}
        /> */}

        <Text style={styles.title}>Welcome to MindfulMe</Text>
        <Text style={styles.subtitle}>Your personal wellness companion</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>What should we call you?</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#A0A0A0"
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    width: "100%",
  },
  errorText: {
    color: "#E53935",
    marginTop: 8,
    fontSize: 14,
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

export default {Index , db}