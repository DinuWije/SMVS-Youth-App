import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';
import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';

const Feed = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedResponse[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const feedData = await FeedAPIClient.getAll();
      if (feedData) {
        setPosts(feedData);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  // Function to generate a consistent color based on the author's name
  const getUserColor = (name: string): string => {
    const colors = [
      'bg-red-300', 'bg-green-300', 'bg-blue-300',
      'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
      'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Feed</Text>
      </View>

      {/* Feed List */}
      {posts && posts.length > 0 ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            // Format the post date
            const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            // Extract author name & generate icon
            const authorName = item.author_name || "Unknown";
            const userInitial = authorName.charAt(0).toUpperCase();
            const avatarColor = getUserColor(authorName);

            return (
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                {/* Clickable Area for Opening feed */}
                <TouchableOpacity
                  style={{ flex: 1 }} // Ensures the entire post is clickable
                  onPress={() =>
                    router.push({
                      pathname: `/FeedDetails`,
                      params: { id: item.id.toString() }, // Pass post ID to FeedDetails.tsx
                    })
                  }
                >
                  <View>
                    <Text className="text-lg font-semibold text-black">{item.title}</Text>
                    <Text className="text-gray-500">
                      {formattedDate} • {authorName}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Icons & Actions */}
                <View className="flex-row items-center space-x-4">
                  {/* Like Button */}
                  <TouchableOpacity>
                    <FontAwesome name="heart-o" size={22} color="black" />
                  </TouchableOpacity>

                  {/* Link Icon */}
                  <TouchableOpacity>
                    <FontAwesome5 name="link" size={20} color="black" />
                  </TouchableOpacity>

                  {/* Avatar */}
                  <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
                    <Text className="text-white font-bold">{userInitial}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">No posts available.</Text>
        </View>
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-5 bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center"
        onPress={() => router.push('/CreateFeed')}
      >
        <Ionicons name="add" size={40} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <NavigationBar />
    </View>
  );
};

export default Feed;
