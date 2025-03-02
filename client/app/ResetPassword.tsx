import React from 'react'
import { View, TextInput, Image, Text, TouchableOpacity } from 'react-native'
import {
  FORM_CONTAINER,
  FORM_LABEL,
  FORM_INPUT,
  LOGO,
} from '@/constants/Classes'
import { Formik } from 'formik'
import { useRouter } from 'expo-router'
import authAPIClient from '@/APIClients/AuthAPIClient'

const ResetPassword = () => {
  const router = useRouter()

  const onResetPassword = async ({ email }, { resetForm }) => {
    try {
      if (email != '') {
        await authAPIClient.resetPassword(email)
        resetForm()
      }
    } catch (e) {
      console.log('Reset password error ', e)
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
        Forgot Password?
      </Text>

      <Text
        style={{ fontFamily: 'Inter-Regular' }}
        className="text-lg mt-5 mb-10"
      >
        Don't worry! It happens. Please enter the email associated with your
        account.
      </Text>

      <Formik
        initialValues={{
          email: '',
        }}
        onSubmit={onResetPassword}
      >
        {({ handleSubmit, handleChange, isSubmitting, handleBlur, values }) => (
          <React.Fragment>
            <Text className={FORM_LABEL}>Email address</Text>
            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder=""
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email.toLowerCase()}
            />

            <TouchableOpacity
              className="justify-center items-center h-20 items-center bg-black rounded-xl p-5 w-full"
              onPress={() => handleSubmit()}
            >
              <Text className="text-2xl font-bold text-white">
                Reset Password
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        )}
      </Formik>

      <View className="mt-auto mb-5 flex-row justify-center items-center">
        <Text style={{ fontFamily: 'Inter-Regular' }} className="text-xl">
          Remember password?
        </Text>
        <TouchableOpacity onPress={(e) => router.push('/Login')}>
          <Text
            style={{ fontFamily: 'Inter-SemiBold' }}
            className="font-bold text-xl ml-2"
          >
            Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ResetPassword
