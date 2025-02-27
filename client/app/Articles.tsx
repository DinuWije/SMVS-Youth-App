import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { FontAwesome, FontAwesome5, Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import NavigationBar from '../components/NavigationBar'


const Articles = () => {
  const router = useRouter()

  return (
    <View className="flex-1 bg-white">
      {/* Floating Add Button (Simple & Modern) */}
      <TouchableOpacity
        className="absolute bottom-20 right-5 bg-blue-500 p-4 rounded-full shadow-lg flex items-center justify-center"
        onPress={() => router.push('/CreateArticle')}
      >
        <Ionicons name="add" size={40} color="white" />
      </TouchableOpacity>
      <NavigationBar />
    </View>
  )
}

export default Articles
