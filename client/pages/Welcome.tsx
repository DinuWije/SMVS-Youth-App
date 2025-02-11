import React from 'react'
import { View, Image, Text, TouchableOpacity } from 'react-native'

const Welcome = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        <Image source={require('../assets/images/smvs_logo.png')} />
      </View>

      <View className="flex-1 mb-16 justify-center">
        <View className="my-12 items-center">
          <Text
            style={{ fontFamily: 'Poppins-Bold' }}
            className="text-4xl my-2"
          >
            SMVS Youth App
          </Text>
          <Text
            className="w-[70%] text-center"
            style={{ fontFamily: 'Inter-Regular' }}
          >
            Now your spirituality is in one place and always in your control
          </Text>
        </View>

        <View className="items-center">
          <TouchableOpacity
            className="bg-black rounded-lg my-2 p-5 w-[90%]"
            onPress={() => navigation.navigate('Login')}
          >
            <Text className="font-bold text-center text-white">Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white rounded-lg my-2 p-5 w-[90%] border-black border"
            onPress={() => navigation.navigate('Register')}
          >
            <Text className="font-bold text-center text-black">
              Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

export default Welcome
