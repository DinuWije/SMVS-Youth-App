// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
// import NavigationBar from '../components/NavigationBar';
// import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';
// import { getLocalStorageObj } from '../utils/LocalStorageUtils';
// import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';

// const FeedDetails = () => {
//   const router = useRouter();
//   const { id } = useLocalSearchParams();
//   const [post, setPost] = useState<FeedResponse | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [liked, setLiked] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<number | null>(null);

//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
//       if (userObject) {
//         setCurrentUserId(userObject.id);
//       }
//     };
//     fetchCurrentUser();
//   }, []);

//   useEffect(() => {
//     const fetchPost = async () => {
//       if (!id) return;
//       const feedData = await FeedAPIClient.getById(id.toString());
//       if (feedData) {
//         setPost(feedData);
//       }
//       setLoading(false);
//     };
//     fetchPost();
//   }, [id]);

//   useEffect(() => {
//     if (post && currentUserId != null) {
//       const userHasLiked = post.usersWhoHaveLiked?.includes(currentUserId);
//       setLiked(userHasLiked);
//     }
//   }, [post, currentUserId]);

//   const toggleLike = async () => {
//     if (!post || currentUserId == null) return;

//     if (liked) {
//       // Unlike the post if already liked.
//       const success = await FeedAPIClient.unlikePost(Number(post.id), currentUserId);
//       if (success) {
//         setLiked(false);
//         const updatedLikesCount = (post.likesCount ?? 0) - 1;
//         const updatedUsersWhoHaveLiked = (post.usersWhoHaveLiked || []).filter(
//           (user) => user !== currentUserId
//         );
//         setPost({
//           ...post,
//           likesCount: updatedLikesCount,
//           usersWhoHaveLiked: updatedUsersWhoHaveLiked,
//         });
//       }
//     } else {
//       // Like the post.
//       const success = await FeedAPIClient.likePost(Number(post.id), currentUserId);
//       if (success) {
//         setLiked(true);
//         const updatedLikesCount = (post.likesCount ?? 0) + 1;
//         const updatedUsersWhoHaveLiked = [
//           ...(post.usersWhoHaveLiked || []),
//           currentUserId,
//         ];
//         setPost({
//           ...post,
//           likesCount: updatedLikesCount,
//           usersWhoHaveLiked: updatedUsersWhoHaveLiked,
//         });
//       }
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <ActivityIndicator size="large" />
//         <Text>Loading post...</Text>
//       </View>
//     );
//   }

//   if (!post) {
//     return (
//       <View className="flex-1 justify-center items-center">
//         <Text className="text-gray-500 text-lg">Post not found.</Text>
//       </View>
//     );
//   }

//   const formattedDate = post.createdAt
//     ? new Date(Date.parse(post.createdAt)).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//       })
//     : 'Unknown Date';

//   const getUserColor = (name: string): string => {
//     const colors = [
//       'bg-red-300', 'bg-green-300', 'bg-blue-300',
//       'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
//       'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
//     ];
//     const charCode = name.charCodeAt(0);
//     return colors[charCode % colors.length];
//   };

//   const userInitial = post.author_name ? post.author_name.charAt(0).toUpperCase() : '?';
//   const avatarColor = getUserColor(post.author_name || 'Unknown');

//   return (
//     <View className="flex-1 bg-white">
//       <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
//         <Text className="text-3xl font-bold text-black">Feed</Text>
//         <TouchableOpacity onPress={() => router.back()}>
//           <FontAwesome5 name="times" size={24} color="black" />
//         </TouchableOpacity>
//       </View>

//       <ScrollView className="p-4">
//         <Text className="text-2xl font-bold">{post.title}</Text>
//         <View className="flex-row justify-between items-center my-4">
//           <View className="flex-row items-center space-x-2">
//             <View className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center`}>
//               <Text className="text-white font-bold">{userInitial}</Text>
//             </View>
//             <Text className="text-lg font-semibold">{post.author_name}</Text>
//           </View>
//           <Text className="text-gray-500">{formattedDate} • {post.centre}</Text>
//         </View>
//         <Text className="text-gray-700 border-l-4 border-gray-300 pl-4">
//           {post.content}
//         </Text>
//         <View className="mt-6 p-4 border rounded-lg border-gray-300">
//           <View className="flex-row justify-between">
//             <Text className="font-semibold">Author</Text>
//             <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
//               <Text className="text-white font-bold">{userInitial}</Text>
//             </View>
//           </View>
//           {/* <View className="flex-row justify-between mt-4">
//             <Text className="text-gray-500">Comments</Text>
//             <Text className="font-semibold">{post.commentsCount}</Text>
//           </View>
//           <View className="flex-row justify-between mt-2">
//             <Text className="text-gray-500">Likes</Text>
//             <Text className="font-semibold">{post.likesCount}</Text>
//           </View> */}
//         </View>
//         <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200">
//           <TouchableOpacity onPress={toggleLike} className="flex-row items-center space-x-1">
//             <FontAwesome
//               name={liked ? 'heart' : 'heart-o'}
//               size={22}
//               color={liked ? 'red' : 'black'}
//             />
//           <Text className="text-black font-semibold">{post.likesCount}</Text>

