import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import EntityAPIClient from "../APIClients/EntityAPIClient";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient from "@/APIClients/ArticleAPIClient";

// Article Item Component
const ArticleCard = ({ article, onPress }: { article: any; onPress: () => void }) => {
  return (
    <TouchableOpacity onPress={onPress} className="bg-white mb-6 rounded-2xl overflow-hidden shadow">
      <Image
        source={{ uri: article.cover_image["fileUrl"] || "https://via.placeholder.com/300" }} // Fallback image
        className="w-full h-48"
      />
      <View className="p-4">
        <Text className="text-xl font-semibold">{article.title}</Text>
        <Text className="text-gray-500 mt-1">{article.subtitle}</Text>
        <View className="flex-row items-center mt-2">
          <FontAwesome name="star" size={14} color="gold" />
          <Text className="ml-1 text-gray-600">4.3</Text>
          <Text className="ml-2 text-gray-600">200+ Ratings</Text>
          <Ionicons name="time-outline" size={14} color="gray" className="ml-3" />
          <Text className="ml-1 text-gray-600">25 Min</Text>
        </View>
      </View>
    </TouchableOpacity>
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
