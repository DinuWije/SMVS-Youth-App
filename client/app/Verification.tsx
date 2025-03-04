import React from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'
import { FORM_CONTAINER, LOGO } from '@/constants/Classes'
import { useRouter } from 'expo-router'
import authAPIClient from '@/APIClients/AuthAPIClient'

const Verification = () => {
  const router = useRouter()

  const onPress = async () => {
    if (await authAPIClient.is_email_verified()) {
      router.push('/Interests')
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
        className="mb-5 mt-10 text-4xl self-start"
      >
        Please Verify Your Email Address.
      </Text>

      <Image
        className="flex-1 self-center rounded-xl"
        source={require('../assets/images/Illustration.png')}
      />

      <TouchableOpacity
        className="mt-7 mb-3 self-center bg-black rounded-lg my-2 p-5 w-[90%]"
        onPress={() => onPress()}
      >
        <Text className="font-bold text-center text-white">I've Verified!</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Verification
