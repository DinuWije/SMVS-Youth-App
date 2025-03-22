// app/quiz/[id].tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import QuizAPIClient, { Quiz, Question, Choice } from '@/APIClients/QuizAPIClient';
import SettingsAPIClient, { SettingsUserInfoResponse } from '@/APIClients/SettingsAPIClient';

export default function QuizScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<{[key: number]: number}>({});
  const [timer, setTimer] = useState(20);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [userInfo, setUserInfo] = useState<SettingsUserInfoResponse | null>(null);

  const updateQuizProgress = async () => {
    try {
      const progressData = {
        user_id: userInfo.id,
        content_type: "article", // This marks it as article progress
        points_collected: 1,
      };
      const result = await SettingsAPIClient.updateProgress(progressData);
      if (result) {
        console.log("Quiz progress updated successfully");
      }
    } catch (error) {
      console.error("Failed to update quiz progress:", error);
    }
  };
  
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const articleId = Number(id);
        if (isNaN(articleId)) {
          throw new Error('Invalid article ID');
        }
        
        const fetchedQuiz = await QuizAPIClient.getByArticleId(articleId);
        if (!fetchedQuiz) {
          throw new Error('Quiz not found');
        }
        
        setQuiz(fetchedQuiz);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuiz();

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
        }
    };

    fetchUserData();
    
    // Timer logic - only run when quiz is in progress
    let interval: NodeJS.Timeout;
    if (!quizCompleted) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer > 0 ? prevTimer - 1 : 0);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, quizCompleted]);

  const recordQuizCompletion = async (quizId: number, articleId: number, score: number) => {
    if (!userInfo) return;
    
    try {
      await QuizAPIClient.recordCompletion(
        Number(userInfo.id),
        quizId,
        articleId,
        score
      );
      console.log('Quiz completion recorded successfully');
    } catch (error) {
      console.error('Error recording quiz completion:', error);
    }
  };
  
  const handleChoiceSelect = (choiceIndex: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    const isCorrect = currentQuestion.choices[choiceIndex].isCorrect;
    
    // Update selected choice
    setSelectedChoices({
      ...selectedChoices,
      [currentQuestionIndex]: choiceIndex
    });
    
    // Update score
    if (isCorrect) {
      setCorrect(prev => prev + 1);
    } else {
      setIncorrect(prev => prev + 1);
    }
    
    // Move to next question after a short delay
    setTimeout(() => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setTimer(20); // Reset timer for next question
        } else {
          // When on the last question, add this choice to the correct/incorrect count
          // before calculating the final score
          const isLastChoiceCorrect = currentQuestion.choices[choiceIndex].isCorrect;
          const finalCorrectCount = isLastChoiceCorrect ? correct + 1 : correct;
          
          // Use the accumulated correct count for the final score
          const totalQuestions = quiz.questions.length;
          const score = Math.round((finalCorrectCount / totalQuestions) * 100);
          setFinalScore(score);
          
          // Record completion
          recordQuizCompletion(quiz.id, Number(id), score);
          
          // Show completion screen
          updateQuizProgress();
          setQuizCompleted(true);
        }
      }, 1500);
  };
  
  const retakeQuiz = () => {
    // Reset quiz state
    setCurrentQuestionIndex(0);
    setSelectedChoices({});
    setTimer(60);
    setCorrect(0);
    setIncorrect(0);
    setQuizCompleted(false);
  };
  
  const exitQuiz = () => {
    router.back();
  };
  
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-purple-100">
        <ActivityIndicator size="large" color="#8e44ad" />
      </View>
    );
  }
  
  if (!quiz) {
    return (
      <View className="flex-1 items-center justify-center bg-purple-100">
        <Text className="text-xl font-semibold">Quiz not found</Text>
        <TouchableOpacity 
          className="mt-4 bg-purple-600 py-2 px-4 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Quiz completion screen
  if (quizCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-purple-100">
        <View className="bg-purple-600 pt-10 pb-32 items-center">
          <Text className="text-white text-3xl font-bold mb-2">Quiz Completed!</Text>
          <Text className="text-purple-200 text-lg">{quiz.title}</Text>
        </View>
        
        <View className="bg-white rounded-t-3xl -mt-20 flex-1 px-6 pt-8">
          <View className="items-center mb-8">
            <View className="w-32 h-32 rounded-full bg-purple-100 items-center justify-center mb-4 border-4 border-purple-500">
              <Text className="text-purple-600 text-4xl font-bold">{finalScore}%</Text>
            </View>
            
            <Text className="text-gray-800 text-xl font-semibold">Your Score</Text>
            <Text className="text-gray-600 mt-2 text-center">
              You answered {Object.entries(selectedChoices).filter(
                ([_, choiceIndex]) => quiz.questions[Number(_)].choices[choiceIndex].isCorrect
              ).length} out of {quiz.questions.length} questions correctly.
            </Text>
          </View>
          
          <View className="flex-row justify-center space-x-4 mt-6">
            <TouchableOpacity 
              className="bg-purple-600 py-4 px-8 rounded-xl"
              onPress={retakeQuiz}
            >
              <View className="flex-row items-center">
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">Retake</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-200 py-4 px-8 rounded-xl"
              onPress={exitQuiz}
            >
              <View className="flex-row items-center">
                <Ionicons name="exit-outline" size={20} color="#333" />
                <Text className="text-gray-800 text-lg font-semibold ml-2">Exit</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Score breakdown */}
          <View className="mt-12 bg-gray-50 rounded-xl p-6">
            <Text className="text-gray-800 font-semibold text-lg mb-4">Score Breakdown</Text>
            
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                <Text className="text-gray-700">Correct Answers</Text>
              </View>
              <Text className="font-semibold text-green-600">{correct}</Text>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 rounded-full bg-orange-500 mr-2" />
                <Text className="text-gray-700">Incorrect Answers</Text>
              </View>
              <Text className="font-semibold text-orange-500">{incorrect}</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  return (
    <SafeAreaView className="flex-1 bg-purple-100">
      {/* Header with back button and timer */}
      <View className="bg-purple-600 pt-4 pb-20 relative">
        <TouchableOpacity 
          className="absolute top-4 left-4 z-10" 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        
        {/* Timer circle */}
        <View className="items-center justify-center mt-6">
          <View className="w-16 h-16 rounded-full border-4 border-purple-300 items-center justify-center">
            <Text className="text-white text-2xl font-bold">{timer}</Text>
          </View>
        </View>
      </View>
      
      {/* Progress section */}
      <View className="bg-white rounded-t-3xl -mt-10 pt-6 px-6 flex-row justify-between items-center">
        <View className="flex-row items-center">
          <Text className="text-green-600 font-bold text-lg mr-2">0{correct}</Text>
          <View className="w-16 h-2 rounded-full bg-green-600"></View>
        </View>
        
        <Text className="text-purple-600 font-semibold text-lg">Question {currentQuestionIndex + 1}/{quiz.questions.length}</Text>
        
        <View className="flex-row items-center">
          <View className="w-16 h-2 rounded-full bg-orange-500"></View>
          <Text className="text-orange-500 font-bold text-lg ml-2">0{incorrect}</Text>
        </View>
      </View>
      
      {/* Question and answers */}
      <ScrollView className="flex-1 bg-white px-4">
        <View className="py-6">
          <Text className="text-gray-800 text-xl font-bold text-center">
            {currentQuestion.text}
          </Text>
        </View>
        
        <View className="pb-10">
          {currentQuestion.choices.map((choice, index) => (
            <TouchableOpacity
              key={index}
              className="border-2 border-purple-500 rounded-full py-4 px-6 my-3 flex-row justify-between items-center"
              onPress={() => handleChoiceSelect(index)}
              disabled={selectedChoices[currentQuestionIndex] !== undefined}
            >
              <Text className="text-gray-800 text-lg">{choice.text}</Text>
              {selectedChoices[currentQuestionIndex] === index && (
                <Ionicons 
                  name={choice.isCorrect ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={choice.isCorrect ? "#8e44ad" : "#e74c3c"} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
