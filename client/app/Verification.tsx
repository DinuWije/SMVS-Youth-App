import { useRouter } from 'expo-router'
import React from 'react'
import authAPIClient from '@/APIClients/AuthAPIClient'
import { View, Text, Image, TouchableOpacity } from 'react-native'

const Verification = () => {
  const router = useRouter()

  const handlePress = async () => {
    if (await authAPIClient.is_email_verified()) {
      router.push('/Feed')
    } else {
      console.log('User is not verified')
    }
  }

  return (
    <View className="flex-1 bg-white justify-center items-center">
      <Image
        source={require('../assets/images/Illustration.png')}
        className="rounded-3xl w-[90%] h-[98%] object-cover"
      />
      <View className="absolute top-1/3 left-0 w-full h-2/3 flex justify-center items-center">
        <Text style={{ fontFamily: 'Inter-Regular' }} className="text-xl">
          Please Ensure You Have Verified Your Email.
        </Text>
        <TouchableOpacity onPress={(e) => handlePress()}>
          <Text
            style={{ fontFamily: 'Inter-SemiBold' }}
            className="mt-5 font-bold underline text-xl"
          >
            I've Verified
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Verification
