import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from "../components/NavigationBar";
import ReflectionAPIClient from "../APIClients/ReflectionAPIClient";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";
import { getLocalStorageObj } from "../utils/LocalStorageUtils";

// Same reflection types from your ReflectionPage
const REFLECTION_TYPES = [
  { id: 'gratitude', label: 'Gratitude', icon: 'heart-outline', color: '#e57373' },
  { id: 'stress', label: 'Stress Relief', icon: 'water-outline', color: '#64b5f6' },
  { id: 'goals', label: 'Goals & Growth', icon: 'trophy-outline', color: '#81c784' },
  { id: 'meditation', label: 'Meditation Insights', icon: 'leaf-outline', color: '#9575cd' },
  { id: 'emotion', label: 'Emotional Awareness', icon: 'pulse-outline', color: '#ffb74d' }
];

const ReflectionHistory = () => {
  const router = useRouter();
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(1); // Default to 1
  const [filter, setFilter] = useState('all'); // Filter type: 'all', 'gratitude', etc.
  const [selectedReflection, setSelectedReflection] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteToastVisible, setDeleteToastVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get user ID and load reflections
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        // Get user ID
        const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
        if (userObject && userObject.id) {
          setUserId(userObject.id);
        }
        
        // Load reflections
        await loadReflections();
      } catch (error) {
        console.error('Error initializing reflection history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initialize();
  }, [refreshTrigger]);

  // Load user reflections
  const loadReflections = async () => {
    try {
      // For now, we'll get all reflections. In a real app, you might add pagination
      const userReflections = await ReflectionAPIClient.getAll();
      if (userReflections) {
        setReflections(userReflections);
      } else {
        setReflections([]);
      }
    } catch (error) {
      console.error('Error loading reflections:', error);
      setReflections([]);
    }
  };

  // Filter reflections based on selected type
  const filteredReflections = filter === 'all' 
    ? reflections 
    : reflections.filter(reflection => reflection.reflectionType === filter);

  // Delete a reflection
  const deleteReflection = async (id) => {
    try {
      await ReflectionAPIClient.remove(id);
      
      // Show delete confirmation toast
      setDeleteToastVisible(true);
      setTimeout(() => setDeleteToastVisible(false), 3000);
      
      // Close modal and refresh list
      setConfirmDeleteVisible(false);
      setModalVisible(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting reflection:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Details modal for viewing a specific reflection
  const ReflectionDetailsModal = () => {
    if (!selectedReflection) return null;
    
    const reflectionType = REFLECTION_TYPES.find(t => t.id === selectedReflection.reflectionType) || REFLECTION_TYPES[0];
    
    return (
      <Modal
        animationType={confirmDeleteVisible ? "none" : "slide"}
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%] shadow-lg">
            <ScrollView className="pt-6 px-6 pb-10">
              {/* Header with close button */}
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <View 
                    className="w-10 h-10 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: reflectionType.color }}
                  >
                    <Ionicons name={reflectionType.icon} size={20} color="white" />
                  </View>
                  <Text className="text-xl font-bold text-gray-800">{reflectionType.label}</Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-gray-500 mb-4">
                {formatDate(selectedReflection.createdAt)}
              </Text>
              
              {/* Prompt */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Prompt</Text>
                <Text className="text-gray-800 italic">{selectedReflection.prompt}</Text>
              </View>
              
              {/* User Reflection */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Your Reflection</Text>
                <View className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <Text className="text-gray-800">{selectedReflection.userReflection}</Text>
                </View>
              </View>
              
              {/* AI Response */}
              <View className="mb-6">
                <Text className="text-gray-700 font-medium mb-1">AI Response</Text>
                <View className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <View className="flex-row items-center mb-2">
                    <FontAwesome5 name="robot" size={16} color="#8A56AC" />
                    <Text className="text-purple-800 font-medium ml-2">Mindfulness Assistant</Text>
                  </View>
                  <Text className="text-gray-800">{selectedReflection.aiResponse}</Text>
                </View>
              </View>
              
              {/* Delete button */}
              <TouchableOpacity
                className="bg-red-100 py-3 px-4 rounded-lg items-center flex-row justify-center mt-4"
                onPress={() => setConfirmDeleteVisible(true)}
              >
                <Ionicons name="trash-outline" size={20} color="#e53e3e" />
                <Text className="text-red-600 font-medium ml-2">Delete Reflection</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Delete confirmation modal
  const DeleteConfirmationModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={confirmDeleteVisible}
      onRequestClose={() => setConfirmDeleteVisible(false)}
    >
      <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <View className="bg-white rounded-xl p-6 m-4 items-center">
          <Ionicons name="alert-circle" size={48} color="#e53e3e" />
          <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">Delete Reflection</Text>
          <Text className="text-gray-600 text-center mb-6">
            Are you sure you want to delete this reflection? This action cannot be undone.
          </Text>
          <View className="flex-row w-full">
            <TouchableOpacity
              className="bg-gray-200 py-3 rounded-lg flex-1 items-center mr-2"
              onPress={() => setConfirmDeleteVisible(false)}
            >
              <Text className="text-gray-800 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-red-500 py-3 rounded-lg flex-1 items-center ml-2"
              onPress={() => deleteReflection(selectedReflection.id)}
            >
              <Text className="text-white font-medium">Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Delete toast notification */}
      {deleteToastVisible && (
        <View className="absolute top-10 left-0 right-0 z-10 px-6">
          <View className="bg-red-500 rounded-lg p-4 flex-row items-center justify-center shadow-lg">
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text className="text-white font-medium ml-2">Reflection deleted successfully</Text>
          </View>
        </View>
      )}
      
      {/* Reflection Details Modal */}
      <ReflectionDetailsModal />
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
      
      <ScrollView className="flex-1 mb-16">
        {/* Header */}
        <View className="px-6 pt-10 pb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => { try { router.back() } catch(error) { router.push('/ReflectionPage')}}}
              className="mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-800">Reflection History</Text>
          </View>
          <Text className="text-gray-600 mt-1">View and manage your past reflections</Text>
        </View>
        
        {/* Filter Selection */}
        <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="mb-6"
        >
        <TouchableOpacity
            className={`mr-3 px-3 py-2 rounded-xl h-10 justify-center ${filter === 'all' ? 'bg-gray-800' : 'bg-gray-200'}`}
            onPress={() => setFilter('all')}
        >
            <Text className={`font-medium ${filter === 'all' ? 'text-white' : 'text-gray-800'}`}>
            All
            </Text>
        </TouchableOpacity>
        
        {REFLECTION_TYPES.map((type) => (
            <TouchableOpacity
            key={type.id}
            className={`mr-3 px-3 py-2 rounded-xl h-10 justify-center ${filter === type.id ? 'bg-opacity-100' : 'bg-opacity-20'}`}
            style={{ 
                backgroundColor: filter === type.id ? type.color : `${type.color}20`
            }}
            onPress={() => setFilter(type.id)}
            >
            <View className="flex-row items-center">
                <Ionicons name={type.icon} size={18} color={filter === type.id ? "white" : type.color} />
                <Text 
                className={`font-medium ml-2 ${filter === type.id ? 'text-white' : 'text-gray-800'}`}
                >
                {type.label}
                </Text>
            </View>
            </TouchableOpacity>
        ))}
        </ScrollView>
        
        {/* Reflections List */}
        {loading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#8A56AC" />
            <Text className="text-gray-600 mt-4">Loading your reflections...</Text>
          </View>
        ) : filteredReflections.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10 px-6">
            <Ionicons name="journal-outline" size={64} color="#e0e0e0" />
            <Text className="text-xl font-medium text-gray-500 mt-4 mb-2">No reflections found</Text>
            <Text className="text-gray-500 text-center">
              {filter === 'all' 
                ? "You haven't created any reflections yet." 
                : `You haven't created any ${REFLECTION_TYPES.find(t => t.id === filter)?.label} reflections yet.`}
            </Text>
            <TouchableOpacity
              className="bg-purple-600 py-3 px-6 rounded-lg mt-6"
              onPress={() => router.push('/ReflectionPage')}
            >
              <Text className="text-white font-medium">Create a Reflection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6">
            {filteredReflections.map((reflection) => {
              const reflectionType = REFLECTION_TYPES.find(t => t.id === reflection.reflectionType) || REFLECTION_TYPES[0];
              return (
                <TouchableOpacity
                  key={reflection.id}
                  className="bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm"
                  onPress={() => {
                    setSelectedReflection(reflection);
                    setModalVisible(true);
                  }}
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
                      {formatDate(reflection.createdAt)}
                    </Text>
                  </View>
                  
                  <Text className="text-gray-600 italic mb-2">{reflection.prompt}</Text>
                  <Text className="text-gray-800 mb-1" numberOfLines={2}>
                    {reflection.userReflection}
                  </Text>
                  
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-purple-600 text-sm">
                      {reflection.aiResponse ? (
                        `${reflection.aiResponse.split(' ').slice(0, 6).join(' ')}...`
                      ) : 'No AI response'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedReflection(reflection);
                        setModalVisible(true);
                      }}
                    >
                      <Text className="text-purple-600 font-medium">View Details</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ReflectionHistory;
