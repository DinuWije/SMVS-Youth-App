import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Platform, Modal } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import SettingsAPIClient, { SettingsUserInfoResponse } from '@/APIClients/SettingsAPIClient';
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient, { Article, Content } from "@/APIClients/ArticleAPIClient";
import EntityAPIClient from "@/APIClients/EntityAPIClient";
import QuizAPIClient from "@/APIClients/QuizAPIClient";

// Web confirmation dialog component
const WebConfirmationDialog = ({ 
  visible, 
  title, 
  message, 
  onCancel, 
  onConfirm 
}: {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) => {
  if (!visible) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
    >
      <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <View className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
          <Text className="text-xl font-bold mb-2">{title}</Text>
          <Text className="text-gray-700 mb-4">{message}</Text>
          <View className="flex-row justify-end space-x-2">
            <TouchableOpacity 
              className="bg-gray-200 px-4 py-2 rounded"
              onPress={onCancel}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-purple-600 px-4 py-2 rounded"
              onPress={onConfirm}
            >
              <Text className="text-white">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ArticleComponent = ({ articleId }: { articleId: string }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [completionScore, setCompletionScore] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<SettingsUserInfoResponse | null>(null);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [completionId, setCompletionId] = useState<number | null>(null);
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const router = useRouter();

  // Fetch user data first
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await SettingsAPIClient.get();
        if (user && user.length > 0) {
          setUserInfo(user[0]);
        } else {
          console.warn('User info not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setUserInfoLoaded(true);
      }
    };

    fetchUserData();
  }, []);

  // Fetch article and check quiz completion after user info is loaded
  useEffect(() => {
    // Don't proceed until user info is loaded (even if it's null)
    if (!userInfoLoaded) return;

    const fetchArticle = async () => {
      try {
        const fetchedArticle = await ArticleAPIClient.getById(Number(articleId));
        if (!fetchedArticle) {
          setLoading(false);
          return;
        }
  
        // Fetch the cover image URL
        const coverFileUrl = await EntityAPIClient.getFile(fetchedArticle.coverImage);
        fetchedArticle.coverImage = coverFileUrl || "";
  
        // Fetch all content images in parallel
        const updatedContents = await Promise.all(
          fetchedArticle.contents.map(async (content) => {
            if (content.contentType === "image") {
              const fileUrl = await EntityAPIClient.getFile(content.contentData);
              return { ...content, contentData: fileUrl || "" };
            }
            return content;
          })
        );
  
        fetchedArticle.contents = updatedContents;
        setArticle(fetchedArticle);

        // Check if article has a quiz
        try {
          const quizExists = await QuizAPIClient.checkQuizExists(Number(articleId));
          console.log("Quiz exists:", quizExists);
          setHasQuiz(quizExists);
          
          // Get the quiz ID to use in retake functionality
          if (quizExists) {
            const quiz = await QuizAPIClient.getByArticleId(Number(articleId));
            if (quiz) {
              setQuizId(quiz.id);
            }
          }
          
          // If user is logged in and the article has a quiz, check if they've completed it
          if (quizExists && userInfo && userInfo.id) {
            console.log("Checking completion for user:", userInfo.id);
            try {
              const completionStatus = await QuizAPIClient.checkCompletion(
                Number(userInfo.id),
                Number(articleId)
              );
              
              console.log("Completion status:", JSON.stringify(completionStatus));
              
              // Safely handle the completion status
              if (completionStatus && typeof completionStatus === 'object') {
                setQuizCompleted(!!completionStatus.completed);
                
                if (completionStatus.completed && 
                    completionStatus.completion && 
                    typeof completionStatus.completion === 'object') {
                  if ('score' in completionStatus.completion) {
                    setCompletionScore(completionStatus.completion.score);
                  }
                  if ('id' in completionStatus.completion) {
                    setCompletionId(completionStatus.completion.id);
                  }
                }
              }
            } catch (completionError) {
              console.error("Error checking quiz completion:", completionError);
            }
          }
        } catch (error) {
          console.error("Error checking quiz existence:", error);
          setHasQuiz(false);
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticle();
  }, [articleId, userInfo, userInfoLoaded]);
  
  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      // If there's no screen to go back to, navigate to a default screen
      router.push('/Articles'); 
    }
  };

  const navigateToQuiz = () => {
    router.push(`/quiz/${articleId}`);
  };
  
  const confirmRetakeQuiz = async () => {
    try {
      if (!completionId) return;
      
      // Delete previous completion
      const deleted = await QuizAPIClient.deleteCompletion(completionId);
      if (deleted) {
        // Reset completion state
        setQuizCompleted(false);
        setCompletionScore(null);
        setCompletionId(null);
        
        // Navigate to quiz
        navigateToQuiz();
      } else {
        if (Platform.OS === 'web') {
          console.error("Failed to reset quiz progress. Please try again.");
          alert("Failed to reset quiz progress. Please try again.");
        } else {
          Alert.alert("Error", "Failed to reset quiz progress. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error resetting quiz:", error);
      if (Platform.OS === 'web') {
        alert("Something went wrong. Please try again later.");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again later.");
      }
    }
  };
  
  const handleRetakeQuiz = () => {
    if (!userInfo || !quizId || !completionId) return;
    
    if (Platform.OS === 'web') {
      setConfirmDialogVisible(true);
    } else {
      // Show confirmation dialog for mobile
      Alert.alert(
        "Retake Quiz",
        "Your previous score will be replaced with your new attempt. Continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Continue",
            onPress: confirmRetakeQuiz
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8A56AC" />
      </View>
    );
  }

  if (!article) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-semibold">Article not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 mb-16">
        {/* Cover Image */}
        <View className="relative">
          <Image
            source={{ uri: article.coverImage["fileUrl"] || "https://via.placeholder.com/600" }}
            className="w-full h-64"
          />
          <View className="absolute top-12 left-4">
            <Ionicons
              name="arrow-back-circle"
              size={36}
              color="white"
              onPress={handleGoBack}
            />
          </View>
          <View className="absolute top-12 right-4 flex-row space-x-4">
            <Ionicons name="share-outline" size={28} color="white" />
          </View>
        </View>

        {/* Article Info */}
        <View className="p-6">
          <Text className="text-3xl font-bold">{article.title}</Text>
          <Text className="text-gray-500 mt-1 text-lg">{article.subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={14} color="gold" />
            <Text className="ml-1 text-gray-600">{article.rating}</Text>
            <Text className="ml-2 text-gray-600">{article.numberOfRatings} Ratings</Text>
            <Ionicons name="time-outline" size={14} color="gray" className="ml-3" />
            <Text className="ml-1 text-gray-600">{article.timeToRead} Mins</Text>
          </View>
        </View>

        {/* Article Contents */}
        <View className="px-6 pb-10">
          {article.contents
            .sort((a, b) => a.position - b.position)
            .map((content: Content) => (
              <View key={content.id || content.position} className="mb-4">
                {content.contentType === "text" ? (
                  <Text className="text-gray-800 text-lg">{content.contentData}</Text>
                ) : (
                  <Image
                    source={{ uri: content.contentData["fileUrl"] }}
                    className="w-full h-56 rounded-lg"
                  />
                )}
              </View>
            ))}
          
          {/* Quiz Button - Only show if article has a quiz */}
          {hasQuiz && (
            <View>
              {quizCompleted ? (
                <View>
                  {/* Quiz completion info */}
                  <View className="items-center bg-gray-50 rounded-lg p-4 mt-3 mb-4">
                    <Text className="text-gray-700 font-medium mb-1">Your Quiz Score</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="trophy" size={20} color="#F59E0B" className="mr-2" />
                      <Text className="text-lg font-bold text-purple-600">{completionScore}%</Text>
                    </View>
                  </View>
                  
                  {/* Quiz buttons when completed */}
                  <View className="flex-row space-x-3">
                    {/* <TouchableOpacity 
                      className="bg-green-600 py-4 flex-1 rounded-full"
                      onPress={navigateToQuiz}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="eye-outline" size={20} color="white" className="mr-2" />
                        <Text className="text-white font-semibold">Review Quiz</Text>
                      </View>
                    </TouchableOpacity> */}
                    
                    <TouchableOpacity 
                      className="bg-purple-600 py-4 flex-1 rounded-full"
                      onPress={handleRetakeQuiz}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="refresh" size={20} color="white" className="mr-2" />
                        <Text className="text-white font-semibold">Retake Quiz</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                /* Button when quiz is not completed */
                <TouchableOpacity 
                  className="bg-purple-600 py-4 px-6 rounded-full my-6"
                  onPress={navigateToQuiz}
                >
                  <View className="flex-row items-center justify-center">
                    <Ionicons name="school-outline" size={24} color="white" className="mr-2" />
                    <Text className="text-white text-lg font-semibold">Take Quiz</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Bar (Fixed at the Bottom) */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
      
      {/* Web Confirmation Dialog */}
      <WebConfirmationDialog
        visible={confirmDialogVisible}
        title="Retake Quiz"
        message="Your previous score will be replaced with your new attempt. Continue?"
        onCancel={() => setConfirmDialogVisible(false)}
        onConfirm={() => {
          setConfirmDialogVisible(false);
          confirmRetakeQuiz();
        }}
      />
    </View>
  );
};

export default ArticleComponent;
