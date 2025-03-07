  "use client"

  import { useState, useEffect } from "react"
  import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, ActivityIndicator } from "react-native"
  import { Ionicons } from "@expo/vector-icons"
  import AsyncStorage from "@react-native-async-storage/async-storage"
  // import {
  //   collection,
  //   addDoc,
  //   query,
  //   orderBy,
  //   getDocs,
  //   doc,
  //   updateDoc,
  //   arrayUnion,
  //   serverTimestamp,
  // } from "firebase/firestore"
  // import { db } from "../App"

  const ForumScreen = () => {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [postTitle, setPostTitle] = useState("")
    const [postContent, setPostContent] = useState("")
    const [selectedPost, setSelectedPost] = useState(null)
    const [commentModalVisible, setCommentModalVisible] = useState(false)
    const [commentText, setCommentText] = useState("")
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
      // fetchPosts()
    }, [])

    // const fetchPosts = async () => {
    //   setLoading(true)
    //   try {
    //     const postsRef = collection(db, "forumPosts")
    //     const q = query(postsRef, orderBy("timestamp", "desc"))
    //     const querySnapshot = await getDocs(q)

    //     const postList = []
    //     querySnapshot.forEach((doc) => {
    //       postList.push({
    //         id: doc.id,
    //         ...doc.data(),
    //         timestamp: doc.data().timestamp?.toDate() || new Date(),
    //       })
    //     })

    //     setPosts(postList)
    //   } catch (error) {
    //     console.log("Error fetching posts:", error)
    //   } finally {
    //     setLoading(false)
    //     setRefreshing(false)
    //   }
    // }

    const handleRefresh = () => {
      setRefreshing(true)
      // fetchPosts()
    }

    const createPost = async () => {
      if (!postTitle.trim() || !postContent.trim()) {
        return
      }

      try {
        const userName = await AsyncStorage.getItem("userName")

        await addDoc(collection(db, "forumPosts"), {
          title: postTitle,
          content: postContent,
          author: userName,
          anonymous: true, // All posts are anonymous as per requirements
          likes: 0,
          comments: [],
          timestamp: serverTimestamp(),
        })

        setPostTitle("")
        setPostContent("")
        setModalVisible(false)
        // fetchPosts()
      } catch (error) {
        console.log("Error creating post:", error)
      }
    }

    const addComment = async () => {
      if (!commentText.trim() || !selectedPost) {
        return
      }

      try {
        const userName = await AsyncStorage.getItem("userName")
        const postRef = doc(db, "forumPosts", selectedPost.id)

        const comment = {
          text: commentText,
          author: userName,
          timestamp: new Date(),
        }

        await updateDoc(postRef, {
          comments: arrayUnion(comment),
        })

        // Update local state
        const updatedPosts = posts.map((post) => {
          if (post.id === selectedPost.id) {
            return {
              ...post,
              comments: [...(post.comments || []), comment],
            }
          }
          return post
        })

        setPosts(updatedPosts)
        setCommentText("")
        setCommentModalVisible(false)
      } catch (error) {
        console.log("Error adding comment:", error)
      }
    }

    const likePost = async (post) => {
      try {
        const postRef = doc(db, "forumPosts", post.id)
        await updateDoc(postRef, {
          likes: post.likes + 1,
        })

        // Update local state
        const updatedPosts = posts.map((p) => {
          if (p.id === post.id) {
            return { ...p, likes: p.likes + 1 }
          }
          return p
        })

        setPosts(updatedPosts)
      } catch (error) {
        console.log("Error liking post:", error)
      }
    }

    const openCommentModal = (post) => {
      setSelectedPost(post)
      setCommentModalVisible(true)
    }

    const formatDate = (date) => {
      const now = new Date()
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

      if (diffInHours < 1) {
        return "Just now"
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
      } else {
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) {
          return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
        } else {
          const options = { year: "numeric", month: "short", day: "numeric" }
          return date.toLocaleDateString(undefined, options)
        }
      }
    }

    const renderPost = ({ item }) => (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={styles.postAuthor}>Anonymous</Text>
          <Text style={styles.postTime}>{formatDate(item.timestamp)}</Text>
        </View>

        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.postContent}>{item.content}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => likePost(item)}>
            <Ionicons name="heart-outline" size={20} color="#4A90E2" />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => openCommentModal(item)}>
            <Ionicons name="chatbubble-outline" size={20} color="#4A90E2" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>
        </View>

        {item.comments && item.comments.length > 0 && (
          <View style={styles.commentsContainer}>
            <Text style={styles.commentsTitle}>Comments</Text>

            {item.comments.slice(0, 2).map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{comment.author}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            ))}

            {item.comments.length > 2 && (
              <TouchableOpacity onPress={() => openCommentModal(item)}>
                <Text style={styles.viewMoreComments}>View all {item.comments.length} comments</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    )

    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Community Forum</Text>

        <Text style={styles.screenDescription}>
          Share your experiences and connect with others. All posts are anonymous.
        </Text>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.postsList}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            ListEmptyComponent={
              <View style={styles.emptyStateContainer}>
                <Text style={styles.emptyStateText}>No posts yet. Be the first to share your experience!</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Create Post Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create a Post</Text>

              <TextInput
                style={styles.titleInput}
                placeholder="Title"
                value={postTitle}
                onChangeText={setPostTitle}
                maxLength={100}
              />

              <TextInput
                style={styles.contentInput}
                placeholder="Share your thoughts..."
                multiline
                value={postContent}
                onChangeText={setPostContent}
              />

              <Text style={styles.anonymousNote}>Your post will be shared anonymously</Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.modalButton, styles.postButton]} onPress={createPost}>
                  <Text style={styles.postButtonText}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Comments Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={commentModalVisible}
          onRequestClose={() => setCommentModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedPost && (
                <>
                  <View style={styles.commentModalHeader}>
                    <Text style={styles.commentModalTitle}>Comments</Text>
                    <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                      <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.postPreview}>
                    <Text style={styles.postPreviewTitle}>{selectedPost.title}</Text>
                    <Text style={styles.postPreviewContent} numberOfLines={2}>
                      {selectedPost.content}
                    </Text>
                  </View>

                  <FlatList
                    data={selectedPost.comments || []}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.commentsList}
                    renderItem={({ item }) => (
                      <View style={styles.commentItemFull}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{item.author}</Text>
                          <Text style={styles.commentTime}>{item.timestamp && formatDate(new Date(item.timestamp))}</Text>
                        </View>
                        <Text style={styles.commentText}>{item.text}</Text>
                      </View>
                    )}
                    ListEmptyComponent={
                      <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
                    }
                  />

                  <View style={styles.addCommentContainer}>
                    <TextInput
                      style={styles.commentInput}
                      placeholder="Add a comment..."
                      value={commentText}
                      onChangeText={setCommentText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={addComment}>
                      <Ionicons name="send" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
      paddingHorizontal: 20,
    },
    screenTitle: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#333",
      marginBottom: 8,
    },
    screenDescription: {
      fontSize: 16,
      color: "#666",
      marginBottom: 24,
    },
    postsList: {
      paddingBottom: 80,
    },
    postCard: {
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
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    postAuthor: {
      fontSize: 14,
      fontWeight: "600",
      color: "#4A90E2",
    },
    postTime: {
      fontSize: 12,
      color: "#999",
    },
    postTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#333",
      marginBottom: 8,
    },
    postContent: {
      fontSize: 16,
      color: "#666",
      lineHeight: 22,
      marginBottom: 16,
    },
    postActions: {
      flexDirection: "row",
      borderTopWidth: 1,
      borderTopColor: "#F0F0F0",
      paddingTop: 12,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 24,
    },
    actionText: {
      fontSize: 14,
      color: "#666",
      marginLeft: 4,
    },
    commentsContainer: {
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: "#F0F0F0",
    },
    commentsTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 12,
    },
    commentItem: {
      marginBottom: 12,
    },
    commentAuthor: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
    },
    commentText: {
      fontSize: 14,
      color: "#666",
      lineHeight: 20,
    },
    viewMoreComments: {
      fontSize: 14,
      color: "#4A90E2",
      marginTop: 8,
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
    modalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#333",
      marginBottom: 24,
      textAlign: "center",
    },
    titleInput: {
      backgroundColor: "#F0F0F0",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 16,
    },
    contentInput: {
      backgroundColor: "#F0F0F0",
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      height: 150,
      textAlignVertical: "top",
      marginBottom: 16,
    },
    anonymousNote: {
      fontSize: 14,
      color: "#999",
      fontStyle: "italic",
      marginBottom: 24,
      textAlign: "center",
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
    postButton: {
      backgroundColor: "#4A90E2",
      marginLeft: 8,
    },
    cancelButtonText: {
      color: "#333",
      fontWeight: "600",
    },
    postButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
    },
    commentModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    commentModalTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: "#333",
    },
    postPreview: {
      backgroundColor: "#F8F9FA",
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    postPreviewTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#333",
      marginBottom: 4,
    },
    postPreviewContent: {
      fontSize: 14,
      color: "#666",
    },
    commentsList: {
      maxHeight: 300,
      marginBottom: 16,
    },
    commentItemFull: {
      backgroundColor: "#F8F9FA",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
    },
    commentHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    commentTime: {
      fontSize: 12,
      color: "#999",
    },
    noCommentsText: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
      padding: 16,
    },
    addCommentContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    commentInput: {
      flex: 1,
      backgroundColor: "#F0F0F0",
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      marginRight: 8,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#4A90E2",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyStateContainer: {
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyStateText: {
      fontSize: 16,
      color: "#666",
      textAlign: "center",
    },
  })

  export default ForumScreen

