import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const CreateFeed = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Handle post submission
  const handlePost = () => {
    if (!title || !description) {
      Alert.alert("Error", "All fields must be filled out.");
      return;
    }

    // Here, you can send the data to a backend API or store it in state
    console.log("Post Created:", { title, description });

    // Reset fields after posting
    setTitle('');
    setDescription('');

    // Navigate back to Feed
    router.push('/Feed');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white p-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Create Post</Text>
        <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Input Fields */}
      <View className="space-y-4">
        {/* Title Input */}
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg"
          placeholder="Enter title..."
          value={title}
          onChangeText={setTitle}
        />

        {/* Description Input */}
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg h-24"
          placeholder="Enter description..."
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity
        className="mt-6 bg-blue-500 p-4 rounded-lg flex items-center"
        onPress={handlePost}
      >
        <Text className="text-white text-lg font-bold">Post</Text>
      </TouchableOpacity>

      {/* Live Preview */}
      {(title || description) && (
        <View className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <Text className="text-lg font-bold">{title || "Your Post Title"}</Text>
          <View className="flex-row items-center space-x-2 my-2">
            <View className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold">A</Text> {/* Placeholder avatar */}
            </View>
            <Text className="text-black font-semibold">Your Name</Text>
            <Text className="text-gray-500">Nov 15</Text>
          </View>
          <Text className="text-gray-700">{description || "Your post description..."}</Text>
          <View className="flex-row justify-around mt-4">
            <TouchableOpacity>
              <FontAwesome name="comment-o" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="heart-o" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="link" size={22} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <FontAwesome name="bookmark-o" size={22} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateFeed;
