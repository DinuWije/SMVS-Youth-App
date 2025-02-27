import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { Colors } from '@/constants/Colors'
import SettingsAPIClient, {
  SettingsUserInfoResponse,
  UpdateSettingsUserInfoRequest,
} from '@/APIClients/SettingsAPIClient'
import { Picker } from '@react-native-picker/picker'
import locationsData from './data/locations.json'

const ProfileSettings = () => {
  const router = useRouter()
  const { userData } = useLocalSearchParams()

  // Ensure userData is a string before parsing
  const parsedUserData =
    typeof userData === 'string' ? JSON.parse(userData) : {}

  // State for form fields
  const [firstName, setFirstName] = useState(parsedUserData.firstName || '')
  const [lastName, setLastName] = useState(parsedUserData.lastName || '')
  const [email, setEmail] = useState(parsedUserData.email || '')
  const [phoneNumber, setPhoneNumber] = useState(
    parsedUserData.phoneNumber || ''
  )
  const locations = locationsData.locations
  const [selectedLocation, setSelectedLocation] = useState(
    parsedUserData.location || 'New York'
  )
  const [showModal, setShowModal] = useState(false)

  // Effect to update state if userData changes (e.g., if reloaded)
  useEffect(() => {
    setFirstName(parsedUserData.firstName || '')
    setLastName(parsedUserData.lastName || '')
    setEmail(parsedUserData.email || '')
    setPhoneNumber(parsedUserData.phoneNumber || '')
  }, [userData])

  const handleSubmit = async () => {
    if (!userData) return

    const phoneRegex =
      /^(\+?\d{1,3})?[-.\s]?(\(?\d{3}\)?)[-.\s]?\d{3}[-.\s]?\d{4}$/

    if (!phoneRegex.test(phoneNumber)) {
      setShowModal(true)
      return
    }

    const updatedUserData: UpdateSettingsUserInfoRequest = {
      ...parsedUserData,
      firstName,
      lastName,
      email,
      phoneNumber,
      location: selectedLocation,
    }

    try {
      const updatedUser = await SettingsAPIClient.update({
        entityData: updatedUserData,
      })

      if (!updatedUser) {
        throw new Error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      Alert.alert('Error', 'Failed to update settings. Please try again.')
    }
    router.back()
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">
          Profile Information
        </Text>
      </View>

      {/* Form */}
      <View className="flex-1 px-4 py-6 space-y-6">
        {/* First Name */}
        <View>
          <Text className="text-xs text-gray-500">FIRST NAME</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        {/* Last Name */}
        <View>
          <Text className="text-xs text-gray-500">LAST NAME</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={lastName}
            onChangeText={setLastName}
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
        {/* Location */}
        <View>
          <Text className="text-xs text-gray-500">LOCATION</Text>
          <View className="border-b border-gray-300">
            <Picker
              selectedValue={selectedLocation}
              onValueChange={(itemValue) => setSelectedLocation(itemValue)}
              style={{ height: 50, width: '100%' }}
            >
              {locations.map((location, index) => (
                <Picker.Item key={index} label={location} value={location} />
              ))}
            </Picker>
          </View>
        </View>
        {/* Email Address */}
        <View className="py-6">
          <Text className="text-xs text-gray-500">EMAIL ADDRESS</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={email}
            editable={false}
            style={{ opacity: 0.5 }}
          />
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
          onPress={handleSubmit}
        >
          <Text className="text-center text-white text-lg font-bold">
            SAVE CHANGES
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            <Text className="text-lg font-bold text-black">
              Invalid Phone Number
            </Text>
            <Text className="text-gray-600 mt-2">
              Please enter a valid phone number.
            </Text>

            <TouchableOpacity
              className="mt-4 p-2 rounded"
              onPress={() => setShowModal(false)}
              style={{
                backgroundColor: Colors.light.accentPurple,
              }}
            >
              <Text className="text-white text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default ProfileSettings
