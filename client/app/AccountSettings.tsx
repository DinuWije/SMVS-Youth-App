import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import NavigationBar from '../components/NavigationBar'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'

const AccountSettings = () => {
  const router = useRouter()
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Account Settings</Text>
      </View>

      {/* Settings Options */}
      <View className="flex-1 px-4 py-1 space-y-3">
        {/* Profile Information */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={() => router.push('./ProfileSettings')}
        >
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Profile Information
              </Text>
              <Text className="text-sm text-gray-500">
                Change your account information
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={() => router.push('./ChangePassword')}
        >
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Change Password
              </Text>
              <Text className="text-sm text-gray-500">
                Change your password
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Locations */}
        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Interests
              </Text>
              <Text className="text-sm text-gray-500">
                Add or remove your interested topics
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Notifications Section */}
        <Text className="text-lg font-semibold text-gray-700 mt-8">
          NOTIFICATIONS
        </Text>

        {/* Push Notifications */}
        <View className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Push Notifications
              </Text>
              <Text className="text-sm text-gray-500">
                For daily updates, you will get it
              </Text>
            </View>
          </View>
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{
              false: Colors.light.accentPurple,
              true: Colors.light.accentPurple,
            }}
          />
        </View>

        {/* SMS Notifications */}
        <View className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                SMS Notifications
              </Text>
              <Text className="text-sm text-gray-500">
                For daily updates, you will get it
              </Text>
            </View>
          </View>

          <Switch
            value={smsNotifications}
            onValueChange={setSmsNotifications}
            trackColor={{
              false: Colors.light.accentPurple,
              true: Colors.light.accentPurple,
            }}
          />
        </View>

        {/* More Section */}
        <Text className="text-lg font-semibold text-gray-700 mt-8">MORE</Text>

        {/* Rate Us */}
        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="star-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Rate Us
              </Text>
              <Text className="text-sm text-gray-500">
                Rate us on the Play Store or App Store
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <MaterialIcons name="logout" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">Logout</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <NavigationBar />
    </View>
  )
}

export default AccountSettings
