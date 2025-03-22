import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, ScrollView, Image, Alert } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import NavigationBar from "../components/NavigationBar";
import SettingsAPIClient, { SettingsUserInfoResponse } from '@/APIClients/SettingsAPIClient';

// Enhanced audio files with categories, durations, and images
const AUDIO_FILES = [
  {
    id: "1",
    label: "Morning Calm",
    category: "Morning",
    duration: "10 min",
    url: "https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.apps.com/o/audio1.mp3?alt=media",
    image: "https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-4.0.3&q=80&w=400"
  },
  {
    id: "2",
    label: "Deep Relaxation",
    category: "Relaxation",
    duration: "15 min",
    url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio2.mp3?alt=media",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&q=80&w=400"
  },
  {
    id: "3",
    label: "Focus Boost",
    category: "Focus",
    duration: "8 min",
    url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio3.mp3?alt=media",
    image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&q=80&w=400"
  },
  {
    id: "4",
    label: "Sleep Meditation",
    category: "Sleep",
    duration: "20 min",
    url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio4.mp3?alt=media",
    image: "https://images.unsplash.com/photo-1511295844443-49e716e8a2c2?ixlib=rb-4.0.3&q=80&w=400"
  },
];

// Categories for filtering
const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Morning", value: "Morning" },
  { label: "Relaxation", value: "Relaxation" },
  { label: "Focus", value: "Focus" },
  { label: "Sleep", value: "Sleep" },
];

