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
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "../APIClients/ArticleAPIClient";
import EntityAPIClient from "../APIClients/EntityAPIClient";


/**
 * This screen allows users to:
 * 1. Enter an article title & subtitle
 * 2. Pick or upload a cover image (placeholder shown)
 * 3. Select a category
 * 4. Add multiple "content blocks" (text or image)
 * 5. Publish the article (console.log + alert in this demo)
 */
const CreateArticle = () => {
  const router = useRouter();

  // Basic article info
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Well-being');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const pickCoverImage = async () => {
    try {
      let result;
  
      if (Platform.OS === "web") {
        // ✅ Use DocumentPicker for web (laptops)
        result = await DocumentPicker.getDocumentAsync({
          type: "image/*",
        });
      } else {
        // ✅ Use ImagePicker for mobile (iOS/Android)
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      }
  
      if (result?.assets?.[0]?.uri) {
        setCoverImage(result.assets[0].uri); // ✅ Store local URI (upload on publish)
      }
    } catch (error) {
      console.error("Cover image selection error:", error);
    }
  };
  
  // Upload the cover image on publish
  const uploadCoverImageToBackend = async () => {
    if (!coverImage) return null;
  
    try {
      const response = await fetch(coverImage);
      const blob = await response.blob();
  
      const formData = new FormData();
      formData.append("file", {
        uri: coverImage,
        name: "cover.jpg",
        type: "image/jpeg",
      } as any);
  
      formData.append("body", JSON.stringify({})); // Backend requires a "body" key
  
      const entityResponse = await EntityAPIClient.create({ formData });
  
      return entityResponse?.fileName || null;
    } catch (error) {
      console.error("Cover image upload failed:", error);
      return null;
    }
  };

  // Array of content blocks: [ { type: 'text' | 'image', value: '' }, ... ]
  const [contentBlocks, setContentBlocks] = useState([
    { type: 'text', value: '' },
  ]);

  // Add a new content block
  const handleAddBlock = () => {
    setContentBlocks((prev) => [...prev, { type: 'text', value: '' }]);
  };

  // Update content block (either text value or switch to image type)
  const uploadImageToBackend = async (uri: string) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
    
        const formData = new FormData();
        formData.append("body", JSON.stringify({}));

        formData.append("file", {
        uri,
        name: "upload.jpg",
        type: "image/jpeg",
        } as any);
    
        const entityResponse = await EntityAPIClient.create({ formData });
    
        if (entityResponse?.fileName) {
            return entityResponse.fileName; // Store this in the database
        } else {
            throw new Error("File upload failed");
        }
        } catch (error) {
        console.error("Image upload failed:", error);
        return null;
    }
  };

  const pickMedia = async (index: number, type: string) => {
    try {
      if (Platform.OS === "web") {
        // ✅ Use DocumentPicker for web
        const result = await DocumentPicker.getDocumentAsync({
          type: type === "image" ? "image/*" : "video/*",
        });
  
        if (result?.assets?.[0]?.uri) {
          handleUpdateBlock(index, type, result.assets[0].uri);
        }
      } else {
        // ✅ Use ImagePicker for mobile
        const result = await ImagePicker.launchImageLibraryAsync({
          selectionLimit: 1,
          mediaTypes: type === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
          allowsEditing: true,
          quality: 1,
        });
  
        if (!result.canceled) {
          handleUpdateBlock(index, type, result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error("Media selection error:", error);
    }
  };
  
  // Modify `handleUpdateBlock` to use `EntityAPIClient`
  const handleUpdateBlock = (index: number, type: string, value?: string) => {
    const updatedBlocks = [...contentBlocks];
  
    if (type === "text") {
      updatedBlocks[index] = { type, value: value || "" };
    } else {
      updatedBlocks[index] = { type, value: "" }; // Clear value for media types (until user selects a file)
    }
  
    setContentBlocks(updatedBlocks);
  };

  // Delete a content block
  const handleDeleteBlock = (index: number) => {
    const updatedBlocks = contentBlocks.filter((_, i) => i !== index);
    setContentBlocks(updatedBlocks);
  };

  // Publish the article
  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please fill out the title!");
      return;
    }

    const coverFileName = await uploadCoverImageToBackend();
  
    const formattedContents = await Promise.all(
      contentBlocks.map(async (block, index) => {
        if (block.type === "image" && block.value.startsWith("file://")) {
          const filename = await uploadImageToBackend(block.value);
          return {
            content_type: "image",
            content_data: filename || "",
            position: index + 1,
          };
        }
  
        return {
          content_type: block.type,
          content_data: block.value, // Keep text as is
          position: index + 1,
        };
      })
    );
  
    // **Step 2: Send the API request**
    const articlePayload = {
      title,
      author_id: 1, // Replace with actual logged-in user ID
      centre: category,
      cover_image: coverFileName,
      contents: formattedContents,
    };
  
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 p-4">
        {/* Top Header */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="black" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Create New Article</Text>
          {/* Placeholder for spacing */}
          <View style={{ width: 28 }} />
        </View>

        {/* Title Field */}
        <Text className="text-base font-semibold mb-2">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter article title"
          className="border border-gray-300 rounded-lg p-3 text-base mb-4"
        />

        {/* Subtitle Field */}
        <Text className="text-base font-semibold mb-2">Subtitle</Text>
        <TextInput
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Enter subtitle or short description"
          className="border border-gray-300 rounded-lg p-3 text-base mb-4"
        />

        {/* Cover Image (Placeholder) */}
        {/* <Text className="text-base font-semibold mb-2">Cover Image</Text>
        <View className="border-dashed border-2 border-purple-400 rounded-lg p-6 items-center justify-center mb-4">
          <FontAwesome5 name="folder-open" size={40} color="purple" />
          <Text className="text-gray-600 mt-2">Drag and drop files here</Text>
          <Text className="text-gray-400">OR</Text>
          <TouchableOpacity className="mt-2 p-2 border border-purple-400 rounded-lg">
            <Text className="text-purple-600">Browse files</Text>
          </TouchableOpacity>
        </View> */}
        <Text className="text-base font-semibold mb-2">Cover Image</Text>
        <View className="border-dashed border-2 border-purple-400 rounded-lg p-6 items-center justify-center mb-4">
        {coverImage ? (
            <Image source={{ uri: coverImage }} style={{ width: "100%", height: 150, borderRadius: 5 }} />
        ) : (
            <>
            <FontAwesome5 name="folder-open" size={40} color="purple" />
            <Text className="text-gray-600 mt-2">Drag and drop files here</Text>
            <Text className="text-gray-400">OR</Text>
            <TouchableOpacity
                className="mt-2 p-2 border border-purple-400 rounded-lg"
                onPress={pickCoverImage}
            >
                <Text className="text-purple-600">Browse files</Text>
            </TouchableOpacity>
            </>
        )}
        </View>

        {/* Category Dropdown */}
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
                onValueChange={(val) => handleUpdateBlock(index, val)}
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
                    <Video
                    source={{ uri: block.value }}
                    style={{ width: "100%", height: 100 }}
                    useNativeControls
                    />
                ) : (
                    <Image source={{ uri: block.value }} style={{ width: "100%", height: 100, borderRadius: 5 }} />
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

        {/* Publish Button */}
        <TouchableOpacity
          className="bg-purple-500 p-4 rounded-lg items-center mb-6"
          onPress={handlePublish}
        >
          <Text className="text-white text-lg font-bold">Publish</Text>
        </TouchableOpacity>
      </ScrollView>


      <NavigationBar />
    </KeyboardAvoidingView>
  );
};

export default CreateArticle;
