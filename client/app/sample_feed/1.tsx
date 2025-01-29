import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import NavigationBar from '../../components/NavigationBar';

const FeedDetails = () => {
  const router = useRouter();
  const { id, title, author, date, content, user, color } = useLocalSearchParams();
  const [liked, setLiked] = useState(false); // Track like state

  // Toggle like state
  const toggleLike = () => {
    setLiked(!liked);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Close Button */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Feed</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome5 name="times" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <Text className="text-2xl font-bold">{title}</Text>

        {/* Author Section */}
        <View className="flex-row justify-between items-center my-4">
          <View className="flex-row items-center space-x-2">
            <View className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
              <Text className="text-white font-bold">{user}</Text>
            </View>
            <Text className="text-lg font-semibold">{author}</Text>
          </View>
          <Text className="text-gray-500">{date}</Text>
        </View>

        {/* Content */}
        <Text className="text-gray-700 border-l-4 border-gray-300 pl-4">
          {content}
        </Text>

        {/* Actions */}
        <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200">
          <TouchableOpacity>
            <FontAwesome name="comment-o" size={22} color="black" />
          </TouchableOpacity>

          {/* Like Button (Toggles Heart Color) */}
          <TouchableOpacity onPress={toggleLike}>
            <FontAwesome name={liked ? "heart" : "heart-o"} size={22} color={liked ? "red" : "black"} />
          </TouchableOpacity>

          <TouchableOpacity>
            <FontAwesome5 name="link" size={20} color="black" />
          </TouchableOpacity>

          <TouchableOpacity>
            <FontAwesome name="bookmark-o" size={22} color="black" />
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View className="mt-6 p-4 border rounded-lg border-gray-300">
          <View className="flex-row justify-between">
            <Text className="font-semibold">Author</Text>
            <View className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
              <Text className="text-white font-bold">{user}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-4">
            <Text className="text-gray-500">Comments</Text>
            <Text className="font-semibold">0</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500">Views</Text>
            <Text className="font-semibold">142</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500">Likes</Text>
            <Text className="font-semibold">{liked ? "2" : "1"}</Text> {/* Increment when liked */}
          </View>
        </View>

        {/* Comment Section */}
        <TouchableOpacity className="mt-6 flex-row items-center space-x-2 p-3 border rounded-lg border-gray-300">
          <FontAwesome5 name="plus" size={20} color="black" />
          <Text className="font-semibold">Comment</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navigation Bar */}
      <NavigationBar />
    </View>
  );
};

export default FeedDetails;
