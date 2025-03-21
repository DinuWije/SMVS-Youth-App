import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { FontAwesome5 } from '@expo/vector-icons'
import { useRouter, usePathname } from 'expo-router'
import { Colors } from '@/constants/Colors'

const NavigationBar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (route: string) => pathname === route

  return (
    <View className="flex-row justify-around items-center border-t border-gray-200 p-4 bg-white">
      {/* Home */}
      <TouchableOpacity onPress={() => router.push('/Articles')}>
        <FontAwesome5
          name="home"
          size={24}
          color={isActive('/Articles') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      {/* Meditation */}
      <TouchableOpacity onPress={() => router.push('/MeditationPage')}>
        <FontAwesome5
          name="users"
          size={24}
          color={isActive('/MeditationPage') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      {/* Reels */}
      <TouchableOpacity onPress={() => router.push('/ReelsScreen')}>
        <FontAwesome5
          name="play-circle"
          size={24}
          color={isActive('/ReelsScreen') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      {/* Feed */}
      <TouchableOpacity onPress={() => router.push('/Feed')}>
        <FontAwesome5
          name="file-alt"
          size={24}
          color={isActive('/Feed') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      {/* Settings */}
      <TouchableOpacity onPress={() => router.push('/AccountSettings')}>
        <FontAwesome5
          name="cog"
          size={24}
          color={isActive('/AccountSettings') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>
    </View>
  )
}

export default NavigationBar
