import React from "react";
import { Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Article from "../ArticlePage"; // Import the Article component

const ArticlePageWrapper = () => {
  const { id } = useLocalSearchParams(); // Get the article ID from the URL

  if (!id) {
    return <Text>Error: No article ID provided</Text>;
  }

  return <Article articleId={id as string} />; // Pass id as a prop
};

export default ArticlePageWrapper;
