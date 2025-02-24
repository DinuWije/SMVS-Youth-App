// import React, { useState } from 'react'
// import { View, Text, FlatList, TouchableOpacity } from 'react-native'
// import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
// import { useRouter } from 'expo-router'
// import NavigationBar from '../components/NavigationBar'

// const feedData = [
//   {
//     id: '1',
//     title: 'Waking up early',
//     author: 'Alex Guo',
//     date: 'Nov 15',
//     content: 'Lorem ipsum dolor sit amet...',
//     user: 'A',
//     color: 'bg-red-300',
//     liked: false,
//   },
//   {
//     id: '2',
//     title: 'Mindfulness Meditation',
//     author: 'Dinu Wijetunga',
//     date: 'Nov 17',
//     content: 'Lorem ipsum dolor sit amet...',
//     user: 'D',
//     color: 'bg-purple-300',
//     liked: false,
//   },
//   {
//     id: '3',
//     title: 'Healthy Eating Habits',
//     author: 'Preet Makani',
//     date: 'Nov 19',
//     content: 'Lorem ipsum dolor sit amet...',
//     user: 'P',
//     color: 'bg-blue-300',
//     liked: false,
//   },
// ]

// const Feed = () => {
//   const router = useRouter()
//   const [posts, setPosts] = useState(feedData)

//   // Function to toggle like
//   const toggleLike = (id: string) => {
//     setPosts(
//       posts.map((post) =>
//         post.id === id ? { ...post, liked: !post.liked } : post
//       )
//     )
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <View className="p-4 border-b border-gray-200">
//         <Text className="text-3xl font-bold text-black">Feed</Text>
//       </View>

//       {/* Feed List */}
//       <FlatList
//         data={posts}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
//             {/* Clickable Area for Opening feed */}
//             <TouchableOpacity
//               style={{ flex: 1 }} // Makes sure the title area is clickable
//               onPress={() =>
//                 router.push({
//                   pathname: `/sample_feed/${item.id}`,
//                   params: item,
//                 })
//               }
//             >
//               <View>
//                 <Text className="text-lg font-semibold text-black">
//                   {item.title}
//                 </Text>
//                 <Text className="text-gray-500">
//                   {item.date} • {item.author}
//                 </Text>
//               </View>
//             </TouchableOpacity>

//             {/* Icons & Actions */}
//             <View className="flex-row items-center space-x-4">
//               {/* Like Button */}
//               <TouchableOpacity onPress={() => toggleLike(item.id)}>
//                 <FontAwesome
//                   name={item.liked ? 'heart' : 'heart-o'}
//                   size={22}
//                   color={item.liked ? 'red' : 'black'}
//                 />
//               </TouchableOpacity>

//               {/* Link Icon */}
//               <TouchableOpacity>
//                 <FontAwesome5 name="link" size={20} color="black" />
//               </TouchableOpacity>

//               {/* Avatar */}
//               <View
//                 className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center`}
//               >
//                 <Text className="text-white font-bold">{item.user}</Text>
//               </View>
//             </View>
//           </View>
//         )}
//       />

//       {/* Floating Add Button (Simple & Modern) */}
//       <TouchableOpacity
//         className="absolute bottom-20 right-5 bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center"
//         onPress={() => router.push('/CreateFeed')}
//       >
//         <Ionicons name="add" size={40} color="white" />
//       </TouchableOpacity>

//       {/* Bottom Navigation */}
//       <NavigationBar />
//     </View>
//   )
// }

// export default Feed


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
            const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

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
                      {formattedDate} • {item.centre}
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
                  <View className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center">
                    <Text className="text-white font-bold">
                      {item.author_id ? item.author_id.toString().charAt(0).toUpperCase() : '?'}
                    </Text>
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
