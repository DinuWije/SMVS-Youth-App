import CenteredLayout from "@/components/ui/CenteredLayout";
import React from "react";
import { Button, Text } from "react-native";

const Welcome = ({ navigation }) => {
  return (
    <CenteredLayout>
      <Text>SMVS Youth App</Text>
      <Text>Now your spirituality is in one place and always in your control</Text>
      <Button title="Sign In" onPress={() => navigation.navigate('Login')} />
      <Button title="Create Account" onPress={() => navigation.navigate('Register')} />
    </CenteredLayout>
  )
}

export default Welcome;
