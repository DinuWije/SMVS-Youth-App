import CenteredLayout from '@/components/ui/CenteredLayout'
import React from 'react'
import { Button, Text } from 'react-native'

const Welcome = ({ navigation }) => {
  return (
    <CenteredLayout>
      <Button title="Sign In" onPress={() => navigation.navigate('Login')} />
      <Button
        title="Create Account"
        onPress={() => navigation.navigate('Register')}
      />
    </CenteredLayout>
  )
}

export default Welcome
