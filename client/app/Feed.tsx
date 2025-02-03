import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';

const feedData = [
  { id: '1', title: 'Waking up early', author: 'Alex Guo', date: 'Nov 15', content: 'Lorem ipsum dolor sit amet...', user: 'A', color: 'bg-red-300', liked: false },
  { id: '2', title: 'Mindfulness Meditation', author: 'Dinu Wijetunga', date: 'Nov 17', content: 'Lorem ipsum dolor sit amet...', user: 'D', color: 'bg-purple-300', liked: false },
  { id: '3', title: 'Healthy Eating Habits', author: 'Preet Makani', date: 'Nov 19', content: 'Lorem ipsum dolor sit amet...', user: 'P', color: 'bg-blue-300', liked: false },
];

const Feed = () => {
  const router = useRouter();
  const [posts, setPosts] = useState(feedData);

  // Function to toggle like
  const toggleLike = (id: string) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, liked: !post.liked } : post
    ));
  };

  return (
    <View className="flex-1 bg-white">
      <View className="p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Feed</Text>
      </View>

      {/* Feed List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            {/* Clickable Area for Opening feed */}
            <TouchableOpacity
              style={{ flex: 1 }} // Makes sure the title area is clickable
              onPress={() => router.push({ pathname: `/sample_feed/${item.id}`, params: item })}
            >
              <View>
                <Text className="text-lg font-semibold text-black">{item.title}</Text>
                <Text className="text-gray-500">{item.date} • {item.author}</Text>
              </View>
            </TouchableOpacity>

            {/* Icons & Actions */}
            <View className="flex-row items-center space-x-4">
              {/* Like Button */}
              <TouchableOpacity onPress={() => toggleLike(item.id)}>
                <FontAwesome name={item.liked ? "heart" : "heart-o"} size={22} color={item.liked ? "red" : "black"} />
              </TouchableOpacity>

              {/* Link Icon */}
              <TouchableOpacity>
                <FontAwesome5 name="link" size={20} color="black" />
              </TouchableOpacity>

              {/* Avatar */}
              <View className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}>
                <Text className="text-white font-bold">{item.user}</Text>
              </View>
            </View>
          </View>
        )}
      />

      {/* Floating Add Button (Simple & Modern) */}
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
