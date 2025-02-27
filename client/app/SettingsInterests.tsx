import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FORM_CONTAINER } from '@/constants/Classes'
import { Colors } from '@/constants/Colors' // Import Colors for accentPurple
import SettingsAPIClient, {
  UpdateSettingsUserInfoRequest,
} from '@/APIClients/SettingsAPIClient'
import interestsData from './data/interests.json'

const SettingsInterests = () => {
  const router = useRouter()
  const { userData } = useLocalSearchParams()

  // Ensure userData is a string before parsing
  const parsedUserData =
    typeof userData === 'string' ? JSON.parse(userData) : {}

  const options = interestsData.interests

  const parsedInterests = parsedUserData.interests
    ? parsedUserData.interests
    : []

  // Convert existing interest strings to indices
  const initialSelectedIndices = options
    .map((option, index) => (parsedInterests.includes(option) ? index : null))
    .filter((index) => index !== null) as number[]

  // State for selected options (indices)
  const [selectedOptions, setSelectedOptions] = useState<number[]>(
    initialSelectedIndices
  )

  const handleOptionSelect = (index: number) => {
    setSelectedOptions((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    )
  }

  const handleSave = async () => {
    if (!userData) return

    const selectedInterests = selectedOptions.map((index) => options[index])

    const updatedUserData: UpdateSettingsUserInfoRequest = {
      ...parsedUserData,
      interests: selectedInterests,
    }

    try {
      const updatedUser = await SettingsAPIClient.update({
        entityData: updatedUserData,
      })

      if (!updatedUser) {
        throw new Error('Failed to update interests')
      }
    } catch (error) {
      console.error('Error updating interests:', error)
      Alert.alert('Error', 'Failed to update interests. Please try again.')
    }
    router.back()
  }

  return (
    <View className={`${FORM_CONTAINER} px-8`}>
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">
          Choose Your Interests
        </Text>
      </View>

      {/* Interest Options */}
      <View className="mt-6">
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleOptionSelect(index)}
            className={`items-center bg-white rounded-2xl my-2 p-5 flex-row justify-between border ${
              selectedOptions.includes(index)
                ? 'border-purple-500'
                : 'border-gray-300'
            }`}
            style={
              selectedOptions.includes(index)
                ? styles.selectedOption
                : styles.unselectedOption
            }
          >
            <Text className="text-xl font-semibold">{option}</Text>
            <View
              style={[
                styles.optionCircle,
                selectedOptions.includes(index) && styles.selectedCircle,
              ]}
            >
              {selectedOptions.includes(index) && (
                <View style={styles.filledCircle} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        className="rounded-2xl my-2 p-6 mt-auto"
        style={styles.continueButton}
        onPress={handleSave}
      >
        <Text className="text-xl font-bold text-center text-white">
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  selectedOption: {
    borderColor: Colors.light.accentPurple,
    backgroundColor: Colors.light.accentPurpleBackground, // Light purple background when selected
  },
  unselectedOption: {
    borderColor: Colors.light.greyBorder,
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.greyBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCircle: {
    borderColor: Colors.light.accentPurple,
  },
  filledCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.light.accentPurple,
  },
  continueButton: {
    backgroundColor: Colors.light.accentPurple,
    borderRadius: 16,
    paddingVertical: 16,
  },
})

export default SettingsInterests
