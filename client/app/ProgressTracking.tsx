import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Easing,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'
import SettingsAPIClient, {
  ProgressResponse,
} from '@/APIClients/SettingsAPIClient'

const ProgressTracking = () => {
  const router = useRouter()
  const [readingProgress, setReadingProgress] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [objectives, setObjectives] = useState([
    { id: 1, title: 'Read an Article', completed: false },
    { id: 2, title: 'Meditate', completed: false },
    { id: 3, title: 'Post on Feed', completed: false },
  ])

  // Animation values
  const flameSize = useRef(new Animated.Value(1)).current
  const flameBrightness = useRef(new Animated.Value(0)).current

  // Fetch progress data when component mounts
  useEffect(() => {
    fetchProgressData()
  }, [])

  // Fetch progress data from API
  const fetchProgressData = async () => {
    try {
      setIsLoading(true)
      const response = await SettingsAPIClient.getProgressData()

      if (response && Array.isArray(response)) {
        // Filter for all-time progress
        const allArticles = response.filter(
          (item) => item && item.contentType === 'article'
        )

        const totalArticles = 10 // Assuming there are 10 total articles
        const progressPercentage = Math.round(
          (allArticles.length / totalArticles) * 100
        )
        setReadingProgress(progressPercentage)

        // Filter results from just the last day
        const today = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        const lastDayResults = response.filter((item) => {
          if (!item || !item.date) return false
          const itemDate = new Date(item.date)
          return itemDate >= yesterday
        })

        // Check if objectives were completed in the last day
        const readArticleToday = lastDayResults.some(
          (item) => item.contentType === 'article'
        )
        const meditatedToday = lastDayResults.some(
          (item) => item.contentType === 'meditation'
        )
        const postedOnFeedToday = lastDayResults.some(
          (item) => item.contentType === 'feed'
        )

        // Update objectives state
        const updatedObjectives = [
          { id: 1, title: 'Read an Article', completed: readArticleToday },
          { id: 2, title: 'Meditate', completed: meditatedToday },
          { id: 3, title: 'Post on Feed', completed: postedOnFeedToday },
        ]
        setObjectives(updatedObjectives)

        // Set streak based on objective completion
        const allObjectivesCompleted =
          readArticleToday && meditatedToday && postedOnFeedToday
        setStreak(allObjectivesCompleted ? 2 : 1)
      } else {
        setReadingProgress(0)
        setStreak(0)
        setObjectives([
          { id: 1, title: 'Read an Article', completed: false },
          { id: 2, title: 'Meditate', completed: false },
          { id: 3, title: 'Post on Feed', completed: false },
        ])
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error)
      Alert.alert('Error', 'Failed to load progress data. Please try again.')
      setReadingProgress(0)
      setStreak(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle resetting data
  const handleResetData = async () => {
    try {
      setIsLoading(true)
      const success = await SettingsAPIClient.deleteAllProgress()

      if (success) {
        Alert.alert('Success', 'Progress data has been reset.')
        router.back()
      } else {
        Alert.alert('Error', 'Failed to reset progress data. Please try again.')
      }
    } catch (error) {
      console.error('Error resetting progress data:', error)
      Alert.alert('Error', 'An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Start animation when component mounts
  useEffect(() => {
    // Create pulse animation
    Animated.loop(
      Animated.sequence([
        // Grow and brighten
        Animated.parallel([
          Animated.timing(flameSize, {
            toValue: 1.2,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameBrightness, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
        // Shrink and dim
        Animated.parallel([
          Animated.timing(flameSize, {
            toValue: 1,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(flameBrightness, {
            toValue: 0,
            duration: 1000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ])
    ).start()
  }, [])

  // Generate flame color based on animation
  const flameColor = flameBrightness.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF9D00', '#FF4500'],
  })

  // Daily objectives data is now managed in state

  // Leaderboard data - this could be updated with real data from the API
  const leaderboard = [
    { id: 1, initial: 'D', days: 15 },
    { id: 2, initial: 'P', days: 10 },
    { id: 3, initial: 'A', days: 8 },
  ]

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">
          Progress Tracking
        </Text>
      </View>

      <ScrollView className="flex-1">
        {/* Articles Read */}
        <View className="px-4 py-6">
          <Text className="text-lg text-gray-500">ARTICLES READ</Text>

          <View className="mt-2">
            <Text className="text-3xl font-bold">{readingProgress}%</Text>
            <Text className="text-gray-500 text-sm mt-1">
              {readingProgress < 50
                ? 'Keep it up!'
                : readingProgress < 100
                  ? 'Great progress!'
                  : 'Outstanding!'}
            </Text>

            {/* Progress bar */}
            <View className="mt-4 h-3 bg-gray-200 rounded-full w-full">
              <View
                className="h-3 rounded-full"
                style={{
                  width: `${readingProgress}%`,
                  backgroundColor: Colors.light.accentPurple,
                }}
              />
            </View>
          </View>
        </View>

        {/* Daily Objectives */}
        <View className="px-4 py-6">
          <Text className="text-lg text-gray-500">DAILY OBJECTIVES</Text>

          <View className="flex-row justify-between items-center mt-6">
            {objectives.map((objective, index) => (
              <View key={objective.id} className="items-center flex-1">
                <View
                  className={`w-12 h-12 rounded-full ${objective.completed ? '' : 'bg-white border border-gray-300'} items-center justify-center z-10`}
                  style={
                    objective.completed
                      ? { backgroundColor: Colors.light.accentPurple }
                      : {}
                  }
                >
                  {objective.completed && (
                    <Ionicons name="checkmark" size={24} color="white" />
                  )}
                </View>
                <Text className="text-center mt-2 text-gray-600">
                  {objective.title}
                </Text>

                {/* Connector line */}
                {index < objectives.length - 1 && (
                  <View
                    className="h-0.5 bg-gray-200 absolute z-0"
                    style={{
                      width: '70%',
                      left: '65%',
                      top: 24,
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Your Streak - Using meditation count as streak */}
        <View className="px-4 py-6">
          <Text className="text-lg text-gray-500">YOUR MEDITATION STREAK</Text>

          <View className="items-center justify-center mt-4">
            {/* Animated Flame Icon */}
            <Animated.View
              style={{
                transform: [{ scale: flameSize }],
                alignSelf: 'center',
              }}
            >
              <Animated.View
                style={{
                  backgroundColor: flameColor,
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Ionicons name="flame" size={56} color="white" />
              </Animated.View>
            </Animated.View>
            <Text
              className="py-5"
              style={{
                fontFamily: 'System',
                fontWeight: 'bold',
                fontSize: 24,
                color: '#FF4500',
                textShadowColor: 'rgba(255, 140, 0, 0.6)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 3,
                letterSpacing: 1.2,
                textAlign: 'center',
              }}
            >
              DAY {streak}
            </Text>
          </View>
        </View>

        {/* Leaderboard */}
        <View className="px-4 py-6">
          <Text className="text-lg text-gray-500">STREAK LEADERBOARD</Text>

          {leaderboard.map((item, index) => (
            <View
              key={item.id}
              className="flex-row items-center py-4 border-b border-gray-200"
            >
              <View
                className={`w-16 h-16 rounded-full ${
                  index === 0 ? '' : index === 1 ? 'bg-red-300' : 'bg-blue-300'
                } items-center justify-center`}
                style={
                  index === 0
                    ? { backgroundColor: Colors.light.accentPurple + '80' }
                    : {}
                }
              >
                <Text className="text-2xl text-white">{item.initial}</Text>
              </View>
              <Text className="ml-4 text-lg">{item.days} Days</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Reset Data Button */}
      <View className="px-4 py-4">
        <TouchableOpacity
          style={{
            backgroundColor: Colors.light.accentPurple,
            borderRadius: 10,
            paddingVertical: 16,
          }}
          onPress={handleResetData}
          disabled={isLoading}
        >
          <Text className="text-center text-white text-lg font-bold">
            DEMO: RESET DATA
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProgressTracking
