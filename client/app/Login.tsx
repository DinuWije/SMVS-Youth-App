import React, { useEffect, useContext } from 'react'
import { Formik } from 'formik'
import * as yup from 'yup'
import {
  FORM_CONTAINER,
  FORM_LABEL,
  FORM_INPUT,
  LOGO,
} from '@/constants/Classes'
import {
  TextInput,
  ActivityIndicator,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native'
import { AuthenticatedUser } from '../types/AuthTypes'
import AuthContext from '@/contexts/AuthContext'
import authAPIClient from '@/APIClients/AuthAPIClient'
import { useRouter } from 'expo-router'

const validationSchema = yup.object().shape({
  email: yup.string().label('Email').email().required(),
  password: yup
    .string()
    .label('Password')
    .required()
    .min(5, 'Seems a bit short...'),
})

const Login = () => {
  const router = useRouter()
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext)

  const onLogInClick = async (
    values: { email: string; password: string },
    { setErrors }
  ) => {
    const { email, password } = values

    try {
      const user: AuthenticatedUser | null = await authAPIClient.login(
        email,
        password
      )

      setAuthenticatedUser(user)
    } catch (e) {
      setErrors({ general: e.message })
    }
  }

  useEffect(() => {
    if (authenticatedUser) {
      router.push('./Feed')
    }
  }, [authenticatedUser])

  return (
    <View className={FORM_CONTAINER}>
      <TouchableOpacity onPress={() => router.push('./Welcome')}>
        <Image
          className={LOGO}
          source={require('../assets/images/smvs_logo.png')}
        />
      </TouchableOpacity>
      <Text
        style={{ fontFamily: 'Poppins-Bold' }}
        className="py-10 text-4xl self-start"
      >
        Log in
      </Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={onLogInClick}
        validationSchema={validationSchema} //validate input information based upon above schema
      >
        {({
          handleSubmit,
          handleBlur,
          handleChange,
          values,
          errors,
          isSubmitting,
          submitCount,
        }) => (
          <React.Fragment>
            <Text
              className={FORM_LABEL}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Email address
            </Text>
            {/* <Text>{formikProps.touched.email && formikProps.errors.email}</Text> */}

            <TextInput
              className={`${FORM_INPUT} mb-8`}
              placeholder="johndoe@example.com"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email.toLowerCase()}
            />

            <Text
              className={FORM_LABEL}
              style={{ fontFamily: 'Inter-Regular' }}
            >
              Password
            </Text>
            <TextInput
              className={FORM_INPUT}
              placeholder="Enter password"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry={true}
              value={values.password}
            />

            <Text
              style={{ fontFamily: 'Inter-Regular' }}
              className="mt-6 text-lg self-end"
            >
              Forgot password?
            </Text>

            {isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                className="justify-center items-center mt-20 mb-5 h-20 items-center bg-black rounded-xl p-5 w-full"
                onPress={() => handleSubmit()}
              >
                <Text className="text-2xl font-bold text-white">Log in</Text>
              </TouchableOpacity>
            )}

            {submitCount > 0 && Object.keys(errors).length > 0 && (
              <View className="mb-2">
                {Object.values(errors).map((error, index) => (
                  <Text key={index} className="text-red-500 text-s">
                    {error}
                  </Text>
                ))}
              </View>
            )}
          </React.Fragment>
        )}
      </Formik>
    </View>
  )
}

export default Login
