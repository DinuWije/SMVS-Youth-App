import { FORM_CONTAINER, LOGO } from '@/constants/Classes'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import interestsData from './data/interests.json'
import {
  Alert,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import SettingsAPIClient, {
  UpdateSettingsUserInfoRequest,
} from '@/APIClients/SettingsAPIClient'

const Interests = () => {
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

  const handleOptionSelect = (index) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(index)) {
        return prevSelected.filter((item) => item !== index) // Deselect
      } else {
        return [...prevSelected, index] // Select
      }
    })
  }

  const handleContinue = async () => {
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
      router.push('./Feed')
    } catch (error) {
      console.error('Error updating interests:', error)
      Alert.alert('Error', 'Failed to set interests. Please try again.')
    }
  }

  return (
    <View className={`${FORM_CONTAINER} px-8`}>
      <TouchableOpacity onPress={() => router.push('./Welcome')}>
        <Image
          className={LOGO}
          source={require('../assets/images/smvs_logo.png')}
        />
      </TouchableOpacity>
      <Text
        style={{ fontFamily: 'Poppins-Bold' }}
        className="text-4xl self-start mt-12"
      >
        Choose your interests
      </Text>
      <Text
        className="text-lg leading-snug mt-4"
        style={{ fontFamily: 'Inter-Regular' }}
      >
        To complete the sign up process, please choose what you are interested
        in
      </Text>

      <View className="mt-6">
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleOptionSelect(index)}
            className={`items-center bg-white rounded-2xl my-2 p-5 flex-row justify-between border ${
              selectedOptions.includes(index)
                ? 'border-black'
                : 'border-gray-300'
            }`}
          >
            <Text className="text-xl" style={{ fontFamily: 'Inter-SemiBold' }}>
              {option}
            </Text>
            <View style={styles.optionCircle}>
              {selectedOptions.includes(index) && (
                <View style={styles.filledCircle} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="bg-black rounded-2xl my-2 p-6 mt-auto"
        onPress={handleContinue}
      >
        <Text className="text-xl font-bold text-center text-white">
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#000',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filledCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
})

export default Interests
