import React from 'react'
import { View, TextInput, Image, Text, TouchableOpacity } from 'react-native'
import {
  FORM_CONTAINER,
  FORM_LABEL,
  FORM_INPUT,
  LOGO,
} from '@/constants/Classes'
import authAPIClient from '@/APIClients/AuthAPIClient'
import { Formik } from 'formik'
import { ActivityIndicator } from 'react-native'
import * as yup from 'yup'
import { useRouter } from 'expo-router'

const validationSchema = yup.object().shape({
  firstName: yup.string().label('First Name').required(),
  lastName: yup.string().label('Last Name').required(),
  email: yup.string().label('Email').email().required(),
  password: yup
    .string()
    .label('Password')
    .required()
    .min(6, 'Too short, must be a minimum of six characters'),
  confirmPassword: yup
    .string()
    .label('Confirm Password')
    .required()
    .test('check-confirmpassword', "Password doesn't match", function (value) {
      return this.parent.password === value
    }),
})

const Register = () => {
  const router = useRouter()

  const onSignupClick = async (values: any, { setErrors }) => {
    const { firstName, lastName, email, password } = values

    try {
      await authAPIClient.register(firstName, lastName, email, password)
      router.push('./Verification')
    } catch (err) {
      setErrors({ general: 'Issue processing your request...' })
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
        className="py-10 text-4xl self-start"
      >
        Sign up
      </Text>

      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        onSubmit={onSignupClick}
        validationSchema={validationSchema}
      >
        {({
          handleSubmit,
          handleChange,
          isSubmitting,
          handleBlur,
          errors,
          values,
          submitCount,
        }) => (
          <React.Fragment>
            <Text
              className={FORM_LABEL}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              First Name
            </Text>
            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder="John"
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('firstName')}
              onBlur={handleBlur('firstName')}
              value={values.firstName}
            />

            <Text
              className={FORM_LABEL}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Last Name
            </Text>
            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder="Doe"
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('lastName')}
              onBlur={handleBlur('lastName')}
              value={values.lastName}
            />

            <Text className={FORM_LABEL}>Email</Text>
            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder="johndoe@example.com"
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email.toLowerCase()}
            />

            <Text className={FORM_LABEL}>Password</Text>
            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder="Password"
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              value={values.password}
            />

            <Text className={FORM_LABEL}>Confirm Password</Text>
            <TextInput
              className={FORM_INPUT}
              placeholder="Confirmed Password"
              placeholderTextColor="#AAAAAA"
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              secureTextEntry
            />

            {isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                className="justify-center items-center mt-12 mb-5 h-20 items-center bg-black rounded-xl p-5 w-full"
                onPress={() => {
                  handleSubmit()
                }}
              >
                <Text className="text-2xl font-bold text-white">Sign up</Text>
              </TouchableOpacity>
            )}

            {submitCount > 0 && Object.keys(errors).length > 0 && (
              <View>
                <Text key="signup-error" className="text-red-500 text-s">
                  {Object.values(errors)[0]}
                </Text>
              </View>
            )}
          </React.Fragment>
        )}
      </Formik>
    </View>
  )
}

export default Register
