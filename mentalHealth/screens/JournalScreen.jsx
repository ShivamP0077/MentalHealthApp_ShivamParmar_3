import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

const JournalScreen = () => {
  const [journals, setJournals] = useState([
    { id: "1", title: "First Entry", content: "This is my first journal entry.", date: new Date() },
    { id: "2", title: "Second Entry", content: "Another day, another thought.", date: new Date() },
  ])
  const [modalVisible, setModalVisible] = useState(false)
  const [journalEntry, setJournalEntry] = useState("")
  const [journalTitle, setJournalTitle] = useState("")

  const saveJournal = async () => {
    if (!journalTitle.trim() || !journalEntry.trim()) return

    const newJournal = {
      id: Date.now().toString(),
      title: journalTitle,
      content: journalEntry,
      date: new Date(),
    }

    setJournals([newJournal, ...journals])
    setJournalTitle("")
    setJournalEntry("")
    setModalVisible(false)
  }

  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
  }

  const renderJournalItem = ({ item }) => (
    <TouchableOpacity style={styles.journalItem}>
      <View style={styles.journalHeader}>
        <Text style={styles.journalTitle}>{item.title}</Text>
        <Text style={styles.journalDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.journalContent} numberOfLines={3}>{item.content}</Text>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Journal</Text>

      <FlatList data={journals} renderItem={renderJournalItem} keyExtractor={(item) => item.id} contentContainerStyle={styles.journalList} />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Journal Entry</Text>
            <TextInput style={styles.titleInput} placeholder="Title" value={journalTitle} onChangeText={setJournalTitle} />
            <TextInput style={styles.journalInput} placeholder="What's on your mind today?" multiline value={journalEntry} onChangeText={setJournalEntry} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
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
  container: { flex: 1, backgroundColor: "#F8F9FA", paddingTop: 60, paddingHorizontal: 24 },
  screenTitle: { fontSize: 28, fontWeight: "bold", color: "#333", marginBottom: 24 },
  journalList: { paddingBottom: 80 },
  journalItem: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  journalHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  journalTitle: { fontSize: 18, fontWeight: "600", color: "#333" },
  journalDate: { fontSize: 12, color: "#666" },
  journalContent: { fontSize: 14, color: "#666", lineHeight: 20 },
  addButton: { position: "absolute", bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: "#4A90E2", alignItems: "center", justifyContent: "center", elevation: 5 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" },
  modalContent: { width: "90%", backgroundColor: "#FFFFFF", borderRadius: 16, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: "600", textAlign: "center", marginBottom: 16 },
  titleInput: { backgroundColor: "#F0F0F0", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 16 },
  journalInput: { backgroundColor: "#F0F0F0", borderRadius: 8, padding: 12, height: 200, textAlignVertical: "top", marginBottom: 16 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between" },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  cancelButton: { backgroundColor: "#F0F0F0", marginRight: 8 },
  saveButton: { backgroundColor: "#4A90E2", marginLeft: 8 },
  cancelButtonText: { color: "#333", fontWeight: "600" },
  saveButtonText: { color: "#FFFFFF", fontWeight: "600" },
})

export default JournalScreen
