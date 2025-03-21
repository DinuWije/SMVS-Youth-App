import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // State for comments
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState<string>("");

  // A ref to focus the comment input
  const commentInputRef = useRef<TextInput | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
      if (userObject) {
        setCurrentUser(userObject);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch the feed post
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

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      const data = await FeedAPIClient.getComments(Number(id));
      if (data) {
        setComments(data);
      }
    };
    fetchComments();
  }, [id]);

  // Determine if current user has liked
  useEffect(() => {
    if (post && currentUser) {
      const userHasLiked = post.usersWhoHaveLiked?.includes(currentUser.id);
      setLiked(userHasLiked);
    }
  }, [post, currentUser]);

  // Like / Unlike
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

  // Delete the entire post
  const handleDelete = async () => {
    if (!post) return;
    const success = await FeedAPIClient.deletePost(Number(post.id));
    if (success) {
      router.back();
    } else {
      Alert.alert('Error deleting post');
    }
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!currentUser || !id || !newComment.trim()) return;

    const success = await FeedAPIClient.addComment(
      Number(id),
      currentUser.id,
      newComment.trim()
    );

    if (success) {
      setNewComment("");
      // Optionally increment local comment count
      if (post) {
        const updatedPost = { ...post, commentsCount: post.commentsCount + 1 };
        setPost(updatedPost);
      }
      // Refetch comments
      const data = await FeedAPIClient.getComments(Number(id));
      if (data) setComments(data);
    } else {
      Alert.alert("Error adding comment");
    }
  };

  // Delete a specific comment
  const handleDeleteComment = async (commentId: number) => {
    if (!id) return;
    const success = await FeedAPIClient.deleteComment(Number(id), commentId);
    if (success) {
      // Re-fetch comments
      const updated = await FeedAPIClient.getComments(Number(id));
      if (updated) setComments(updated);
    } else {
      Alert.alert("Error", "Unable to delete comment");
    }
  };

  // Focus comment input
  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  // Loading spinner
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text>Loading post...</Text>
      </View>
    );
  }

  // If post not found
  if (!post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500 text-lg">Post not found.</Text>
      </View>
    );
  }

  // Format the post's date
  const formattedDate = post.createdAt
    ? new Date(Date.parse(post.createdAt)).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown Date';

  // Color scheme for the first letter
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
  const canDeletePost =
    currentUser && (currentUser.id === post.authorId || currentUser.role === 'Admin');

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Feed</Text>
        <View className="flex-row items-center space-x-2">
          {canDeletePost && (
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
        {/* Post Title & Author */}
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

        {/* Post Content */}
        <Text className="text-gray-700 border-l-4 border-gray-300 pl-4">
          {post.content}
        </Text>

        {/* Stats Section */}
        <View className="mt-6 p-4 border rounded-lg border-gray-300">
          <View className="flex-row justify-between">
            <Text className="font-semibold">Author</Text>
            <View className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center`}>
              <Text className="text-white font-bold">{userInitial}</Text>
            </View>
          </View>
        </View>

        {/* Like & Comment Stats */}
        <View className="flex-row justify-around mt-6 border-t pt-4 border-gray-200">
          <TouchableOpacity onPress={toggleLike} className="flex-row items-center space-x-1">
            <FontAwesome
              name={liked ? 'heart' : 'heart-o'}
              size={22}
              color={liked ? 'red' : 'black'}
            />
            <Text className="text-black font-semibold">{post.likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={focusCommentInput} className="flex-row items-center space-x-1">
            <FontAwesome5 name="comment" size={20} color="black" />
            <Text className="text-black font-semibold">{post.commentsCount}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <Text className="text-xl font-bold mt-8 mb-2">Comments</Text>
        {comments.length === 0 ? (
          <Text className="text-gray-500">No comments yet.</Text>
        ) : (
          comments.map((c) => {
            // commenter_name is returned by getComments; fallback if missing
            const commenterName = c.commenter_name || `User ${c.userId}`;
            // Format the comment date
            const commentDate = c.createdAt
              ? new Date(Date.parse(c.createdAt)).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              : 'Unknown Date';

            // For the avatar color and initial, we can base it on commenterName
            const color = getUserColor(commenterName);
            const initial = commenterName.charAt(0).toUpperCase();

            // Determine if current user can delete THIS comment
            const canDeleteComment =
              currentUser &&
              (currentUser.role === 'Admin' || currentUser.id === c.userId);

            return (
              <View key={c.id} className="py-3 border-b border-gray-200">
                {/* Row with avatar, name on left, date & trash icon on right */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center space-x-2">
                    {/* Avatar */}
                    <View className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}>
                      <Text className="text-white font-bold">{initial}</Text>
                    </View>
                    {/* Commenter Name */}
                    <Text className="font-semibold text-gray-800">{commenterName}</Text>
                  </View>
                  <View className="flex-row items-center space-x-3">
                    {/* Comment Date */}
                    <Text className="text-gray-500 text-sm">{commentDate}</Text>
                    {/* Delete icon if allowed */}
                    {canDeleteComment && (
                      <TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
                        <FontAwesome name="trash" size={18} color="red" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Comment Text */}
                <Text className="mt-2 ml-10 text-gray-700">{c.content}</Text>
              </View>
            );
          })
        )}

        {/* Add Comment Input */}
        <View className="flex-row items-center mt-4">
          <TextInput
            ref={commentInputRef}
            className="flex-1 border border-gray-300 rounded p-2"
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity
            className="bg-blue-500 p-2 ml-2 rounded"
            onPress={handleAddComment}
          >
            <Text className="text-white text-center">Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <NavigationBar />
    </View>
  );
};

export default FeedDetails;
