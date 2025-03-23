import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NavigationBar from "../components/NavigationBar";

// Import the original page components
import MeditationPage from './MeditationPage';
import ReflectionPage from './ReflectionPage';

// Tab definition
const TABS = [
  { id: 'meditation', label: 'Meditation' },
  { id: 'reflection', label: 'Reflection' }
];

const CombinedPage = () => {
  // State to track active tab
  const [activeTab, setActiveTab] = useState('meditation');

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      {/* Tab Selection */}
      <View className="px-6 pt-10">
        <View className="flex-row h-12 bg-gray-100 rounded-full p-1">
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              className={`flex-1 rounded-full justify-center items-center ${
                activeTab === tab.id ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text 
                className={`font-medium ${
                  activeTab === tab.id ? 'text-purple-700' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Content Area */}
      <View className="flex-1">
        {activeTab === 'meditation' ? (
          <MeditationContentWrapper />
        ) : (
          <ReflectionContentWrapper />
        )}
      </View>
      
      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

// Wrapper for Meditation content to modify layout as needed
const MeditationContentWrapper = () => {
  return (
    <View className="flex-1">
      <MeditationContent />
    </View>
  );
};

// Wrapper for Reflection content to modify layout as needed
const ReflectionContentWrapper = () => {
  return (
    <View className="flex-1">
      <ReflectionContent />
    </View>
  );
};

// Extract just the content from MeditationPage
const MeditationContent = () => {
  // Create a content-only version of the MeditationPage
  // We'll use the ScrollView and contents, but skip the KeyboardAvoidingView 
  // and NavigationBar since those are handled by the parent CombinedPage

  return (
    <ScrollView className="flex-1">
      {/* We'll render the main content of MeditationPage here */}
      <MeditationPage hideNavigation={true} />
    </ScrollView>
  );
};

// Extract just the content from ReflectionPage
const ReflectionContent = () => {
  // Create a content-only version of the ReflectionPage
  // We'll use the ScrollView and contents, but skip the KeyboardAvoidingView 
  // and NavigationBar since those are handled by the parent CombinedPage

  return (
    <ScrollView className="flex-1">
      {/* We'll render the main content of ReflectionPage here */}
      <ReflectionPage hideNavigation={true} />
    </ScrollView>
  );
};

export default CombinedPage;
