import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import NavigationBar from '../components/NavigationBar'
import { Colors } from '@/constants/Colors'
import { useRouter } from 'expo-router'
import SettingsAPIClient, {
  SettingsUserInfoResponse,
} from '@/APIClients/SettingsAPIClient'
import AuthAPIClient from '@/APIClients/AuthAPIClient'

const AccountSettings = () => {
  const router = useRouter()

  // User information state
  const [userData, setUserData] = useState<SettingsUserInfoResponse | null>(
    null
  )

  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response =
          (await SettingsAPIClient.get()) as SettingsUserInfoResponse[]

        if (response && response.length > 0) {
          setUserData(response[0])
        } else {
          console.warn('No data received from API')
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error)
        Alert.alert('Error', 'Failed to load profile data. Please try again.')
      }
    }

    fetchProfileData()
  }, [])

  const handleToggleNotifs = async () => {
    if (!userData) return

    const updatedNotifs = !userData.allowNotifs
    setUserData((prev) => prev && { ...prev, allowNotifs: updatedNotifs }) // Optimistically update UI

    try {
      const updatedUser = await SettingsAPIClient.update({
        entityData: { ...userData, allowNotifs: updatedNotifs },
      })

      if (!updatedUser) {
        throw new Error('Failed to update notifications')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      Alert.alert('Error', 'Failed to update settings. Please try again.')

      // Revert UI if API call fails
      setUserData((prev) => prev && { ...prev, allowNotifs: !updatedNotifs })
    }
  }

  const handleSendPasswordChangeEmail = async () => {
    if (!userData) return

    try {
      const resetLinkSent = await AuthAPIClient.resetPassword(userData?.email)

      if (!resetLinkSent) {
        throw new Error('Failed to send link')
      }
      setShowModal(true)
    } catch (error) {
      console.error('Error sending password reset email:', error)
      Alert.alert(
        'Error',
        'Failed to send password reset email. Please try again.'
      )
    }
  }

  const handleUserLogout = async () => {
    try {
      const userLoggedOut = await AuthAPIClient.logout()

      if (!userLoggedOut) {
        throw new Error('Failed to logout')
      }
      router.push({
        pathname: './Login',
      })
    } catch (error) {
      console.error('Error loggingout:', error)
      Alert.alert('Error', 'Failed to logout. Please try again.')
    }
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="p-4 border-b border-gray-200">
        <Text className="text-3xl font-bold text-black">Account Settings</Text>
      </View>

      {/* Settings Options */}
      <View className="flex-1 px-4 py-1 space-y-3">
        {/* Profile Information */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={() =>
            router.push({
              pathname: './ProfileSettings',
              params: { userData: JSON.stringify(userData) },
            })
          }
          disabled={!userData}
        >
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Profile Information
              </Text>
              <Text className="text-sm text-gray-500">
                Change your account information
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Interests */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={() =>
            router.push({
              pathname: './SettingsInterests',
              params: { userData: JSON.stringify(userData) },
            })
          }
        >
          <View className="flex-row items-center">
            <Ionicons name="flash-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Interests
              </Text>
              <Text className="text-sm text-gray-500">
                Add or remove your interested topics
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Change Password */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={handleSendPasswordChangeEmail}
        >
          <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Change Password
              </Text>
              <Text className="text-sm text-gray-500">
                Send an email with a secure reset link
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Notifications Section */}
        <Text className="text-lg font-semibold text-gray-700 mt-8">
          NOTIFICATIONS
        </Text>

        {/* Push Notifications */}
        <View className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="notifications-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Push Notifications
              </Text>
              <Text className="text-sm text-gray-500">
                Stay up to date with push notifications
              </Text>
            </View>
          </View>
          <Switch
            value={userData?.allowNotifs}
            onValueChange={handleToggleNotifs}
            trackColor={{
              false: 'gray',
              true: Colors.light.accentPurple,
            }}
          />
        </View>

        {/* More Section */}
        <Text className="text-lg font-semibold text-gray-700 mt-8">MORE</Text>

        {/* Rate Us */}
        <TouchableOpacity className="flex-row items-center justify-between border-b border-gray-200 py-4">
          <View className="flex-row items-center">
            <Ionicons name="star-outline" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">
                Rate Us
              </Text>
              <Text className="text-sm text-gray-500">
                Rate us on the Play Store or App Store
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-between border-b border-gray-200 py-4"
          onPress={handleUserLogout}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="logout" size={26} color="gray" />
            <View className="pl-4">
              <Text className="text-base font-semibold text-black">Logout</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <NavigationBar />

      <Modal visible={showModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            <Text className="text-lg font-bold text-black">
              Password Reset Email Sent!
            </Text>
            <Text className="text-gray-600 mt-2">
              Please check your junk folder if you don't see the email.
            </Text>

            <TouchableOpacity
              className="mt-4 p-2 rounded"
              onPress={() => setShowModal(false)}
              style={{
                backgroundColor: Colors.light.accentPurple,
              }}
            >
              <Text className="text-white text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default AccountSettings
