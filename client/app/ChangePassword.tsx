import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors' // Assuming your Colors file is here

const ChangePassword = () => {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false)

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">
          Change Password
        </Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-4 py-6">
        {/* Increased spacing between password fields */}
        <View className="space-y-8">
          {/* Password Field */}
          <View className="border-b border-gray-300 py-4 flex-row items-center">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">PASSWORD</Text>
              <TextInput
                className="text-lg text-black"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                placeholderTextColor="gray"
                secureTextEntry={!isPasswordVisible}
              />
            </View>
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Field */}
          <View className="border-b border-gray-300 py-4 flex-row items-center">
            <View className="flex-1">
              <Text className="text-xs text-gray-500">CONFIRM PASSWORD</Text>
              <TextInput
                className="text-lg text-black"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="gray"
                secureTextEntry={!isConfirmPasswordVisible}
              />
            </View>
            <TouchableOpacity
              onPress={() =>
                setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
              }
            >
              <Ionicons
                name={
                  isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'
                }
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
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
            SAVE PASSWORD
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ChangePassword
