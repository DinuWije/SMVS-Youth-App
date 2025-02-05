
//working i think?  

// import React, { useState, useEffect } from 'react';
// import { 
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   KeyboardAvoidingView,
//   Platform
// } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { useRouter } from 'expo-router';
// import { Ionicons, FontAwesome } from '@expo/vector-icons';

// export default function CreateFeed() {
//   const router = useRouter();
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const fetchToken = async () => {
//       try {
//         const storedToken = await AsyncStorage.getItem('jwtToken');
//         if (storedToken) {
//           setToken(storedToken);
//         } else {
//           console.warn("No token found, user might not be authenticated.");
//         }
//       } catch (error) {
//         console.error("Error retrieving token:", error);
//       }
//     };
//     fetchToken();
//   }, []);

//   const handlePost = async () => {
//     if (!title || !description) {
//       console.warn("Error", "All fields must be filled out.");
//       return;
//     }
//     if (!token) {
//       console.warn("Authentication Error", "You need to be logged in to post.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:8080/feeds", {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${token}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           title,
//           content: description
//         })
//       });
//       if (!response.ok) {
//         throw new Error("Failed to create post");
//       }
//       const result = await response.json();
//       console.log("Post Created:", result);

//       // Reset fields
//       setTitle('');
//       setDescription('');

//       // Navigate back to Feed
//       router.push('/Feed');
//     } catch (error) {
//       console.error("Error posting:", error);
//       Alert.alert("Error", "Failed to create post.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       className="flex-1 bg-white p-6"
//     >
//       {/* Header */}
//       <View className="flex-row items-center justify-between mb-4">
//         <TouchableOpacity
//           onPress={() => {
//             // If there's any browser history, go back
//             // otherwise, push /Feed
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
//           {loading ? "Posting..." : "Post"}
//         </Text>
//       </TouchableOpacity>

//       {/* Live Preview */}
//       {(title || description) && (
//         <View className="mt-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
//           <Text className="text-lg font-bold">{title || "Your Post Title"}</Text>
//           <View className="flex-row items-center space-x-2 my-2">
//             <View className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
//               <Text className="text-white font-bold">A</Text>
//             </View>
//             <Text className="text-black font-semibold">Your Name</Text>
//             <Text className="text-gray-500">Nov 15</Text>
//           </View>
//           <Text className="text-gray-700">{description || "Your post description..."}</Text>
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

export default function CreateFeed() {
  const router = useRouter();

  // 1. Hard-coded token (temporarily)
  const HARD_CODED_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImE0MzRmMzFkN2Y3NWRiN2QyZjQ0YjgxZDg1MjMwZWQxN2ZlNTk3MzciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc212cy15b3V0aC1hcHAiLCJhdWQiOiJzbXZzLXlvdXRoLWFwcCIsImF1dGhfdGltZSI6MTczODY5OTc4NiwidXNlcl9pZCI6IjY1SHFMNkR2c2FZdUw3akFjOU51V1dsRjJaQjIiLCJzdWIiOiI2NUhxTDZEdnNhWXVMN2pBYzlOdVdXbEYyWkIyIiwiaWF0IjoxNzM4Njk5Nzg2LCJleHAiOjE3Mzg3MDMzODYsImVtYWlsIjoicHJlZXRtYWthbmkxK3Rlc3RAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInByZWV0bWFrYW5pMSt0ZXN0QGdtYWlsLmNvbSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.O7_bAHE1IVMJrRzQiHjyDcnehTsPRQiVTM71VXy-k_sB_sn9i-OsQHq3HdqfinDrw8KJIDzX9T_VKtBzYXcPfjP7VStl0yEiYoDOFU-LddwQywQONPioYvDrKIJV7Pylc6zS6o1hQmDhW3rykbqOvHbU3QIBNzLFqPVE7R5T4XQYjPuNfJbeauX9PRIa2RAaQTP7PWeGV8hIvdDB3dUpWOm5R5p-NqgKdvpaeng_DFElClKpdSJbgErf2hmaRu4xP3V_eXG02FzLYbriu-mxBWDWq-ldiQ7I993XY4G4q-6740H9yqSBqIIq69OSL_PxIEsQunIxXiICmb7-4v0jMg"; // put your token here, e.g. "eyJhbGciOiJ..." 

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // 2. Keep original token logic
  const [token, setToken] = useState<string | null>(null);
  const [fetchingToken, setFetchingToken] = useState(true);

  useEffect(() => {
    // 3. If the hard-coded token is non-empty, use that
    if (HARD_CODED_TOKEN !== "") {
      console.log("Using hard-coded token:", HARD_CODED_TOKEN);
      setToken(HARD_CODED_TOKEN);
      setFetchingToken(false);
    } else {
      // Otherwise fetch token from AsyncStorage
      const fetchToken = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('jwtToken');
          if (storedToken) {
            console.log('Token found in AsyncStorage:', storedToken);
            setToken(storedToken);
          } else {
            console.warn('No token found; user not authenticated.');
            // Optionally redirect or do something else
            // router.replace('/Feed');
          }
        } catch (error) {
          console.error('Error retrieving token:', error);
        } finally {
          setFetchingToken(false);
        }
      };
      fetchToken();
    }
  }, []);

  const handlePost = async () => {
    if (!title || !description) {
      Alert.alert('Error', 'All fields must be filled out.');
      return;
    }

    if (!token) {
      Alert.alert('Authentication Error', 'You need to be logged in to post.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/feeds', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer scheme
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content: description,
          author_id: 4,
          centre: "Toronto",
          likes_count: 0,
          users_who_have_liked: [],
          comments_count: 0,
          views_count: 0
        }),
      });
      
      if (!response.ok) {
        // Could be a 401 if token is invalid/expired
        throw new Error(`Failed to create post: ${response.status}`);
      }

      const result = await response.json();
      console.log('Post Created:', result);

      // Reset fields
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

  // If we are still fetching the token from AsyncStorage, show a spinner
  if (fetchingToken) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white p-6"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <TouchableOpacity
          onPress={() => {
            // If there's any browser history, go back
            // otherwise, push /Feed
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
              <Text className="text-white font-bold">A</Text>
            </View>
            <Text className="text-black font-semibold">Your Name</Text>
            <Text className="text-gray-500">Nov 15</Text>
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
