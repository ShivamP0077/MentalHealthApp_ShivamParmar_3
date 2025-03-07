"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
// // import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from "firebase/firestore"
// import { db } from "../App"

const JournalScreen = () => {
  const [journals, setJournals] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [journalEntry, setJournalEntry] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchJournals()
  }, [])

  const fetchJournals = async () => {
    setLoading(true)
    try {
      const userName = await AsyncStorage.getItem("userName")
      // const journalsRef = collection(db, "journals")
      // const q = query(journalsRef, where("userId", "==", userName), orderBy("timestamp", "desc"))

      // const querySnapshot = await getDocs(q)
      // const journalList = []

      // querySnapshot.forEach((doc) => {
      //   journalList.push({
      //     id: doc.id,
      //     ...doc.data(),
      //     date: doc.data().timestamp?.toDate() || new Date(),
      //   })
      // })

      // setJournals(journalList)
    } catch (error) {
      console.log("Error fetching journals:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveJournal = async () => {
    if (!journalTitle.trim() || !journalEntry.trim()) {
      return
    }

    try {
      const userName = await AsyncStorage.getItem("userName")

      await addDoc(collection(db, "journals"), {
        userId: userName,
        title: journalTitle,
        content: journalEntry,
        timestamp: serverTimestamp(),
      })

      setJournalTitle("")
      setJournalEntry("")
      setModalVisible(false)
      fetchJournals()
    } catch (error) {
      console.log("Error saving journal:", error)
    }
  }

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return date.toLocaleDateString(undefined, options)
  }

  const renderJournalItem = ({ item }) => (
    <TouchableOpacity style={styles.journalItem}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        <Text style={styles.journalDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.journalContent} numberOfLines={3}>
        {item.content}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Journal</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading journals...</Text>
        </View>
      ) : journals.length > 0 ? (
        <FlatList
          data={journals}
          renderItem={renderJournalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.journalList}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>Start journaling to track your thoughts and feelings</Text>
        </View>
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Journal Entry</Text>

            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              value={journalTitle}
              onChangeText={setJournalTitle}
            />

            <TextInput
              style={styles.journalInput}
              placeholder="What's on your mind today?"
              multiline
              value={journalEntry}
              onChangeText={setJournalEntry}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveJournal}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  journalList: {
    paddingBottom: 80,
  },
  journalItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  journalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  journalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  journalDate: {
    fontSize: 12,
    color: "#666",
  },
  journalContent: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4A90E2",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  titleInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  journalInput: {
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 200,
    textAlignVertical: "top",
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#4A90E2",
    marginLeft: 8,
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
})

export default JournalScreen

