import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Animated,
  Platform
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';
import FeedAPIClient, { FeedResponse } from '@/APIClients/FeedAPIClient';
import { getLocalStorageObj } from '../utils/LocalStorageUtils';
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';

// Shimmer placeholder for loading state
const ShimmerPlaceholder = () => {
  const translateX = new Animated.Value(-100);
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    
    return () => animation.stop();
  }, []);
  
  return (
    <View className="flex-row items-center p-4 border-b-4 border-gray-200 mb-4">
      <View className="flex-1">
        <View className="w-3/4 h-5 bg-gray-200 rounded mb-2" />
        <View className="w-1/2 h-4 bg-gray-200 rounded" />
      </View>
      <View className="w-8 h-8 rounded-full bg-gray-200">
        <Animated.View
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            backgroundColor: 'rgba(255,255,255,0.5)',
            transform: [{ translateX }],
          }}
        />
      </View>
    </View>
  );
};

const Feed = () => {
  const router = useRouter();
  const [posts, setPosts] = useState<FeedResponse[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<{ [key: number]: boolean }>({});
  const [fadeAnim] = useState(new Animated.Value(0));

  const fetchFeed = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) setLoading(true);
      
      // 1. Get the user from local storage
      const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
      if (userObject && userObject.id) {
        setUserId(userObject.id);
      }
      
      // 2. Fetch feed data
      const feedData = await FeedAPIClient.getAll();
      if (feedData) {
        // Sort posts by creation date (newest first)
        const sortedPosts = [...feedData].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setPosts(sortedPosts);

        const initialLikedState: { [key: number]: boolean } = {};

        // 3. Initialize each post's "liked" state
        sortedPosts.forEach(post => {
          initialLikedState[post.id] = Array.isArray(post.usersWhoHaveLiked)
            ? post.usersWhoHaveLiked.map(String).includes(String(userObject?.id))
            : false;
        });

        setLikedPosts(initialLikedState);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
      if (isRefreshing) setRefreshing(false);
    }
  }, [fadeAnim]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed(true);
  }, [fetchFeed]);

  const toggleLike = async (postId: number, event?: any) => {
    // Prevent event propagation to parent (if available)
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    
    if (!userId) return;
    
    // Get the current post
    const post = posts?.find(p => p.id === postId);
    if (!post) return;

    const isCurrentlyLiked = likedPosts[postId] || false;

    // Create an updated post object with new like state
    const updatedPost = { ...post };
    
    // Update usersWhoHaveLiked and likesCount in the post object
    if (isCurrentlyLiked) {
      // Removing like
      updatedPost.usersWhoHaveLiked = (post.usersWhoHaveLiked || [])
        .filter(id => id !== userId);
      updatedPost.likesCount = (post.likesCount || 0) > 0 ? 
        (post.likesCount || 0) - 1 : 0;
    } else {
      // Adding like
      updatedPost.usersWhoHaveLiked = [
        ...(post.usersWhoHaveLiked || []),
        userId
      ];
      updatedPost.likesCount = (post.likesCount || 0) + 1;
    }

    // Optimistically update UI state
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !isCurrentlyLiked
    }));
    
    // Update post in the posts array
    setPosts(prevPosts => 
      prevPosts?.map(p => p.id === postId ? updatedPost : p) || null
    );

    try {
      // Make the API call
      if (isCurrentlyLiked) {
        await FeedAPIClient.unlikePost(postId, userId);
      } else {
        await FeedAPIClient.likePost(postId, userId);
      }
    } catch (error) {
      console.error(`Error updating like for post ${postId}:`, error);
      // Revert UI changes if the request fails
      setLikedPosts(prev => ({ ...prev, [postId]: isCurrentlyLiked }));
      setPosts(prevPosts => 
        prevPosts?.map(p => p.id === postId ? post : p) || null
      );
    }
  };

  const navigateToPostDetails = (postId: number) => {
    router.push({
      pathname: '/FeedDetails',
      params: { id: postId.toString() },
    });
  };

  const getUserColor = (name: string): string => {
    const colors = [
      'bg-purple-400', 'bg-blue-400', 'bg-green-400',
      'bg-yellow-400', 'bg-orange-400', 'bg-red-400',
      'bg-indigo-400', 'bg-pink-400', 'bg-teal-400',
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const renderPostItem = ({ item }: { item: FeedResponse }) => {
    const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const authorName = item.author_name || 'Unknown';
    const userInitial = authorName.charAt(0).toUpperCase();
    const avatarColor = getUserColor(authorName);
    const isLiked = likedPosts[item.id] || false;
    
    // Create a teaser from a longer content
    const contentPreview = item.content && item.content.length > 80 
      ? `${item.content.substring(0, 80)}...` 
      : item.content;

    // Get actual counts from the post data
    const likesCount = item.likesCount || 0;
    const commentsCount = item.commentsCount || 0;

    return (
      <Animated.View 
        style={{ opacity: fadeAnim }}
        className="bg-white mb-6 rounded-lg overflow-hidden shadow-md border border-gray-200"
      >
        {/* Card Header with Author Info */}
        <View className="flex-row items-center p-3 border-b border-gray-200">
          <View className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center mr-3`}>
            <Text className="text-white font-bold text-lg">{userInitial}</Text>
          </View>
          <View className="flex-1">
            <Text className="font-medium text-gray-800">{authorName}</Text>
            <Text className="text-xs text-gray-500">{formattedDate}</Text>
          </View>
        </View>
        
        {/* Card Content - Make it very obvious this is clickable */}
        <TouchableOpacity
          className="p-4 border border-gray-300 active:bg-gray-100"
          onPress={() => navigateToPostDetails(item.id)}
          activeOpacity={0.6}
        >
          <Text className="text-lg font-semibold mb-2">{item.title}</Text>
          {contentPreview && (
            <Text className="text-gray-600 mb-2">{contentPreview}</Text>
          )}
          
          {/* Optional Tag or Category */}
          {item.type && (
            <View className="bg-purple-50 self-start rounded-full px-3 py-1 mt-1">
              <Text className="text-purple-600 text-xs font-medium">{item.type}</Text>
            </View>
          )}
          
          {/* Prominent "Read More" button */}
          <View className="mt-3 flex-row justify-end">
            <View className="bg-purple-100 rounded-full px-4 py-2 flex-row items-center">
              <Text className="text-purple-700 font-medium mr-1">Read More</Text>
              <Ionicons name="arrow-forward" size={16} color="#7c3aed" />
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Card Footer with Actions */}
        <View className="flex-row items-center justify-between px-3 py-3 border-b border-gray-400">
          <TouchableOpacity 
            className="flex-row items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full" 
            onPress={(e) => toggleLike(item.id, e)}
          >
            <FontAwesome
              name={isLiked ? 'heart' : 'heart-o'}
              size={18}
              color={isLiked ? '#e53e3e' : '#666'}
            />
            <Text className="ml-1 text-gray-800 font-medium text-sm">
              {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full"
            onPress={() => navigateToPostDetails(item.id)}
          >
            <FontAwesome name="comment-o" size={18} color="#666" />
            <Text className="ml-1 text-gray-800 font-medium text-sm">
              {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
            </Text>
          </TouchableOpacity>
          
          {/* <TouchableOpacity className="flex-row items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full">
            <FontAwesome name="share" size={18} color="#666" />
            <Text className="ml-1 text-gray-800 font-medium text-sm">Share</Text>
          </TouchableOpacity> */}
        </View>
      </Animated.View>
    );
  };

  const renderEmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="newspaper-outline" size={60} color="#d1d5db" />
      <Text className="text-gray-400 font-medium mt-4 text-lg">No posts yet</Text>
      <Text className="text-gray-400 text-center mt-2 px-10">
        Be the first to share something with the community!
      </Text>
      <TouchableOpacity 
        className="mt-6 bg-purple-600 px-6 py-2 rounded-full"
        onPress={() => router.push('/CreateFeed')}
      >
        <Text className="text-white font-medium">Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="p-4 bg-white border-b-2 border-gray-300 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-800">Community Feed</Text>
        </View>
      </View>

      {/* Loading State */}
      {loading && !refreshing ? (
        <View className="flex-1 px-4 py-2">
          {[1, 2, 3, 4].map((_, index) => (
            <ShimmerPlaceholder key={index} />
          ))}
        </View>
      ) : (
        /* Feed List */
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPostItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#8b5cf6']}
              tintColor="#8b5cf6"
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          ItemSeparatorComponent={() => (
            <View className="h-6" /> // Additional spacing between items
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-20 right-5 bg-purple-600 p-4 rounded-full shadow-lg flex items-center justify-center"
        onPress={() => router.push('/CreateFeed')}
        style={Platform.OS === 'web' ? { zIndex: 1000 } : {}}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </View>
  );
};

export default Feed;
