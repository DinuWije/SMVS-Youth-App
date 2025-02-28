import React, { useState } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "../APIClients/ArticleAPIClient";
import EntityAPIClient from "../APIClients/EntityAPIClient";
import { getLocalStorageObj } from "@/utils/LocalStorageUtils";
import AUTHENTICATED_USER_KEY from "../constants/AuthConstants";

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
  const [contentBlocks, setContentBlocks] = useState<{ type: string; value: string }[]>([
    { type: "text", value: "" },
  ]);

  // Pick cover image from gallery
  const pickCoverImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setCoverImage(uri);
      }
    } catch (error) {
      console.error("Cover image selection error:", error);
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
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        handleUpdateBlock(index, type, uri);
      }
    } catch (error) {
      console.error("Media selection error:", error);
    }
  };

  // Update content block (text, image, video)
  const handleUpdateBlock = (index: number, type: string, value: string) => {
    const updatedBlocks = [...contentBlocks];
    updatedBlocks[index] = { type, value };
    setContentBlocks(updatedBlocks);
  };

  // Add new content block
  const handleAddBlock = () => {
    setContentBlocks((prev) => [...prev, { type: "text", value: "" }]);
  };

  // Delete content block
  const handleDeleteBlock = (index: number) => {
    setContentBlocks(contentBlocks.filter((_, i) => i !== index));
  };

  // Upload cover image before publishing
  const uploadCoverImageToBackend = async () => {
    if (!coverImage) return null;
    return await uploadImageToBackend(coverImage);
  };

  // Publish article
  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please fill out the title!");
      return;
    }

    const coverFileName = await uploadCoverImageToBackend();
    const formattedContents = await Promise.all(
      contentBlocks.map(async (block, index) => ({
        content_type: block.type,
        content_data: (block.type === "image" || block.type === "video") ? await uploadImageToBackend(block.value) : block.value, // ✅ Only upload images
        position: index + 1,
      }))
    );
    
    const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY)
    if (userObject == null) {
      console.log('Error getting user object')
      return null
    }

    const articlePayload = { title, subtitle, author_id: userObject.id, category, cover_image: coverFileName, contents: formattedContents };
    try {
      const response = await ArticleAPIClient.create(articlePayload);
      if (response) {
        Alert.alert("Success", "Your article has been published!");
        setCoverImage(null);
        setTitle("");
        setCategory("Well-being");
        setContentBlocks([{ type: "text", value: "" }]);
        router.push("/Articles");
      } else {
        throw new Error("Failed to create article");
      }
    } catch (error) {
      console.error("Error publishing article:", error);
      Alert.alert("Error", "Failed to publish article. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView className="flex-1 p-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Create New Article</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Title Field */}
        <Text className="text-base font-semibold mb-2">Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Enter article title" className="border border-gray-300 rounded-lg p-3 text-base mb-4" />

        {/* Subtitle Field */}
        <Text className="text-base font-semibold mb-2">Subtitle</Text>
        <TextInput
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Enter subtitle or short description"
          className="border border-gray-300 rounded-lg p-3 text-base mb-4"
        />

        {/* Cover Image */}
        <Text className="text-base font-semibold mb-2">Cover Image</Text>
        <TouchableOpacity onPress={pickCoverImage} className="border border-gray-300 rounded-lg p-6 items-center justify-center mb-4">
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={{ width: "100%", height: 150, borderRadius: 5 }} />
          ) : (
            <Text className="text-gray-500">Select Cover Image</Text>
          )}
        </TouchableOpacity>

        <Text className="text-base font-semibold mb-1">Category</Text>
        <View className="relative z-10 border border-gray-300 rounded-lg bg-white px-2 py-1 mb-4">
            <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCategory(itemValue)}
                mode="dropdown" // Ensures proper dropdown behavior
                style={{ height: 50, width: '100%' }} // Fix floating issue
                dropdownIconColor="gray" // Optional: Change dropdown icon color
            >
                <Picker.Item label="Well-being" value="Well-being" />
                <Picker.Item label="Health" value="Health" />
                <Picker.Item label="Fitness" value="Fitness" />
                <Picker.Item label="Mindfulness" value="Mindfulness" />
            </Picker>
        </View>

        {/* Content Blocks */}
        <Text className="text-base font-semibold mb-2">Content</Text>
        {contentBlocks.map((block, index) => (
          <View key={index} className="flex-row items-center space-x-2 mb-4">
            {/* Picker for selecting content type */}
            <View className="border border-gray-300 rounded-lg bg-white px-2 py-1" style={{ width: 110, height: 40 }}>
              <Picker
                selectedValue={block.type}
                onValueChange={(val) => handleUpdateBlock(index, val, block.value)}
                mode="dropdown"
                style={{ height: 40, width: "100%" }}
                dropdownIconColor="gray"
              >
                <Picker.Item label="Text" value="text" />
                <Picker.Item label="Image" value="image" />
                <Picker.Item label="Video" value="video" />
              </Picker>
            </View>

            {/* Text Input for Text Blocks */}
            {block.type === "text" ? (
              <TextInput
                className="border border-gray-300 rounded-lg p-3 flex-1"
                placeholder="Enter text content"
                value={block.value}
                onChangeText={(val) => handleUpdateBlock(index, "text", val)}
                style={{ height: 40 }}
              />
            ) : (
              <TouchableOpacity
                className="border border-gray-300 p-3 rounded-lg flex-1 items-center justify-center"
                style={{ height: 40 }}
                onPress={() => pickMedia(index, block.type)}
              >
                {block.value ? (
                  block.type === "video" ? (
                    <Text className="text-green-600 font-bold">Video uploaded!</Text>
                  ) : (
                    <Text className="text-green-600 font-bold">Image uploaded!</Text>
                  )
                ) : (
                  <Text className="text-gray-500">Upload {block.type}</Text>
                )}
              </TouchableOpacity>
            )}

            {/* Delete Button */}
            <TouchableOpacity onPress={() => handleDeleteBlock(index)} style={{ padding: 5 }}>
              <FontAwesome5 name="trash" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ))}


        {/* Add Another Content Block */}
        <TouchableOpacity
          onPress={handleAddBlock}
          className="flex-row items-center justify-center border border-gray-300 p-3 rounded-lg mb-6"
        >
          <Text className="text-gray-600 mr-2">Add Content</Text>
          <FontAwesome5 name="plus" size={16} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePublish} className="bg-purple-500 p-4 rounded-lg items-center mb-6">
          <Text className="text-white text-lg font-bold">Publish</Text>
        </TouchableOpacity>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateArticle;
