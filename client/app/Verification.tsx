import React from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import { FORM_CONTAINER, LOGO } from '@/constants/Classes'
import { useRouter } from 'expo-router'
import authAPIClient from '@/APIClients/AuthAPIClient'

const Verification = () => {
  const router = useRouter()

  const onPress = async () => {
    if (await authAPIClient.is_email_verified()) {
      router.push('/Feed')
    } else {
      console.log('User is not verified')
    }
  }

  return (
    <View className={FORM_CONTAINER}>
      <View className="flex-row justify-between">
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            className="w-10 h-10"
            source={require('../assets/images/back-arrow.png')}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('./Welcome')}>
          <Image
            className={LOGO}
            source={require('../assets/images/smvs_logo.png')}
          />
        </TouchableOpacity>
      </View>
      <Text
        style={{ fontFamily: 'Poppins-Bold' }}
        className="mb-0 mt-10 text-4xl self-start"
      >
        Please Verify Your Email Address.
      </Text>

      <View className="mt-5 flex-row">
        <Text style={{ fontFamily: 'Inter-Regular' }} className="text-xl">
          Already Verified?
        </Text>
        <TouchableOpacity onPress={(e) => onPress()}>
          <Text
            style={{ fontFamily: 'Inter-SemiBold' }}
            className="font-bold text-xl ml-2"
          >
            Confirm and Proceed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default Verification
