// import React, { useState, useEffect } from 'react';
// import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { FontAwesome, Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import NavigationBar from '../components/NavigationBar';
// import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';

// const Feed = () => {
//   const router = useRouter();
//   const [posts, setPosts] = useState<FeedResponse[] | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({}); // Track liked state per post

//   useEffect(() => {
//     const fetchPosts = async () => {
//       const feedData = await FeedAPIClient.getAll();
//       if (feedData) {
//         setPosts(feedData);
//       }
//       setLoading(false);
//     };

//     fetchPosts();
//   }, []);

//   // Function to toggle like state
//   const toggleLike = (id: number) => {
//     setLikedPosts((prevLikedPosts) => ({
//       ...prevLikedPosts,
//       [id]: !prevLikedPosts[id],
//     }));
//   };

//   // Function to generate a consistent color based on the author's name
//   const getUserColor = (name: string): string => {
//     const colors = [
//       'bg-red-300', 'bg-green-300', 'bg-blue-300',
//       'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
//       'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
//     ];
//     const charCode = name.charCodeAt(0);
//     return colors[charCode % colors.length];
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" />
//         <Text>Loading posts...</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <View className="p-4 border-b border-gray-200">
//         <Text className="text-3xl font-bold text-black">Feed</Text>
//       </View>

//       {/* Feed List */}
//       {posts && posts.length > 0 ? (
//         <FlatList
//           data={posts}
//           keyExtractor={(item) => item.id.toString()}
//           renderItem={({ item }) => {
//             // Format the post date
//             const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
//               month: 'short',
//               day: 'numeric',
//             });

//             // Extract author name & generate icon
//             const authorName = item.author_name || "Unknown";
//             const userInitial = authorName.charAt(0).toUpperCase();
//             const avatarColor = getUserColor(authorName);
//             const isLiked = likedPosts[item.id] || false; // Check if post is liked

//             return (
//               <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
//                 {/* Clickable Area for Opening feed */}
//                 <TouchableOpacity
//                   style={{ flex: 1 }} // Ensures the entire post is clickable
//                   onPress={() =>
//                     router.push({
//                       pathname: `/FeedDetails`,
//                       params: { id: item.id.toString() }, // Pass post ID to FeedDetails.tsx
//                     })
//                   }
//                 >
//                   <View>
//                     <Text className="text-lg font-semibold text-black">{item.title}</Text>
//                     <Text className="text-gray-500">
//                       {formattedDate} • {authorName}
//                     </Text>
//                   </View>
//                 </TouchableOpacity>

//                 {/* Icons & Actions */}
//                 <View className="flex-row items-center space-x-4">
//                   {/* Like Button */}
//                   <TouchableOpacity onPress={() => toggleLike(item.id)}>
//                     <FontAwesome
//                       name={isLiked ? "heart" : "heart-o"}
//                       size={22}
//                       color={isLiked ? "red" : "black"}
//                     />
//                   </TouchableOpacity>

//                   {/* Avatar */}
//                   <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
//                     <Text className="text-white font-bold">{userInitial}</Text>
//                   </View>
//                 </View>
//               </View>
//             );
//           }}
//         />
//       ) : (
//         <View className="flex-1 justify-center items-center">
//           <Text className="text-gray-500 text-lg">No posts available.</Text>
//         </View>
//       )}

//       {/* Floating Add Button */}
//       <TouchableOpacity
//         className="absolute bottom-20 right-5 bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center"
//         onPress={() => router.push('/CreateFeed')}
//       >
//         <Ionicons name="add" size={40} color="white" />
//       </TouchableOpacity>

//       {/* Bottom Navigation */}
//       <NavigationBar />
//     </View>
//   );
// };

// export default Feed;


import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';
import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';
import { getLocalStorageObj } from '../utils/LocalStorageUtils'; // Get the authenticated user

const Feed = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Keeps track of which posts the user has liked (true/false)
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  // Keeps track of the like count per post
  const [likesCount, setLikesCount] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    const fetchUserAndPosts = async () => {
      // 1. Get the user from local storage
      const userObject = await getLocalStorageObj('AUTHENTICATED_USER_KEY');
      if (userObject && userObject.id) {
        setUserId(userObject.id);
      }
      
      // 2. Fetch feed data
      const feedData = await FeedAPIClient.getAll();
      if (feedData) {
        setPosts(feedData);

        const initialLikedState: { [key: number]: boolean } = {};
        const initialLikesCount: { [key: number]: number } = {};

        // 3. Initialize each post’s “liked” and “likesCount” state
        feedData.forEach(post => {
          // Check if the current user’s ID is in the post’s `users_who_have_liked` array
          // (Because DB might store them as integers, we convert both sides to string for comparison)
          initialLikedState[post.id] = Array.isArray(post.users_who_have_liked)
            ? post.users_who_have_liked.map(String).includes(String(userObject.id))
            : false;

          // Set the like count (defaults to 0 if none)
          initialLikesCount[post.id] = post.likes_count || 0;
        });

        setLikedPosts(initialLikedState);
        setLikesCount(initialLikesCount);
      }
      setLoading(false);
    };

    fetchUserAndPosts();
  }, []);

  // Function to toggle like state and update the backend
  const toggleLike = async (postId: number) => {
    // Ensure we have a valid user ID
    if (!userId) return;

    // Check current like status for that post
    const isCurrentlyLiked = likedPosts[postId] || false;

    // Optimistically toggle it in UI
    setLikedPosts((prev) => ({
      ...prev,
      [postId]: !isCurrentlyLiked,
    }));

    // Adjust likes count accordingly
    setLikesCount((prev) => ({
      ...prev,
      [postId]: isCurrentlyLiked ? prev[postId] - 1 : prev[postId] + 1,
    }));

    try {
      // Make the actual API call to toggle "like" on the backend
      await FeedAPIClient.likePost(postId, userId);
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
      // Revert UI changes if the request fails
      setLikedPosts((prev) => ({ ...prev, [postId]: isCurrentlyLiked }));
      setLikesCount((prev) => ({
        ...prev,
        [postId]: isCurrentlyLiked ? prev[postId] + 1 : prev[postId] - 1,
      }));
    }
  };

  // Function to generate a consistent color based on the author's name
  const getUserColor = (name: string): string => {
    const colors = [
      'bg-red-300', 'bg-green-300', 'bg-blue-300',
      'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
      'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
    ];
    // Use the first character’s char code to pick a color
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  // Show a loading indicator until posts are ready
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
      {/* Header */}
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
            const authorName = item.author_name || 'Unknown';
            const userInitial = authorName.charAt(0).toUpperCase();
            const avatarColor = getUserColor(authorName);

            // Determine if this post is currently liked by the user
            const isLiked = likedPosts[item.id] || false;

            return (
              <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                {/* Clickable Area for Opening post details */}
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() =>
                    router.push({
                      pathname: '/FeedDetails',
                      params: { id: item.id.toString() },
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
                  {/* Like Button with optional Like Count */}
                  {/* <TouchableOpacity 
                    className="flex-row items-center space-x-1" 
                    onPress={() => toggleLike(item.id)}
                  >
                    <FontAwesome
                      name={isLiked ? 'heart' : 'heart-o'}
                      size={22}
                      color={isLiked ? 'red' : 'black'}
                    />
                    {/* If you also want to show count: 
                      <Text className="text-black font-semibold">{likesCount[item.id]}</Text>
                    */}
                  {/* </TouchableOpacity> */}

                  {/* Simple avatar (initial-based) */}
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
