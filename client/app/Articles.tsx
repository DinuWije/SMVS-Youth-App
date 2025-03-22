import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Animated,
  ScrollView,
  Easing
} from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import EntityAPIClient from "../APIClients/EntityAPIClient";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "@/APIClients/ArticleAPIClient";
import SettingsAPIClient from "@/APIClients/SettingsAPIClient";
import { Platform } from "react-native";

// Colors
const Colors = {
  light: {
    accentPurple: "#8A56AC"
  }
};

// Tab Bar Component
const TabBar = ({ activeTab, setActiveTab }) => {
  return (
    <View>
      {/* Main Title */}
      {/* Main Title - Removed for simpler design matching the reference */}
      
      {/* Segment Control */}
      <View className="mx-4 mb-2 rounded-full bg-white flex-row overflow-hidden border border-gray-200 shadow-sm">
        <TouchableOpacity 
          className={`flex-1 py-3 px-4 items-center ${activeTab === 'home' ? 'bg-white rounded-full' : ''}`}
          onPress={() => setActiveTab('home')}
          style={{
            borderWidth: activeTab === 'home' ? 1 : 0,
            borderColor: '#e5e7eb',
            marginVertical: 2,
            marginLeft: 2,
            marginRight: 1
          }}
        >
          <Text className={`text-base font-medium ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-600'}`}>
            Articles
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className={`flex-1 py-3 px-4 items-center ${activeTab === 'progress' ? 'bg-white rounded-full' : ''}`}
          onPress={() => setActiveTab('progress')}
          style={{
            borderWidth: activeTab === 'progress' ? 1 : 0,
            borderColor: '#e5e7eb',
            marginVertical: 2,
            marginLeft: 1,
            marginRight: 2
          }}
        >
          <Text className={`text-base font-medium ${activeTab === 'progress' ? 'text-gray-800' : 'text-gray-600'}`}>
            Progress
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Web Confirmation Dialog Component
const WebConfirmDialog = ({ 
  visible, 
  title, 
  message, 
  onCancel, 
  onConfirm 
}) => {
  if (!visible) return null;
  
  return (
    <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{position: 'fixed'}}>
      <View className="bg-white rounded-lg p-6 m-4 max-w-sm">
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
            className="bg-red-500 px-4 py-2 rounded"
            onPress={onConfirm}
          >
            <Text className="text-white">Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Shimmer loading effect component
const ShimmerPlaceholder = () => {
  const translateX = new Animated.Value(-100);
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    
    return () => animation.stop();
  }, []);
  
  return (
    <View className="bg-gray-200 mb-6 rounded-2xl overflow-hidden">
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          backgroundColor: 'rgba(255,255,255,0.5)',
          transform: [{ translateX }],
        }}
      />
      <View className="w-full h-48 bg-gray-200" />
      <View className="p-4">
        <View className="w-3/4 h-5 bg-gray-300 rounded mb-2" />
        <View className="w-1/2 h-4 bg-gray-300 rounded mb-3" />
        <View className="w-2/3 h-3 bg-gray-300 rounded" />
      </View>
    </View>
  );
};

