import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "../APIClients/ArticleAPIClient";
import EntityAPIClient from "../APIClients/EntityAPIClient";
import { getLocalStorageObj } from "@/utils/LocalStorageUtils";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";

const { width } = Dimensions.get('window');

/**
 * This screen allows users to:
 * 1. Enter an article title & subtitle
 * 2. Pick or upload a cover image
 * 3. Select a category
 * 4. Add multiple "content blocks" (text, image, video)
 * 5. Publish the article
 */
const CreateArticle = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [category, setCategory] = useState("Well-being");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<{ type: string; value: string; uploading?: boolean }[]>([
    { type: "text", value: "" },
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setPermissions(status === 'granted');
      
      // Get user ID
      const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
      if (userObject && userObject.id) {
        setUserId(userObject.id);
      }
    })();
  }, []);

  // Pick cover image from gallery
  const pickCoverImage = async () => {
    if (!permissions) {
      Alert.alert(
        "Permission Required",
        "We need access to your media library to select images.",
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setCoverImage(uri);
      }
    } catch (error) {
      console.error("Cover image selection error:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  };

  // Upload image to backend
  const uploadImageToBackend = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("body", JSON.stringify({}));
      formData.append("file", blob, "upload.jpg");
      const backendResponse = await EntityAPIClient.create({ formData });
      if (backendResponse?.fileName) {
        return backendResponse.fileName;
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return null;
    }
  };
  
  // Select image or video for content blocks
  const pickMedia = async (index: number, type: string) => {
    if (!permissions) {
      Alert.alert(
        "Permission Required",
        "We need access to your media library to select media.",
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        
        // Mark this block as uploading
        const updatedBlocks = [...contentBlocks];
        updatedBlocks[index] = { ...updatedBlocks[index], value: uri, uploading: true };
        setContentBlocks(updatedBlocks);
        
        // Upload immediately for better UX
        try {
          const fileName = await uploadImageToBackend(uri);
          if (fileName) {
            // Update with the stored filename for backend reference
            updatedBlocks[index] = { type, value: uri, uploading: false, fileName };
            setContentBlocks(updatedBlocks);
          } else {
            throw new Error("Upload failed");
          }
        } catch (uploadError) {
          console.error("Media upload failed:", uploadError);
          Alert.alert("Upload Failed", "Could not upload media. Please try again.");
          // Reset the block's uploading state
          updatedBlocks[index] = { ...updatedBlocks[index], uploading: false };
          setContentBlocks(updatedBlocks);
        }
      }
    } catch (error) {
      console.error("Media selection error:", error);
      Alert.alert("Error", "Failed to select media. Please try again.");
    }
  };

  // Update content block (text, image, video)
  const handleUpdateBlock = (index: number, type: string, value: string) => {
    const updatedBlocks = [...contentBlocks];
    if (type !== updatedBlocks[index].type && (type === 'image' || type === 'video')) {
      // If switching from text to media, clear the value
      updatedBlocks[index] = { type, value: "" };
    } else if (type !== updatedBlocks[index].type && type === 'text') {
      // If switching from media to text, clear the value
      updatedBlocks[index] = { type, value: "" };
    } else {
      // Otherwise just update the value
      updatedBlocks[index] = { ...updatedBlocks[index], type, value };
    }
    setContentBlocks(updatedBlocks);
  };

  // Add new content block
  const handleAddBlock = () => {
    setContentBlocks((prev) => [...prev, { type: "text", value: "" }]);
  };

  // Delete content block
  const handleDeleteBlock = (index: number) => {
    if (contentBlocks.length === 1) {
      // Don't allow deleting the last block, just clear it
      setContentBlocks([{ type: "text", value: "" }]);
      return;
    }
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  // Upload cover image before publishing
  const uploadCoverImageToBackend = async () => {
    if (!coverImage) return null;
    return await uploadImageToBackend(coverImage);
  };

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your article.");
      return false;
    }
    
    if (!coverImage) {
      Alert.alert("Error", "Please select a cover image for your article.");
      return false;
    }
    
    // Check if there's at least one content block with data
    const hasContent = contentBlocks.some(block => block.value.trim() !== "");
    if (!hasContent) {
      Alert.alert("Error", "Please add some content to your article.");
      return false;
    }
    
    return true;
  };

  // Publish article
  const handlePublish = async () => {
    if (!validateForm()) return;
    if (!userId) {
      Alert.alert("Error", "You must be logged in to publish an article.");
      return;
    }
    
    try {
      setIsPublishing(true);
      
      // Upload cover image
      const coverFileName = await uploadCoverImageToBackend();
      if (!coverFileName) {
        throw new Error("Failed to upload cover image");
      }
      
      // Prepare contents - reuse already uploaded media where possible
      const formattedContents = contentBlocks
        .filter(block => block.value.trim() !== "") // Skip empty blocks
        .map((block, index) => ({
          content_type: block.type,
          content_data: block.type === "text" ? block.value : block.fileName || "", // Use already uploaded filename if available
          position: index + 1,
        }));
      
      // Create article payload
      const articlePayload = { 
        title, 
        subtitle, 
        author_id: userId, 
        centre: category, 
        cover_image: coverFileName, 
        contents: formattedContents 
      };
      
      // Submit to API
      const response = await ArticleAPIClient.create(articlePayload);
      if (response) {
        Alert.alert(
          "Success", 
          "Your article has been published!",
          [{ 
            text: "OK", 
            onPress: () => router.push("/Articles") 
          }]
        );
      } else {
        throw new Error("Failed to create article");
      }
    } catch (error) {
      console.error("Error publishing article:", error);
      Alert.alert("Error", "Failed to publish article. Please try again.");
    } finally {
      setIsPublishing(false);
    }

    try {
      router.back();
    } catch (error) {
      router.push('/Articles'); 
    }
  };

  const renderContentBlock = (block: { type: string; value: string; uploading?: boolean }, index: number) => {
    return (
      <View key={index} className="mb-6 border border-gray-200 rounded-lg p-3 bg-white shadow-sm">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="font-semibold text-gray-700">Block {index + 1}</Text>
          <TouchableOpacity 
            onPress={() => handleDeleteBlock(index)}
            className="bg-red-100 p-2 rounded-full"
          >
            <FontAwesome5 name="trash" size={16} color="#e53e3e" />
          </TouchableOpacity>
        </View>
        
        {/* Content Type Selector */}
        <View className="flex-row flex-wrap items-center mb-3 bg-gray-50 p-1 rounded-lg">
          <TouchableOpacity 
            className={`px-3 py-2 rounded-md mr-2 ${block.type === 'text' ? 'bg-purple-500' : 'bg-gray-200'}`}
            onPress={() => handleUpdateBlock(index, 'text', block.type === 'text' ? block.value : '')}
          >
            <Text className={block.type === 'text' ? 'text-white' : 'text-gray-700'}>Text</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-3 py-2 rounded-md mr-2 ${block.type === 'image' ? 'bg-purple-500' : 'bg-gray-200'}`}
            onPress={() => handleUpdateBlock(index, 'image', block.type === 'image' ? block.value : '')}
          >
            <Text className={block.type === 'image' ? 'text-white' : 'text-gray-700'}>Image</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`px-3 py-2 rounded-md ${block.type === 'video' ? 'bg-purple-500' : 'bg-gray-200'}`}
            onPress={() => handleUpdateBlock(index, 'video', block.type === 'video' ? block.value : '')}
          >
            <Text className={block.type === 'video' ? 'text-white' : 'text-gray-700'}>Video</Text>
          </TouchableOpacity>
        </View>
        
        {/* Content Input */}
        {block.type === "text" ? (
          <TextInput
            className="border border-gray-200 rounded-lg p-3 bg-gray-50 min-h-[100px] text-base"
            placeholder="Enter your text content here..."
            value={block.value}
            onChangeText={(val) => handleUpdateBlock(index, "text", val)}
            multiline
            textAlignVertical="top"
          />
        ) : (
          <View>
            {block.uploading ? (
              <View className="h-[100px] bg-gray-100 rounded-lg items-center justify-center">
                <ActivityIndicator size="small" color="#8e44ad" />
                <Text className="mt-2 text-gray-600">Uploading...</Text>
              </View>
            ) : block.value ? (
              <View>
                <Image 
                  source={{ uri: block.value }} 
                  style={{ width: '100%', height: 150, borderRadius: 8 }} 
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  className="absolute top-2 right-2 bg-white p-1 rounded-full"
                  onPress={() => handleUpdateBlock(index, block.type, '')}
                >
                  <Ionicons name="close-circle" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                className="h-[100px] bg-gray-100 rounded-lg items-center justify-center border-dashed border-2 border-gray-300"
                onPress={() => pickMedia(index, block.type)}
              >
                <MaterialIcons name={block.type === "image" ? "add-photo-alternate" : "video-library"} size={30} color="#8e44ad" />
                <Text className="mt-2 text-gray-600">
                  {block.type === "image" ? "Add Image" : "Add Video"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 bg-gray-50"
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      {/* Header */}
      <View className="bg-white border-b border-gray-200 p-4 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => {
              // Confirm if user wants to discard changes
              if (title || subtitle || coverImage || contentBlocks.some(b => b.value)) {
                Alert.alert(
                  "Discard Changes?",
                  "You have unsaved changes. Are you sure you want to go back?",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Discard", onPress: () => router.back() }
                  ]
                );
              } else {
                router.back();
              }
            }}
            className="p-2" 
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Create Article</Text>
          <TouchableOpacity 
            className={`p-2 rounded-full ${isPublishing ? 'bg-gray-200' : 'bg-purple-100'}`}
            onPress={handlePublish}
            disabled={isPublishing}
          >
            <Ionicons name="checkmark" size={24} color={isPublishing ? "#999" : "#8e44ad"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* Title & Subtitle */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Text className="text-base font-semibold mb-2 text-gray-700">Title</Text>
          <TextInput 
            value={title} 
            onChangeText={setTitle} 
            placeholder="Enter article title" 
            className="border border-gray-200 rounded-lg p-3 text-base mb-4 bg-gray-50"
            maxLength={100}
          />
          
          <Text className="text-base font-semibold mb-2 text-gray-700">Subtitle</Text>
          <TextInput
            value={subtitle}
            onChangeText={setSubtitle}
            placeholder="Enter subtitle or short description"
            className="border border-gray-200 rounded-lg p-3 text-base mb-2 bg-gray-50"
            maxLength={200}
          />
          <Text className="text-xs text-gray-500 text-right">{subtitle.length}/200</Text>
        </View>

        {/* Cover Image */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Text className="text-base font-semibold mb-2 text-gray-700">Cover Image</Text>
          <TouchableOpacity 
            onPress={pickCoverImage} 
            className={`border-2 ${coverImage ? 'border-gray-200' : 'border-dashed border-gray-300'} rounded-lg p-4 items-center justify-center mb-2`}
            style={{ height: 170 }}
          >
            {coverImage ? (
              <Image 
                source={{ uri: coverImage }} 
                style={{ width: '100%', height: '100%', borderRadius: 8 }} 
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <MaterialIcons name="add-photo-alternate" size={40} color="#8e44ad" />
                <Text className="mt-2 text-gray-600">Select Cover Image</Text>
                <Text className="text-xs text-gray-500 mt-1">(16:9 ratio recommended)</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <Text className="text-base font-semibold mb-2 text-gray-700">Category</Text>
          <View className="border border-gray-200 rounded-lg bg-gray-50 px-2">
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              mode="dropdown"
              style={{ height: 50, width: '100%' }}
              dropdownIconColor="gray"
            >
              <Picker.Item label="Well-being" value="Well-being" />
              <Picker.Item label="Health" value="Health" />
              <Picker.Item label="Fitness" value="Fitness" />
              <Picker.Item label="Mindfulness" value="Mindfulness" />
              <Picker.Item label="Nutrition" value="Nutrition" />
              <Picker.Item label="Lifestyle" value="Lifestyle" />
            </Picker>
          </View>
        </View>

        {/* Content Blocks */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-gray-700">Content Blocks</Text>
            <TouchableOpacity 
              onPress={handleAddBlock}
              className="bg-purple-100 p-2 rounded-full"
            >
              <Ionicons name="add" size={22} color="#8e44ad" />
            </TouchableOpacity>
          </View>
          
          {contentBlocks.map(renderContentBlock)}
        </View>

        {/* Publish Button */}
        <TouchableOpacity 
          onPress={handlePublish} 
          className={`${isPublishing ? 'bg-purple-300' : 'bg-purple-600'} p-4 rounded-lg items-center mb-20`}
          disabled={isPublishing}
        >
          {isPublishing ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">Publishing...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">Publish Article</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateArticle;
