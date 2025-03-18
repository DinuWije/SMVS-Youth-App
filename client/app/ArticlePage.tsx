import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import NavigationBar from "../components/NavigationBar";
import ArticleAPIClient, { Article, Content } from "@/APIClients/ArticleAPIClient";
import EntityAPIClient from "@/APIClients/EntityAPIClient";

const ArticleComponent = ({ articleId }: { articleId: string }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const fetchedArticle = await ArticleAPIClient.getById(Number(articleId));
        if (!fetchedArticle) return;
  
        // Fetch the cover image URL
        const coverFileUrl = await EntityAPIClient.getFile(fetchedArticle.coverImage);
        fetchedArticle.coverImage = coverFileUrl || "";
  
        // Fetch all content images in parallel
        const updatedContents = await Promise.all(
          fetchedArticle.contents.map(async (content) => {
            if (content.contentType === "image") {
              const fileUrl = await EntityAPIClient.getFile(content.contentData);
              return { ...content, contentData: fileUrl || "" };
            }
            return content;
          })
        );
  
        fetchedArticle.contents = updatedContents;
        setArticle(fetchedArticle);
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchArticle();
  }, [articleId]);
  
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#8A56AC" />
      </View>
    );
  }

  if (!article) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-xl font-semibold">Article not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 mb-16"> {/* Ensure ScrollView doesn't include the navbar */}
        {/* Cover Image */}
        <View className="relative">
          <Image
            source={{ uri: article.coverImage["fileUrl"] || "https://via.placeholder.com/600" }}
            className="w-full h-64"
          />
          <View className="absolute top-12 left-4">
            <Ionicons
              name="arrow-back-circle"
              size={36}
              color="white"
              onPress={() => router.back()}
            />
          </View>
          <View className="absolute top-12 right-4 flex-row space-x-4">
            <Ionicons name="share-outline" size={28} color="white" />
          </View>
        </View>

        {/* Article Info */}
        <View className="p-6">
          <Text className="text-3xl font-bold">{article.title}</Text>
          <Text className="text-gray-500 mt-1 text-lg">{article.subtitle}</Text>
          <View className="flex-row items-center mt-2">
            <FontAwesome name="star" size={14} color="gold" />
            <Text className="ml-1 text-gray-600">{article.rating}</Text>
            <Text className="ml-2 text-gray-600">{article.numberOfRatings} Ratings</Text>
            <Ionicons name="time-outline" size={14} color="gray" className="ml-3" />
            <Text className="ml-1 text-gray-600">{article.timeToRead} Mins</Text>
          </View>
        </View>

        {/* Article Contents */}
        <View className="px-6 pb-10">
          {article.contents
            .sort((a, b) => a.position - b.position) // Sort contents by position
            .map((content: Content) => (
              <View key={content.id || content.position} className="mb-4">
                {content.contentType === "text" ? (
                  <Text className="text-gray-800 text-lg">{content.contentData}</Text>
                ) : (
                  <Image
                    source={{ uri: content.contentData["fileUrl"] }}
                    className="w-full h-56 rounded-lg"
                  />
                )}
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Navigation Bar (Fixed at the Bottom) */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </View>
  );
};

export default ArticleComponent;
