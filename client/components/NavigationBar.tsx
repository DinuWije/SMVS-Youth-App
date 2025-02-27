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
      <TouchableOpacity onPress={() => router.push('./Welcome')}>
        <FontAwesome5
          name="home"
          size={24}
          color={isActive('/Welcome') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./Login')}>
        <FontAwesome5
          name="users"
          size={24}
          color={isActive('/Login') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./Feed')}>
        <FontAwesome5
          name="file-alt"
          size={24}
          color={isActive('/Feed') ? Colors.light.accentPurple : 'gray'}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('./AccountSettings')}>
        <FontAwesome5
          name="cog"
          size={24}
          color={
            isActive('/AccountSettings') ? Colors.light.accentPurple : 'gray'
          }
        />
      </TouchableOpacity>
    </View>
  )
}

export default NavigationBar