// Article Item Component
const ArticleCard = ({ article, onPress, onDelete, fadeAnim }) => {
  return (
    <Animated.View style={{opacity: fadeAnim}} className="relative bg-white mb-6 rounded-2xl overflow-hidden shadow-md">
      {/* Delete Button */}
      <TouchableOpacity 
        onPress={() => onDelete(article.id)} 
        className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-full shadow"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialIcons name="delete" size={24} color="#9333ea" />
      </TouchableOpacity>

      {/* Article Card */}
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        className="overflow-hidden"
      >
        <Image
          source={{ uri: article.cover_image?.fileUrl || 'https://via.placeholder.com/400x200?text=No+Image' }} 
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="p-4">
          <Text numberOfLines={1} className="text-xl font-semibold text-gray-800">{article.title}</Text>
          <Text numberOfLines={2} className="text-gray-500 mt-1">{article.subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded-full">
              <FontAwesome name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-gray-700 font-medium">{article.rating}</Text>
            </View>
            <Text className="ml-2 text-gray-500">{article.numberOfRatings} Ratings</Text>
            <View className="flex-row items-center ml-3 bg-purple-50 px-2 py-1 rounded-full">
              <Ionicons name="time-outline" size={14} color="#8A56AC" />
              <Text className="ml-1 text-gray-700 font-medium">{article.timeToRead} min</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Combined Screen Component
const HomeScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  
  // Home Screen State
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  
  // Progress Tracking State
  const [readingProgress, setReadingProgress] = useState(0);
  const [streak, setStreak] = useState(1);
  const [isProgressLoading, setIsProgressLoading] = useState(true);
  const [objectives, setObjectives] = useState([
    { id: 1, title: 'Read an Article', completed: false },
    { id: 2, title: 'Meditate', completed: false },
    { id: 3, title: 'Post on Feed', completed: false },
  ]);
  
  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const flameSize = useRef(new Animated.Value(1)).current;
  const flameBrightness = useRef(new Animated.Value(0)).current;
  
  // Generate flame color based on animation
  const flameColor = flameBrightness.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FF9D00', '#FF4500'],
  });
  
  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await ArticleAPIClient.getAll();
      if (!response) return;

      const articlesWithImages = await Promise.all(
        response.map(async (article) => {
          try {
            const fileUrl = await EntityAPIClient.getFile(article.coverImage);
            return { ...article, cover_image: fileUrl };
          } catch (err) {
            console.error("Error fetching image for article", article.id, err);
            return { ...article, cover_image: null };
          }
        })
      );
      
      setArticles(articlesWithImages);
      fadeIn();
    } catch (error) {
      console.error("Error fetching articles:", error);
      // Show error message
      if (Platform.OS === "web") {
        alert("Failed to load articles. Please try again.");
      } else {
        Alert.alert("Error", "Failed to load articles. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch progress data
  const fetchProgressData = async () => {
    try {
      setIsProgressLoading(true);
      const response = await SettingsAPIClient.getProgressData();

      if (response && Array.isArray(response)) {
        // Filter for all-time progress
        const allArticles = response.filter(
          (item) => item && item.contentType === 'article'
        );

        const totalArticles = 10; // Assuming there are 10 total articles
        const progressPercentage = Math.round(
          (allArticles.length / totalArticles) * 100
        );
        setReadingProgress(progressPercentage);

        // Filter results from just the last day
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastDayResults = response.filter((item) => {
          if (!item || !item.date) return false;
          const itemDate = new Date(item.date);
          return itemDate >= yesterday;
        });

        // Check if objectives were completed in the last day
        const readArticleToday = lastDayResults.some(
          (item) => item.contentType === 'article'
        );
        const meditatedToday = lastDayResults.some(
          (item) => item.contentType === 'meditation'
        );
        const postedOnFeedToday = lastDayResults.some(
          (item) => item.contentType === 'feed'
        );

        // Update objectives state
        const updatedObjectives = [
          { id: 1, title: 'Read an Article', completed: readArticleToday },
          { id: 2, title: 'Meditate', completed: meditatedToday },
          { id: 3, title: 'Post on Feed', completed: postedOnFeedToday },
        ];
        if (meditatedToday) {
          setStreak(2);
        }
        setObjectives(updatedObjectives);
      } else {
        setReadingProgress(0);
        setStreak(0);
        setObjectives([
          { id: 1, title: 'Read an Article', completed: false },
          { id: 2, title: 'Meditate', completed: false },
          { id: 3, title: 'Post on Feed', completed: false },
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch progress data:', error);
      Alert.alert('Error', 'Failed to load progress data. Please try again.');
      setReadingProgress(0);
      setStreak(0);
    } finally {
      setIsProgressLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchProgressData();
    
    // Start animation for flame
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
    ).start();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (activeTab === 'home') {
      fetchArticles();
    } else {
      fetchProgressData();
    }
  }, [activeTab]);

  const handleDelete = (articleId) => {
    setArticleToDelete(articleId);
    
    if (Platform.OS === "web") {
      setConfirmVisible(true);
    } else {
      // Use native Alert for iOS/Android
      Alert.alert(
        "Delete Article",
        "Are you sure you want to delete this article?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => confirmDelete(articleId),
          },
        ]
      );
    }
  };
  
  const confirmDelete = async (articleId) => {
    try {
      setIsDeleting(true);
      const success = await ArticleAPIClient.remove(articleId);
      if (success) {
        setArticles((prev) => prev.filter((article) => article.id !== articleId));
      } else {
        if (Platform.OS === "web") {
          alert("Failed to delete article. Please try again.");
        } else {
          Alert.alert('Error', 'Failed to delete article. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      if (Platform.OS === "web") {
        alert("An unexpected error occurred.");
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setIsDeleting(false);
      setConfirmVisible(false);
    }
  };

  const handleResetData = async () => {
    try {
      setIsProgressLoading(true);
      const success = await SettingsAPIClient.deleteAllProgress();

      if (success) {
        Alert.alert('Success', 'Progress data has been reset.');
        fetchProgressData();
      } else {
        Alert.alert('Error', 'Failed to reset progress data. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting progress data:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsProgressLoading(false);
    }
  };

  const renderPlaceholders = () => {
    return Array(3).fill(0).map((_, index) => (
      <ShimmerPlaceholder key={`placeholder-${index}`} />
    ));
  };
  
  // Leaderboard data
  const leaderboard = [
    { id: 1, initial: 'D', days: 15 },
    { id: 2, initial: 'P', days: 10 },
    { id: 3, initial: 'A', days: 8 },
  ];

  // Render the Home tab content
  const renderHomeTab = () => {
    return (
      <>
        {/* Header */}
        <View className="px-6 pt-4 pb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-800">Discover</Text>
            <Text className="text-gray-500 text-sm mt-1">Inspiring articles</Text>
          </View>
          <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
            <Ionicons name="search" size={24} color="#8A56AC" />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View className="px-4">
            {renderPlaceholders()}
          </View>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <ArticleCard
                article={item}
                onPress={() => router.push(`/article/${item.id}`)}
                onDelete={handleDelete}
                fadeAnim={fadeAnim}
              />
            )}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#8A56AC"]}
                tintColor="#8A56AC"
              />
            }
            ListEmptyComponent={
              <View className="mt-10 items-center justify-center">
                <Ionicons name="newspaper-outline" size={64} color="#e0e0e0" />
                <Text className="mt-4 text-gray-500 text-lg">No articles found</Text>
                <TouchableOpacity 
                  className="mt-4 bg-purple-600 px-4 py-2 rounded-full"
                  onPress={onRefresh}
                >
                  <Text className="text-white">Refresh</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          className="absolute bottom-20 right-5 bg-purple-600 p-4 rounded-full shadow-lg flex items-center justify-center"
          onPress={() => router.push('/CreateArticle')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={36} color="white" />
        </TouchableOpacity>
      </>
    );
  };

  // Render the Progress tab content
  const renderProgressTab = () => {
    return (
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
        
        {/* Reset Data Button */}
        <View className="px-4 py-4 mb-20">
          <TouchableOpacity
            style={{
              backgroundColor: Colors.light.accentPurple,
              borderRadius: 10,
              paddingVertical: 16,
            }}
            onPress={handleResetData}
            disabled={isProgressLoading}
          >
            <Text className="text-center text-white text-lg font-bold">
              DEMO: RESET DATA
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Add extra space at the top */}
      <View className="pt-5 bg-white" />
      
      {/* Tab Bar */}
      <View className="bg-white pb-3">
        <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </View>
      
      {/* Content based on active tab */}
      <View className="flex-1 bg-white">
        {activeTab === 'home' ? renderHomeTab() : renderProgressTab()}
      </View>
      
      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>

      {/* Web Delete Confirmation Dialog */}
      {Platform.OS === "web" && (
        <WebConfirmDialog
          visible={confirmVisible}
          title="Delete Article"
          message="Are you sure you want to delete this article?"
          onCancel={() => setConfirmVisible(false)}
          onConfirm={() => confirmDelete(articleToDelete)}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
