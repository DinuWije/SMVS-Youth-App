import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from "../components/NavigationBar";
import ReflectionAPIClient from "../APIClients/ReflectionAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObj } from "../utils/LocalStorageUtils";
import LottieView from "lottie-react-native";

const REFLECTION_TYPES = [
  { id: 'gratitude', label: 'Gratitude', icon: 'heart-outline', color: '#e57373' },
  { id: 'stress', label: 'Stress Relief', icon: 'water-outline', color: '#64b5f6' },
  { id: 'goals', label: 'Goals & Growth', icon: 'trophy-outline', color: '#81c784' },
  { id: 'meditation', label: 'Meditation Insights', icon: 'leaf-outline', color: '#9575cd' },
  { id: 'emotion', label: 'Emotional Awareness', icon: 'pulse-outline', color: '#ffb74d' }
];

const ReflectionPage = ({ hideNavigation = false }) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState('gratitude');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [userReflection, setUserReflection] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseReceived, setResponseReceived] = useState(false);
  const [savedReflections, setSavedReflections] = useState([]);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [userId, setUserId] = useState(1);  // Default to 1
  const [savedReflectionId, setSavedReflectionId] = useState(null);
  const [saveConfirmation, setSaveConfirmation] = useState(false);
  
  // Animation refs
  const dotOpacity1 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity2 = useRef(new Animated.Value(0.3)).current;
  const dotOpacity3 = useRef(new Animated.Value(0.3)).current;
  const lottieRef = useRef(null);

  // Get user ID
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
        if (userObject && userObject.id) {
          setUserId(userObject.id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    
    fetchUserId();
  }, []);
  
  // Load a prompt when type changes
  useEffect(() => {
    const loadPrompt = async () => {
      setLoadingPrompt(true);
      try {
        const prompt = await ReflectionAPIClient.getPrompt(selectedType);
        setCurrentPrompt(prompt || getDefaultPrompt(selectedType));
      } catch (error) {
        console.error('Error loading prompt:', error);
        setCurrentPrompt(getDefaultPrompt(selectedType));
      } finally {
        setLoadingPrompt(false);
      }
    };
    
    loadPrompt();
    setUserReflection('');
    setAiResponse('');
    setResponseReceived(false);
  }, [selectedType]);
  
  // Load recent reflections
  useEffect(() => {
    const loadRecentReflections = async () => {
      try {
        const reflections = await ReflectionAPIClient.getRecent(3);
        if (reflections) {
          setSavedReflections(reflections);
        }
      } catch (error) {
        console.error('Error loading recent reflections:', error);
        setSavedReflections([]);
      }
    };
    
    loadRecentReflections();
  }, [responseReceived]); // Reload when a new reflection is saved
  
  // Function to submit reflection and get AI response
  const submitReflection = async () => {
    if (!userReflection.trim()) return;
    
    setLoading(true);
    try {
      // Get AI response
      const response = await ReflectionAPIClient.getAIResponse({
        user_reflection: userReflection,
        reflection_type: selectedType,
        user_id: userId
      });
      
      // Make sure the response is properly set
      if (response) {
        setAiResponse(response);
        setResponseReceived(true);
      } else {
        setAiResponse("I'm having trouble connecting to provide a thoughtful response. Please try again later.");
      }
    } catch (error) {
      console.error('Error submitting reflection:', error);
      setAiResponse("There was an error processing your reflection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const createReflection = async() => {
    try {
      // Save the reflection with explicit user ID
      const savedReflection = await ReflectionAPIClient.create({
        reflectionType: selectedType,
        prompt: currentPrompt,
        userReflection: userReflection,
        aiResponse: aiResponse || "",
        user_id: userId
      });
      
      if (savedReflection) {
        setSavedReflectionId(savedReflection.id);
        
        // Show saved confirmation with toast-like message
        setSaveConfirmation(true);
        setTimeout(() => setSaveConfirmation(false), 3000); // Hide after 3 seconds
        
        // Refresh the recent reflections immediately
        try {
          const reflections = await ReflectionAPIClient.getRecent(3);
          if (reflections) {
            setSavedReflections(reflections);
          }
        } catch (error) {
          console.error('Error refreshing recent reflections:', error);
        }
        
        // Reset the form after saving
        resetReflection();
      }
    } catch (error) {
      console.error('Error creating reflection:', error);
    }
  };
  
  // Function to reset the current reflection
  const resetReflection = () => {
    setUserReflection('');
    setAiResponse('');
    setResponseReceived(false);
    setSavedReflectionId(null);
    
    // Refresh the reflections list
    const loadRecentReflections = async () => {
      try {
        const reflections = await ReflectionAPIClient.getRecent(3);
        if (reflections) {
          setSavedReflections(reflections);
        }
      } catch (error) {
        console.error('Error loading recent reflections:', error);
      }
    };
    
    loadRecentReflections();
  };
  
  // Default prompts for offline use
  const getDefaultPrompt = (reflectionType) => {
    const prompts = {
      gratitude: "What are three things you're grateful for today?",
      stress: "What's causing you the most stress right now?",
      goals: "What's one goal you're working toward currently?",
      meditation: "What insights arose during your recent meditation?",
      emotion: "What emotion has been most present for you today?"
    };
    
    return prompts[reflectionType] || prompts.gratitude;
  };
  
  // Animation for thinking dots
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotOpacity1, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(dotOpacity2, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(dotOpacity3, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(dotOpacity1, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(dotOpacity2, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(dotOpacity3, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      // Reset animations when not loading
      dotOpacity1.setValue(0.3);
      dotOpacity2.setValue(0.3);
      dotOpacity3.setValue(0.3);
    }
    
    // Cleanup animation on unmount
    return () => {
      dotOpacity1.stopAnimation();
      dotOpacity2.stopAnimation();
      dotOpacity3.stopAnimation();
    };
  }, [loading]);

  // AI Thinking animation component with dots
  const AIThinkingAnimation = () => (
    <View className="my-4 items-center">
      <View className="flex-row items-center mb-3">
        <FontAwesome5 name="robot" size={16} color="#8A56AC" />
        <Text className="text-purple-800 font-medium ml-2">AI Assistant Thinking</Text>
      </View>
      <View className="bg-purple-50 p-4 rounded-lg w-full border border-purple-100 items-center">
        <View style={{ width: 120, height: 120 }}>
          <View className="flex-row items-center justify-center h-full">
            <Animated.View style={{ opacity: dotOpacity1 }}>
              <View className="w-4 h-4 rounded-full bg-purple-600 mx-1" />
            </Animated.View>
            <Animated.View style={{ opacity: dotOpacity2 }}>
              <View className="w-4 h-4 rounded-full bg-purple-600 mx-1" />
            </Animated.View>
            <Animated.View style={{ opacity: dotOpacity3 }}>
              <View className="w-4 h-4 rounded-full bg-purple-600 mx-1" />
            </Animated.View>
          </View>
        </View>
        <Text className="text-gray-700 mt-2">Processing your reflection...</Text>
        <Text className="text-gray-500 text-xs mt-2">
          The AI is analyzing your thoughts to provide a thoughtful response
        </Text>
      </View>
    </View>
  );

  // Version for embedding in combined page
  if (hideNavigation) {
    return (
      <View className="flex-1 bg-white pt-2">
        {/* Header */}
        <View className="px-6 pb-4">
          <Text className="text-3xl font-bold text-gray-800">Reflections</Text>
          <Text className="text-gray-600 mt-1">AI-guided journal for mindfulness</Text>
        </View>
        
        {/* Reflection Type Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-6"
        >
          {REFLECTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              className={`mr-3 px-3 py-2 rounded-xl h-10 justify-center ${selectedType === type.id ? 'bg-opacity-20' : 'bg-gray-100'}`}
              style={{ backgroundColor: selectedType === type.id ? `${type.color}30` : undefined }}
              onPress={() => setSelectedType(type.id)}
            >
              <View className="flex-row items-center">
                <Ionicons 
                  name={type.icon} 
                  size={18} 
                  color={selectedType === type.id ? type.color : "#666"} 
                />
                <Text 
                  className={`font-medium ml-2 ${selectedType === type.id ? 'text-gray-800' : 'text-gray-600'}`}
                  style={{ color: selectedType === type.id ? type.color : undefined }}
                >
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Current Reflection */}
        <View className="px-6 mb-6">
          <View 
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: REFLECTION_TYPES.find(t => t.id === selectedType)?.color + '15' }}
          >
            <Text className="text-gray-700 font-medium mb-1">Today's Prompt</Text>
            {loadingPrompt ? (
              <View className="bg-gray-100 rounded-lg p-3 mb-4 flex-row items-center">
                <ActivityIndicator size="small" color="#8A56AC" />
                <Text className="text-gray-600 ml-2">Loading prompt...</Text>
              </View>
            ) : (
              <Text className="text-gray-800 text-lg mb-4 italic">{currentPrompt}</Text>
            )}
            
            {/* Reflection input field */}
            {!responseReceived && (
                <>
                <Text className="text-gray-700 font-medium mb-1">Your Reflection</Text>
                <TextInput
                  className="bg-white border border-gray-200 rounded-lg p-3 min-h-[120px] text-gray-800 mb-4"
                  placeholder="Start typing your reflection here..."
                  multiline
                  textAlignVertical="top"
                  value={userReflection}
                  onChangeText={setUserReflection}
                  editable={!loading}
                />
                </>
            )}
            
            {/* Submit button - only shown when not yet submitted */}
            {!responseReceived && !aiResponse && !loading && (
              <TouchableOpacity
                className={`bg-purple-600 py-3 rounded-lg items-center ${!userReflection.trim() ? 'opacity-50' : ''}`}
                onPress={submitReflection}
                disabled={loading || !userReflection.trim()}
              >
                <Text className="text-white font-bold">
                  Submit Reflection
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Loading animation */}
            {loading && (
              <AIThinkingAnimation />
            )}
            
            {/* AI Response section */}
            {aiResponse && !loading && (
              <View className="mt-4">
                <Text className="text-gray-700 font-medium mb-1">AI Response</Text>
                <View className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <View className="flex-row items-center mb-2">
                    <FontAwesome5 name="robot" size={16} color="#8A56AC" />
                    <Text className="text-purple-800 font-medium ml-2">Mindfulness Assistant</Text>
                  </View>
                  <Text className="text-gray-800">{aiResponse}</Text>
                </View>
                
                {/* Save and New buttons */}
                <View className="flex-row justify-between mt-4">
                  <TouchableOpacity
                    className="bg-purple-600 py-3 px-4 rounded-lg flex-1 mr-2 items-center"
                    onPress={createReflection}
                  >
                    <Text className="text-white font-medium">Save Reflection</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="bg-gray-200 py-3 px-4 rounded-lg flex-1 ml-2 items-center"
                    onPress={resetReflection}
                  >
                    <Text className="text-gray-800 font-medium">New Reflection</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
        
        {/* Recent Reflections */}
        {savedReflections.length > 0 && (
          <View className="px-6 mb-10">
            <Text className="text-xl font-bold text-gray-800 mb-3">Recent Reflections</Text>
            
            {savedReflections.map((reflection, index) => {
              const reflectionType = REFLECTION_TYPES.find(t => t.id === reflection.reflectionType) || REFLECTION_TYPES[0];
              return (
                <View 
                  key={index} 
                  className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
                >
                  <View className="flex-row items-center mb-2">
                    <View 
                      className="w-8 h-8 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: reflectionType.color }}
                    >
                      <Ionicons name={reflectionType.icon} size={16} color="white" />
                    </View>
                    <Text className="font-medium text-gray-800">{reflectionType.label}</Text>
                    <Text className="text-gray-500 text-xs ml-auto">
                      {new Date(reflection.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <Text className="text-gray-600 italic mb-2">{reflection.prompt}</Text>
                  <Text className="text-gray-800 mb-1" numberOfLines={2}>
                    {reflection.userReflection}
                  </Text>
                </View>
              );
            })}
            
            <View>
              <TouchableOpacity 
                className="flex-row items-center justify-center py-2"
                onPress={() => router.push('/ReflectionHistory')}
              >
                <Text className="text-purple-600 font-medium">View All Reflections</Text>
                <Ionicons name="chevron-forward" size={16} color="#8A56AC" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }
  
  // Original full page with navigation for standalone use
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Toast-like save confirmation */}
      {saveConfirmation && (
        <View className="absolute top-10 left-0 right-0 z-10 px-6">
          <View className="bg-green-600 rounded-lg p-4 flex-row items-center justify-center shadow-lg">
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Reflection saved to favorites</Text>
          </View>
        </View>
      )}
      
      <ScrollView className="flex-1 mb-16">
        {/* Header */}
        <View className="px-6 pt-10 pb-4">
          <Text className="text-3xl font-bold text-gray-800">Reflections</Text>
          <Text className="text-gray-600 mt-1">AI-guided journal for mindfulness</Text>
        </View>
        
        {/* Reflection Type Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className="mb-6"
        >
          {REFLECTION_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              className={`mr-3 p-3 rounded-xl ${selectedType === type.id ? 'bg-opacity-20' : 'bg-gray-100'}`}
              style={{ backgroundColor: selectedType === type.id ? `${type.color}30` : undefined }}
              onPress={() => setSelectedType(type.id)}
            >
              <View className="flex-row items-center">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-2"
                  style={{ backgroundColor: type.color }}
                >
                  <Ionicons name={type.icon} size={20} color="white" />
                </View>
                <Text 
                  className={`font-medium ${selectedType === type.id ? 'text-gray-800' : 'text-gray-600'}`}
                  style={{ color: selectedType === type.id ? type.color : undefined }}
                >
                  {type.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Current Reflection - Add more content here as needed */}
        <View className="px-6 mb-6">
          {/* Content similar to the embedded version */}
          <View 
            className="rounded-xl p-4 mb-4"
            style={{ backgroundColor: REFLECTION_TYPES.find(t => t.id === selectedType)?.color + '15' }}
          >
            <Text className="text-gray-700 font-medium mb-1">Today's Prompt</Text>
            {loadingPrompt ? (
              <View className="bg-gray-100 rounded-lg p-3 mb-4 flex-row items-center">
                <ActivityIndicator size="small" color="#8A56AC" />
                <Text className="text-gray-600 ml-2">Loading prompt...</Text>
              </View>
            ) : (
              <Text className="text-gray-800 text-lg mb-4 italic">{currentPrompt}</Text>
            )}
            
            {/* Rest of the content would be the same as above */}
          </View>
        </View>
      </ScrollView>
      
      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ReflectionPage;
