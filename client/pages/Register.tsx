import React, { useContext, useEffect } from 'react'
import { View, TextInput, Image, Text, TouchableOpacity } from 'react-native'
import { FORM_CONTAINER, FORM_LABEL, FORM_INPUT } from '@/constants/Classes'
import authAPIClient from '@/APIClients/AuthAPIClient'
import AuthContext from '@/contexts/AuthContext'
import { AuthenticatedUser } from '@/types/AuthTypes'
import { Formik } from 'formik'
import { ActivityIndicator } from 'react-native'
import * as yup from 'yup'

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

const Register = ({ navigation }) => {
  const { authenticatedUser, setAuthenticatedUser } = useContext(AuthContext)

  const onSignupClick = async (values: any, { setErrors }) => {
    const { firstName, lastName, email, password } = values

    try {
      const user: AuthenticatedUser = await authAPIClient.register(
        firstName,
        lastName,
        email,
        password
      )
      setAuthenticatedUser(user)
    } catch (err) {
      setErrors({ general: err.message })
    }
  }

  useEffect(() => {
    if (authenticatedUser) {
      navigation.navigate('Feed')
    }
  }, [authenticatedUser, navigation])

  return (
    <View className={FORM_CONTAINER}>
      <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
        <Image
          className="w-24 h-24 self-end"
          source={require('../assets/images/smvs_logo.png')}
        />
      </TouchableOpacity>
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
              placeholder="John Doe"
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
              placeholder="John Doe"
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
              placeholder="Password"
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

export default Register
