import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import EntityAPIClient from "../APIClients/EntityAPIClient";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "@/APIClients/ArticleAPIClient";
import { Platform } from "react-native";


// Article Item Component
const ArticleCard = ({ article, onPress, onDelete }: { article: any; onPress: () => void; onDelete: (articleId) => void; }) => {
  console.log(article)
  return (
    <View className="relative bg-white mb-6 rounded-2xl overflow-hidden shadow">
      {/* Trash Can Button (Bottom Left) */}
      <TouchableOpacity 
        onPress={() => onDelete(article.id)} 
        className="absolute bottom-4 right-4 z-10 bg-white p-2 rounded-full shadow"
      >
        <MaterialIcons name="delete" size={24} color="gray" />
      </TouchableOpacity>

      {/* Article Card */}
      <TouchableOpacity onPress={onPress}>
        <Image
          source={{ uri: article.cover_image?.fileUrl }} 
          className="w-full h-48"
        />
        <View className="p-4">
          <Text className="text-xl font-semibold">{article.title}</Text>
          <Text className="text-gray-500 mt-1">{article.subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={14} color="gold" />
            <Text className="ml-1 text-gray-600">{article.rating}</Text>
            <Text className="ml-2 text-gray-600">{article.numberOfRatings} Ratings</Text>
            <Ionicons name="time-outline" size={14} color="gray" className="ml-3" />
            <Text className="ml-1 text-gray-600">{article.timeToRead} Mins</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen = () => {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await ArticleAPIClient.getAll();
        if (!response) return;

        const articlesWithImages = await Promise.all(
          response.map(async (article) => {
            const fileUrl = await EntityAPIClient.getFile(article.coverImage);
            return { ...article, cover_image: fileUrl };
          })
        );
        setArticles(articlesWithImages);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleDelete = (articleId) => {
    if (Platform.OS === "web") {
      // Use standard JS confirm on web
      const shouldDelete = window.confirm("Are you sure you want to delete this article?");
      if (shouldDelete) {
        confirmDelete(articleId);
      }
    } else {
      // Use native Alert for iOS/Android
      Alert.alert(
        "Delete Article",
        "Are you sure you want to delete this article?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => confirmDelete(articleId),
          },
        ]
      );
    }
  };
  
  const confirmDelete = async (articleId) => {
    try {
      const success = await ArticleAPIClient.remove(articleId);
      if (success) {
        setArticles((prev) => prev.filter((article) => article.id !== articleId));
      } else {
        Alert.alert('Error', 'Failed to delete article. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-3xl font-bold">Home</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#8A56AC" className="mt-10" />
      ) : (
        <FlatList
          data={articles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ArticleCard
              article={item}
              onPress={() => router.push(`/article/${item.id}`)}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <TouchableOpacity
        className="absolute bottom-20 right-5 bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center"
        onPress={() => router.push('/CreateArticle')}
      >
        <Ionicons name="add" size={40} color="white" />
      </TouchableOpacity>
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </View>
  );
};

export default HomeScreen;
