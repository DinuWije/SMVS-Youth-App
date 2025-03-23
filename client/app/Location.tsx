import { FORM_CONTAINER, LOGO } from '@/constants/Classes'
import React, { useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import interestsData from './data/interests.json'
import { FontAwesome } from '@expo/vector-icons'
import {
  Alert,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import SettingsAPIClient, {
  SettingsUserInfoResponse,
  UpdateSettingsUserInfoRequest,
} from '@/APIClients/SettingsAPIClient'
import { ScrollView } from 'react-native-gesture-handler'

const ALL_LOCATIONS = [
  'Atlanta',
  'New York',
  'Boston',
  'Cherry Hill',
  'Chicago',
  'Edison',
  'Jersey City',
  'San Francisco',
  'Toronto',
  'United Kingdom',
]

const Location = () => {
  const router = useRouter()
  const { interests } = useLocalSearchParams()
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleContinue = async () => {
    try {
      const response =
        (await SettingsAPIClient.get()) as SettingsUserInfoResponse[]

      const userData = response[0]
      const updatedUser = await SettingsAPIClient.update({
        entityData: {
          ...userData,
          location: ALL_LOCATIONS[selectedIndex!],
          interests: interests.split('-'),
        },
      })

      router.push({
        pathname: '/Feed',
        params: { userData: JSON.stringify(updatedUser) },
      })

      console.log('UPDATED FINAL USER ', updatedUser)

      if (!updatedUser) {
        throw new Error('Failed to update interests')
      }
    } catch (error) {
      console.error('Error updating interests:', error)
      Alert.alert('Error', 'Failed to set interests. Please try again.')
    }
  }

  return (
    <View className={FORM_CONTAINER}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View className="flex-row justify-center align-center">
					<TouchableOpacity onPress={() => router.push('./Welcome')}>
						<Image
							className="w-10 h-10"
							source={require('../assets/images/smvs_logo.png')}
						/>
					</TouchableOpacity>
				</View>
				<Text
					style={{ fontFamily: 'Poppins-Bold' }}
					className="text-4xl self-start mt-12"
				>
					Choose your city
				</Text>
				<Text
					className="text-lg leading-snug mt-4"
					style={{ fontFamily: 'Inter-Regular' }}
				>
					To complete the sign up process, please select which city you currently
					reside in.
				</Text>

				<View className="mt-6">
					{ALL_LOCATIONS.map((cat, i) => {
						const isSelected = i == selectedIndex
						return (
							<TouchableOpacity
								key={cat}
								style={[
									styles.categoryItem,
									isSelected && styles.categoryItemSelected,
								]}
								onPress={() => setSelectedIndex(i)}
							>
								<Text style={styles.categoryText}>{cat}</Text>
								{isSelected && (
									<FontAwesome name="check" size={16} color="green" />
								)}
							</TouchableOpacity>
						)
					})}
				</View>

				<TouchableOpacity
					className={`rounded-2xl my-2 p-6 mt-4 ${
selectedIndex == null ? 'bg-gray-400' : 'bg-black'
}`}
					onPress={handleContinue}
					disabled={selectedIndex == null}
				>
					<Text className="text-xl font-bold text-center text-white">
						Continue
					</Text>
				</TouchableOpacity>
			</ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {},
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRightSpace: {
    width: 28,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginTop: 5,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  categoryItem: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#d0ffd0', // Light green when selected
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  locationOption: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationSelected: {
    backgroundColor: '#d0ffd0',
  },
  locationText: {
    fontSize: 14,
    color: '#555',
  },
  uploadBox: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  uploadText: {
    fontSize: 14,
    color: '#555',
  },
  bottomButtonContainer: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  publishButton: {
    backgroundColor: '#9B5DE5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
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

export default Location