const { width } = Dimensions.get("window");

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const MeditationPage = () => {
  const [sound, setSound] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [categoryOpen, setCategoryOpen] = useState(false);
  
  // State for the progress bar
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  
  // Meditation timer state
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationCompleted, setMeditationCompleted] = useState(false);
  const [goalReached, setGoalReached] = useState(false);

  const [userInfo, setUserInfo] = useState(null);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);

  // Refs
  const timerRef = useRef(null);
  const lottieRef = useRef(null);

  // Get user info
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

  // Meditation timer effect
  useEffect(() => {
    if (meditationActive && !goalReached) {
      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start a new timer
      timerRef.current = setInterval(() => {
        setMeditationTime(prev => {
          const newTime = prev + 1;
          
          // Check if meditation has reached 5 minutes (300 seconds)
          if (newTime >= 300 && !goalReached) {
            updateMeditationProgress();
            setGoalReached(true);
            
            // Show success message
            Alert.alert(
              "Meditation Complete",
              "Congratulations! You've completed your daily 5-minute meditation goal.",
              [{ text: "OK" }]
            );
          }
          
          return newTime;
        });
      }, 1000);
    } else if (!meditationActive && timerRef.current) {
      // Stop the timer if meditation is paused or stopped
      clearInterval(timerRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [meditationActive, goalReached]);
  
  // Function to update meditation progress
  const updateMeditationProgress = async () => {
    try {
      if (!userInfo || !userInfo.id) {
        console.warn("User info not available, can't update progress");
        return;
      }
      
      const progressData = {
        user_id: userInfo.id,
        content_type: "meditation", 
        points_collected: 1,
      };
      
      const result = await SettingsAPIClient.updateProgress(progressData);
      if (result) {
        console.log("Meditation progress updated successfully");
        setMeditationCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update meditation progress:", error);
    }
  };

  // Audio session setup
  useEffect(() => {
    const setupAudio = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    };
    
    setupAudio();
    
    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Filter audio files based on selected category
  const filteredAudioFiles = selectedCategory === "all" 
    ? AUDIO_FILES 
    : AUDIO_FILES.filter(audio => audio.category === selectedCategory);

  const playAudio = async (url, id) => {
    try {
      // If something is already playing, stop/unload first
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlaying(null);
        setPaused(false);
      }

      setLoading(true);

      // Create a new Sound instance
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 }
      );
      
      setSound(newSound);
      setPlaying(id);
      setPaused(false);
      setLoading(false);
      
      // Start meditation timer if not already completed the goal
      if (!goalReached) {
        setMeditationActive(true);
      }

      // Update progress & handle completion
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          if (status.durationMillis) {
            setDuration(status.durationMillis);
          }
          if (status.positionMillis) {
            setCurrentPosition(status.positionMillis);
            setProgress(status.positionMillis / (status.durationMillis || 1));
          }

          // If the track finished, reset states
          if (status.didJustFinish) {
            await newSound.unloadAsync();
            setPlaying(null);
            setPaused(false);
            setProgress(0);
            setCurrentPosition(0);
            
            // Keep timer running if goal not reached
            if (!goalReached) {
              setMeditationActive(false);
            }
            
            // Reset animation
            if (lottieRef.current) {
              lottieRef.current.reset();
            }
          }
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (!sound) return;
    if (paused) {
      // Resume
      await sound.playAsync();
      setPaused(false);
      
      // Only restart timer if goal not reached
      if (!goalReached) {
        setMeditationActive(true);
      }
      
      // Continue animation
      if (lottieRef.current) {
        lottieRef.current.resume();
      }
    } else {
      // Pause
      await sound.pauseAsync();
      setPaused(true);
      setMeditationActive(false);
      
      // Pause animation
      if (lottieRef.current) {
        lottieRef.current.pause();
      }
    }
  };

  const seekAudio = async (value) => {
    if (sound && duration > 0) {
      const newPosition = value * duration;
      await sound.setPositionAsync(newPosition);
      setCurrentPosition(newPosition);
    }
  };

  // Format timer display
  const formatTimerDisplay = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Calculate remaining time for goal
  const getRemainingTimeForGoal = () => {
    const remainingSeconds = Math.max(0, 300 - meditationTime);
    return formatTimerDisplay(remainingSeconds);
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 mb-16">
        {/* Header */}
        <View className="px-6 pt-10 pb-4">
          <Text className="text-3xl font-bold text-gray-800">Meditation</Text>
          <Text className="text-gray-600 mt-1">Find peace and clarity</Text>
        </View>

        {/* Meditation Timer Card */}
        <View className="px-6 py-2">
          <View className="bg-purple-50 rounded-xl overflow-hidden">
            <View className="items-center justify-center p-4">
              {/* Timer Display */}
              <View className="py-2 px-6 bg-white rounded-full mb-3">
                <Text className="text-2xl font-bold text-purple-900">
                  {goalReached ? "Goal Reached!" : formatTimerDisplay(meditationTime)}
                </Text>
              </View>
              
              {/* Goal Info */}
              {!goalReached ? (
                <Text className="text-purple-700 mb-3">
                  {meditationActive 
                    ? `Goal: 5:00 (${getRemainingTimeForGoal()} remaining)` 
                    : "Goal: Meditate for 5 minutes"}
                </Text>
              ) : (
                <Text className="text-green-600 font-bold mb-3">
                  ✓ Daily meditation completed!
                </Text>
              )}
              
              <View style={{ width: width * 0.5, height: width * 0.5 }}>
                <LottieView
                  ref={lottieRef}
                  source={require("../assets/meditationAnimation.json")}
                  style={{ flex: 1 }}
                  resizeMode="contain"
                  autoPlay={playing !== null && !paused}
                  loop
                />
              </View>
            </View>
            
            {/* Progress Bar for Goal */}
            <View className="px-6 pb-4">
              <View className="h-3 bg-purple-200 rounded-full w-full">
                <View 
                  className="h-3 bg-purple-600 rounded-full" 
                  style={{ width: `${Math.min(100, (meditationTime / 300) * 100)}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-purple-800">0:00</Text>
                <Text className="text-xs text-purple-800">5:00</Text>
              </View>
            </View>
            
            {/* Track info and controls when playing */}
            <View className="px-6 pb-6">
              {playing ? (
                <>
                  <Text className="text-xl font-bold text-center text-purple-900 mb-1">
                    {AUDIO_FILES.find(a => a.id === playing)?.label || "Playing"}
                  </Text>
                  <Text className="text-sm text-center text-purple-700 mb-4">
                    {AUDIO_FILES.find(a => a.id === playing)?.category || ""}
                  </Text>
                  
                  {/* Audio Progress bar */}
                  <View className="mb-2">
                    <Slider
                      minimumValue={0}
                      maximumValue={1}
                      value={progress}
                      minimumTrackTintColor="#8e44ad"
                      maximumTrackTintColor="#e2d5e7"
                      thumbTintColor="#8e44ad"
                      onSlidingComplete={seekAudio}
                    />
                    <View className="flex-row justify-between">
                      <Text className="text-xs text-gray-600">{formatTime(currentPosition)}</Text>
                      <Text className="text-xs text-gray-600">{formatTime(duration)}</Text>
                    </View>
                  </View>
                  
                  {/* Player controls */}
                  <View className="flex-row justify-center items-center mt-4">
                    <TouchableOpacity className="p-2">
                      <Ionicons name="play-skip-back" size={28} color="#8e44ad" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      className="bg-purple-600 w-16 h-16 rounded-full items-center justify-center mx-6"
                      onPress={pauseAudio}
                    >
                      <Ionicons name={paused ? "play" : "pause"} size={30} color="white" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity className="p-2">
                      <Ionicons name="play-skip-forward" size={28} color="#8e44ad" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-center text-gray-600 my-2">
                    Select a meditation to begin
                  </Text>
                  
                  {/* Option to start silent meditation */}
                  <TouchableOpacity 
                    className="bg-purple-600 py-3 px-6 rounded-full self-center mt-3"
                    onPress={() => {
                      if (!meditationActive) {
                        setMeditationActive(true);
                        if (lottieRef.current) {
                          lottieRef.current.play();
                        }
                      } else {
                        setMeditationActive(false);
                        if (lottieRef.current) {
                          lottieRef.current.pause();
                        }
                      }
                    }}
                  >
                    <Text className="text-white font-bold text-center">
                      {meditationActive ? "Pause Silent Meditation" : "Start Silent Meditation"}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Category filter */}
        <View className="px-6 py-4">
          <Text className="text-lg font-semibold mb-2">Filter by Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.value}
                className={`px-4 py-2 mr-2 rounded-full ${
                  selectedCategory === category.value ? "bg-purple-600" : "bg-gray-200"
                }`}
                onPress={() => setSelectedCategory(category.value)}
              >
                <Text
                  className={`${
                    selectedCategory === category.value ? "text-white" : "text-gray-700"
                  }`}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Meditation list */}
        <View className="px-6 pb-10">
          <Text className="text-lg font-semibold mb-2">Available Meditations</Text>
          {filteredAudioFiles.map((audio) => (
            <TouchableOpacity
              key={audio.id}
              className={`flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3 ${
                playing === audio.id ? "border-purple-500 bg-purple-50" : ""
              }`}
              onPress={() => playAudio(audio.url, audio.id)}
            >
              <Image
                source={{ uri: audio.image }}
                className="w-16 h-16 rounded-lg"
              />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800">{audio.label}</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-sm text-gray-600 mr-2">{audio.category}</Text>
                  <Text className="text-sm text-gray-500">{audio.duration}</Text>
                </View>
              </View>
              <View className="w-10 items-center">
                {playing === audio.id ? (
                  paused ? (
                    <Ionicons name="pause-circle" size={28} color="#8e44ad" />
                  ) : (
                    <Ionicons name="play-circle" size={28} color="#8e44ad" />
                  )
                ) : (
                  <Ionicons name="play-circle-outline" size={28} color="#8e44ad" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </View>
  );
};

export default MeditationPage;
