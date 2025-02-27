// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons, FontAwesome } from '@expo/vector-icons';

// // Import Feed & Settings API Clients
// import FeedAPIClient from '@/APIClients/FeedAPIClient';
// import SettingsAPIClient, { SettingsUserInfoResponse } from '@/APIClients/SettingsAPIClient';

// export default function CreateFeed() {
//   const router = useRouter();

//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [userInfo, setUserInfo] = useState<SettingsUserInfoResponse | null>(null);
//   const [fetchingUser, setFetchingUser] = useState(true);

//   // Fetch user details from the DB (author_id & centre)
//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const user = await SettingsAPIClient.get();
//         if (user && user.length > 0) {
//           setUserInfo(user[0]); // Assume first user returned is the logged-in user
//         } else {
//           console.warn('User info not found');
//         }
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//       } finally {
//         setFetchingUser(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handlePost = async () => {
//     if (!title || !description) {
//       Alert.alert('Error', 'All fields must be filled out.');
//       return;
//     }

//     if (!userInfo) {
//       Alert.alert('Error', 'User information not loaded. Try again.');
//       return;
//     }

//     setLoading(true);
//     console.log('Posting feed...');

//     try {
//       const response = await FeedAPIClient.create({
//         title,
//         content: description,
//         author_id: userInfo.id, 
//         centre: userInfo.location, 
//         likes_count: 0,
//         users_who_have_liked: [],
//         comments_count: 0,
//         views_count: 0,
//       });

//       if (!response) {
//         throw new Error('Failed to create post');
//       }

//       console.log('Post Created:', response);
//       setTitle('');
//       setDescription('');

//       // Navigate back to Feed
//       router.push('/Feed');
//     } catch (error) {
//       console.error('Error posting:', error);
//       Alert.alert('Error', 'Failed to create post.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (fetchingUser) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//         <Text>Loading user data...</Text>
//       </View>
//     );
//   }

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       className="flex-1 bg-white p-6"
//     >
//       {/* Header */}
//       <View className="flex-row items-center justify-between mb-4">
//         <TouchableOpacity
//           onPress={() => {
//             if (window.history.length > 1) {
//               router.back();
//             } else {
//               router.push('/Feed');
//             }
//           }}
//         >
//           <Ionicons name="arrow-back" size={28} color="black" />
//         </TouchableOpacity>
//         <Text className="text-2xl font-bold">Create Post</Text>
//         <View style={{ width: 28 }} />
//       </View>

//       {/* Input Fields */}
//       <View className="space-y-4">
//         <TextInput
//           className="border border-gray-300 rounded-lg p-3 text-lg"
//           placeholder="Enter title..."
//           value={title}
//           onChangeText={setTitle}
//         />
//         <TextInput
//           className="border border-gray-300 rounded-lg p-3 text-lg h-24"
//           placeholder="Enter description..."
//           value={description}
//           onChangeText={setDescription}
//           multiline
//         />
//       </View>

//       {/* Post Button */}
//       <TouchableOpacity
//         className={`mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-500'} p-4 rounded-lg flex items-center`}
//         onPress={handlePost}
//         disabled={loading}
//       >
//         <Text className="text-white text-lg font-bold">
//           {loading ? 'Posting...' : 'Post'}
//         </Text>
//       </TouchableOpacity>

//       {/* Live Preview */}
//       {(title || description) && (
//         <View className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
//           <Text className="text-lg font-bold">
//             {title || 'Your Post Title'}
//           </Text>
//           <View className="flex-row items-center space-x-2 my-2">
//             <View className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
//               <Text className="text-white font-bold">A</Text>
//             </View>
//             <Text className="text-black font-semibold">Your Name</Text>
//             <Text className="text-gray-500">Nov 15</Text>
//           </View>
//           <Text className="text-gray-700">
//             {description || 'Your post description...'}
//           </Text>
//           <View className="flex-row justify-around mt-4">
//             <TouchableOpacity>
//               <FontAwesome name="comment-o" size={22} color="black" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <FontAwesome name="heart-o" size={22} color="black" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <FontAwesome name="link" size={22} color="black" />
//             </TouchableOpacity>
//             <TouchableOpacity>
//               <FontAwesome name="bookmark-o" size={22} color="black" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </KeyboardAvoidingView>
//   );
// }


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

// Import Feed & Settings API Clients
import FeedAPIClient from '@/APIClients/FeedAPIClient';
import SettingsAPIClient, { SettingsUserInfoResponse } from '@/APIClients/SettingsAPIClient';

export default function CreateFeed() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<SettingsUserInfoResponse | null>(null);
  const [fetchingUser, setFetchingUser] = useState(true);

  // Fetch user details from the DB (author_id & centre)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await SettingsAPIClient.get();
        if (user && user.length > 0) {
          setUserInfo(user[0]); // Assume first user returned is the logged-in user
        } else {
          console.warn('User info not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePost = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'All fields must be filled out.');
      return;
    }

    if (!userInfo) {
      Alert.alert('Error', 'User information not loaded. Try again.');
      return;
    }

    setLoading(true);
    console.log('Posting feed...');

    try {
      const response = await FeedAPIClient.create({
        title,
        content: description,
        author_id: userInfo.id, // Dynamically fetched user ID
        centre: userInfo.location, // Dynamically fetched center
        likes_count: 0,
        users_who_have_liked: [],
        comments_count: 0,
        views_count: 0,
      });

      if (!response) {
        throw new Error('Failed to create post');
      }

      console.log('Post Created:', response);
      setTitle('');
      setDescription('');

      // Navigate back to Feed
      router.push('/Feed');
    } catch (error) {
      console.error('Error posting:', error);
      Alert.alert('Error', 'Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  // Format the current date as "Month Day" (e.g., "Feb 24")
  const todayDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white p-6"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/Feed');
            }
          }}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">Create Post</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Input Fields */}
      <View className="space-y-4">
        <TextInput
          className="border border-gray-300 rounded-lg p-3 text-lg"
          placeholder="Enter title..."
          value={title}
          onChangeText={setTitle}
        />
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
        className={`mt-6 ${loading ? 'bg-gray-400' : 'bg-blue-500'} p-4 rounded-lg flex items-center`}
        onPress={handlePost}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold">
          {loading ? 'Posting...' : 'Post'}
        </Text>
      </TouchableOpacity>

      {/* Live Preview */}
      {(title || description) && (
        <View className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <Text className="text-lg font-bold">
            {title || 'Your Post Title'}
          </Text>
          <View className="flex-row items-center space-x-2 my-2">
            <View className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
              <Text className="text-white font-bold">
                {userInfo?.firstName ? userInfo.firstName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <Text className="text-black font-semibold">
              {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'User Name'}
            </Text>
            <Text className="text-gray-500">{todayDate}</Text>
          </View>
          <Text className="text-gray-700">
            {description || 'Your post description...'}
          </Text>
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
}
