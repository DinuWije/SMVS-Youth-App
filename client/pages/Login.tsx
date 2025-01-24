import CenteredLayout from '@/components/ui/CenteredLayout'
import { Formik } from 'formik'
import * as yup from 'yup'
import React from 'react'
import {
  TextInput,
  ActivityIndicator,
  Text,
  View,
  Button,
  Keyboard,
} from 'react-native'

const Login = () => {
  const validationSchema = yup.object().shape({
    email: yup.string().label('Email').email().required(),
    password: yup
      .string()
      .label('Password')
      .required()
      .min(5, 'Seems a bit short...'),
  })
  const url = ''

  async function authenticate(info) {
    try {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(info),
      }).then((response) => response.json()) //response will be a json object (that has a token)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View>
      <Text style={{ fontFamily: 'Poppins-Bold' }} className="text-4xl">
        Login
      </Text>
      <Formik
        initialValues={{ email: '', password: '' }}
        onSubmit={(_, actions) => {
          setTimeout(() => {
            actions.setSubmitting(false)
          }, 1000)
        }}
        validationSchema={validationSchema} //validate input information based upon above schema
      >
        {(formikProps) => (
          <React.Fragment>
            <View>
              <Text style={{ fontFamily: 'Inter-Regular' }}>Email address</Text>
              <TextInput
                placeholder="johndoe@example.com"
                placeholderTextColor="#AAAAAA"
                onChangeText={formikProps.handleChange('email')} //
                onBlur={formikProps.handleBlur('email')}
                value={formikProps.values.email.toLowerCase()}
              />
              <Text>
                {formikProps.touched.email && formikProps.errors.email}
              </Text>
            </View>

            <View>
              <Text style={{ fontFamily: 'Inter-Regular' }}>Password</Text>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#AAAAAA"
                onChangeText={formikProps.handleChange('password')}
                onBlur={formikProps.handleBlur('password')}
                secureTextEntry
                value={formikProps.values.password}
              />
              <Text style={{ color: 'red' }}>
                {formikProps.touched.password && formikProps.errors.password}
              </Text>
            </View>

            {formikProps.isSubmitting ? (
              <ActivityIndicator />
            ) : (
              <Button
                title="Submit"
                onPress={() => {
                  try {
                    authenticate(formikProps.values).then((response) => {
                      //response is an object that has the jwt token
                      Keyboard.dismiss()
                      if (response.jwt) {
                        console.log('JWT ', response.jwt)
                      } else if (response.error) {
                        alert(response.error)
                      } else {
                        alert('Unknown Error')
                      }
                    })
                  } catch (err) {
                    console.log(err)
                  }
                }}
              />
            )}
          </React.Fragment>
        )}
      </Formik>
    </View>
  )
}

export default Login