//           </TouchableOpacity>
//           <TouchableOpacity className="flex-row items-center space-x-1">
//             <FontAwesome5 name="comment" size={20} color="black" />
//             <Text className="text-black font-semibold">{post.commentsCount}</Text>
//           </TouchableOpacity>
//         </View>
//         <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200" />
//       </ScrollView>
//       <NavigationBar />
//     </View>
//   );
// };

// export default FeedDetails;

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import NavigationBar from '../components/NavigationBar';
import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';
import { getLocalStorageObj } from '../utils/LocalStorageUtils';
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';

const FeedDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  // Store the full user object so we can check id and role.
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
      if (userObject) {
        setCurrentUser(userObject);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const feedData = await FeedAPIClient.getById(id.toString());
      if (feedData) {
        setPost(feedData);
      }
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post && currentUser) {
      const userHasLiked = post.usersWhoHaveLiked?.includes(currentUser.id);
      setLiked(userHasLiked);
    }
  }, [post, currentUser]);

  const toggleLike = async () => {
    if (!post || !currentUser) return;

    if (liked) {
      const success = await FeedAPIClient.unlikePost(Number(post.id), currentUser.id);
      if (success) {
        setLiked(false);
        const updatedLikesCount = (post.likesCount ?? 0) - 1;
        const updatedUsersWhoHaveLiked = (post.usersWhoHaveLiked || []).filter(
          (user) => user !== currentUser.id
        );
        setPost({
          ...post,
          likesCount: updatedLikesCount,
          usersWhoHaveLiked: updatedUsersWhoHaveLiked,
        });
      }
    } else {
      const success = await FeedAPIClient.likePost(Number(post.id), currentUser.id);
      if (success) {
        setLiked(true);
        const updatedLikesCount = (post.likesCount ?? 0) + 1;
        const updatedUsersWhoHaveLiked = [
          ...(post.usersWhoHaveLiked || []),
          currentUser.id,
        ];
        setPost({
          ...post,
          likesCount: updatedLikesCount,
          usersWhoHaveLiked: updatedUsersWhoHaveLiked,
        });
      }
    }
  };

  // When delete is clicked, call the API and route back immediately.
  const handleDelete = async () => {
    if (!post) return;
    console.log('Attempting to delete post id:', post.id);
    const success = await FeedAPIClient.deletePost(Number(post.id));
    console.log('Delete success:', success);
    if (success) {
      router.back();
    } else {
      Alert.alert('Error deleting post');
    }
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

  const formattedDate = post.createdAt
    ? new Date(Date.parse(post.createdAt)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date';

  const getUserColor = (name: string): string => {
    const colors = [
      'bg-red-300', 'bg-green-300', 'bg-blue-300',
      'bg-yellow-300', 'bg-purple-300', 'bg-pink-300',
      'bg-indigo-300', 'bg-teal-300', 'bg-orange-300',
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const userInitial = post.author_name ? post.author_name.charAt(0).toUpperCase() : '?';
  const avatarColor = getUserColor(post.author_name || 'Unknown');

  // Determine if the current user can delete the post:
  // either the user is the author or has an admin role.
  const canDelete = currentUser && (currentUser.id === post.authorId || currentUser.role === 'Admin');

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Feed</Text>
        <View className="flex-row items-center space-x-2">
          {canDelete && (
            <TouchableOpacity onPress={handleDelete}>
              <FontAwesome name="trash" size={22} color="red" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome5 name="times" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="p-4">
        <Text className="text-2xl font-bold">{post.title}</Text>
        <View className="flex-row justify-between items-center my-4">
          <View className="flex-row items-center space-x-2">
            <View className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center`}>
              <Text className="text-white font-bold">{userInitial}</Text>
            </View>
            <Text className="text-lg font-semibold">{post.author_name}</Text>
          </View>
          <Text className="text-gray-500">{formattedDate} • {post.centre}</Text>
        </View>
        <Text className="text-gray-700 border-l-4 border-gray-300 pl-4">
          {post.content}
        </Text>
        <View className="mt-6 p-4 border rounded-lg border-gray-300">
          <View className="flex-row justify-between">
            <Text className="font-semibold">Author</Text>
            <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
              <Text className="text-white font-bold">{userInitial}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200">
          <TouchableOpacity onPress={toggleLike} className="flex-row items-center space-x-1">
            <FontAwesome
              name={liked ? 'heart' : 'heart-o'}
              size={22}
              color={liked ? 'red' : 'black'}
            />
            <Text className="text-black font-semibold">{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center space-x-1">
            <FontAwesome5 name="comment" size={20} color="black" />
            <Text className="text-black font-semibold">{post.commentsCount}</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200" />
      </ScrollView>
      <NavigationBar />
    </View>
  );
};

export default FeedDetails;
