import CenteredLayout from '@/components/ui/CenteredLayout'
import React from 'react'
import { View, TextInput, Keyboard, Text, Button } from 'react-native'
import { Formik } from 'formik'
import { ActivityIndicator } from 'react-native'
import * as yup from 'yup'

const Register = () => {
  const url = ''
  const validationSchema = yup.object().shape({
    name: yup.string().label('Name').required(),
    email: yup.string().label('Email').email().required(),
    password: yup
      .string()
      .label('Password')
      .required()
      .min(8, 'Too short, must be a minimum of eight characters'),
    confirmPassword: yup
      .string()
      .label('Confirm Password')
      .required()
      .test(
        'check-confirmpassword',
        "Password doesn't match",
        function (value) {
          return this.parent.password === value
        }
      ),
  })

  async function register(info) {
    try {
      return fetch(url, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify(info),
      }).then((response) => response.json())
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <CenteredLayout>
      <Text>Registration</Text>
      <Formik
        initialValues={{
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        }}
        onSubmit={(_, actions) => {
          setTimeout(() => {
            actions.setSubmitting(false)
          }, 1000)
        }}
        validationSchema={validationSchema}
      >
        {(formikProps) => (
          <React.Fragment>
            <View>
              <Text>Name</Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#AAAAAA"
                onChangeText={formikProps.handleChange('username')}
                onBlur={formikProps.handleBlur('username')}
                value={formikProps.values.username}
              />
              <Text style={{ color: 'red' }}>
                {formikProps.touched.username && formikProps.errors.username}
              </Text>
            </View>

            <View>
              <Text>Email</Text>
              <TextInput
                placeholder="johndoe@example.com"
                placeholderTextColor="#AAAAAA"
                onChangeText={formikProps.handleChange('email')}
                onBlur={formikProps.handleBlur('email')}
                value={formikProps.values.email.toLowerCase()}
              />
              <Text style={{ color: 'red' }}>
                {formikProps.touched.email && formikProps.errors.email}
              </Text>
            </View>

            <View>
              <Text>Password</Text>
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

            <View>
              <Text>Confirm Password</Text>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#AAAAAA"
                onChangeText={formikProps.handleChange('confirmPassword')}
                onBlur={formikProps.handleBlur('confirmPassword')}
                secureTextEntry
              />
              <Text style={{ color: 'red' }}>
                {formikProps.touched.confirmPassword &&
                  formikProps.errors.confirmPassword}
              </Text>
              {formikProps.isSubmitting ? (
                <ActivityIndicator />
              ) : (
                <View>
                  <Button
                    title="Register"
                    onPress={() => {
                      try {
                        register(formikProps.values).then((response) => {
                          Keyboard.dismiss()
                          if (response.jwt) {
                            console.log('JWT')
                          } else if (response.error) {
                            alert(response.error)
                          } else {
                            alert('Unknown Registration Error')
                          }
                        })
                      } catch (err) {
                        console.log(err)
                      }
                    }}
                  />
                </View>
              )}
            </View>
          </React.Fragment>
        )}
      </Formik>
    </CenteredLayout>
  )
}

export default Register
