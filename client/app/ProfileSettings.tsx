import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors' // Assuming your Colors file is here

const ProfileSettings = () => {
  const router = useRouter()
  const [fullName, setFullName] = useState('My Name')
  const [email, setEmail] = useState('name.lastname@email.com')
  const [phoneNumber, setPhoneNumber] = useState('')

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">
          Profile Settings
        </Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-4 py-6 space-y-6">
        {/* Full Name */}
        <View>
          <Text className="text-xs text-gray-500">FULL NAME</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        {/* Email Address */}
        <View className="py-6">
          <Text className="text-xs text-gray-500">EMAIL ADDRESS</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Phone Number */}
        <View>
          <Text className="text-xs text-gray-500">PHONE NUMBER</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password */}
        {/* <View className="flex-row items-center justify-between border-b border-gray-300 py-2">
          <View>
            <Text className="text-xs text-gray-500">PASSWORD</Text>
            <Text className="text-lg text-black">************</Text>
          </View>
          <TouchableOpacity>
            <Text
              className="text-base"
              style={{ color: Colors.light.accentPurple, fontWeight: 'bold' }}
            >
              Change
            </Text>
          </TouchableOpacity>
        </View> */}
      </View>

      {/* Submit Button */}
      <View className="px-4 py-4">
        <TouchableOpacity
          style={{
            backgroundColor: Colors.light.accentPurple,
            borderRadius: 10,
            paddingVertical: 16,
          }}
        >
          <Text className="text-center text-white text-lg font-bold">
            SAVE CHANGES
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProfileSettings
