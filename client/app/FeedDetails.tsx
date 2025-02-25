import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import NavigationBar from '../components/NavigationBar';
import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';

const FeedDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false); // Track like state

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const feedData = await FeedAPIClient.getById(id.toString()); // Fetch post by ID
      if (feedData) {
        setPost(feedData);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const toggleLike = () => {
    setLiked(!liked);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Post not found.</Text>
      </View>
    );
  }

  // Format the post date
  const formattedDate = post.createdAt
    ? new Date(Date.parse(post.createdAt)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date1'; // Fallback if parsing fails

  // Function to generate a color based on the author's name
  const getUserColor = (name: string): string => {
    const colors = [
      'bg-red-300', 'bg-green-300', 'bg-blue-300',
      'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
      'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
    ];

    // Hash the name and get a consistent color index
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Assign the user's first letter and color dynamically
  const userInitial = post.author_name ? post.author_name.charAt(0).toUpperCase() : '?';
  const avatarColor = getUserColor(post.author_name || 'Unknown');

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
        <Text className="text-2xl font-bold">{post.title}</Text>

        {/* Author Section */}
        <View className="flex-row justify-between items-center my-4">
          <View className="flex-row items-center space-x-2">
            <View className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center`}>
              <Text className="text-white font-bold">{userInitial}</Text>
            </View>
            <Text className="text-lg font-semibold">{post.author_name}</Text>
          </View>
          <Text className="text-gray-500">{formattedDate} • {post.centre}</Text>
        </View>

        {/* Content */}
        <Text className="text-gray-700 border-l-4 border-gray-300 pl-4">
          {post.content}
        </Text>

        {/* Actions */}
        <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200">
          <TouchableOpacity>
            <FontAwesome name="comment-o" size={22} color="black" />
          </TouchableOpacity>

          {/* Like Button (Toggles Heart Color) */}
          <TouchableOpacity onPress={toggleLike}>
            <FontAwesome name={liked ? 'heart' : 'heart-o'} size={22} color={liked ? 'red' : 'black'} />
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
            <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
              <Text className="text-white font-bold">{userInitial}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-4">
            <Text className="text-gray-500">Comments</Text>
            <Text className="font-semibold">{post.comments_count}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500">Views</Text>
            <Text className="font-semibold">{post.views_count}</Text>
          </View>
          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-500">Likes</Text>
            <Text className="font-semibold">{liked ? post.likes_count + 1 : post.likes_count}</Text> {/* Increment when liked */}
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
