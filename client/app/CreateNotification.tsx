import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Picker } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import NotificationAPIClient, { SendEmailInfo } from '@/APIClients/NotificationAPIClient';

const locations = [
  "Atlanta", "Boston", "Cherry Hill", "Chicago", "Edison", "Jersey City", "San Francisco", "Toronto", "United Kingdom"
];

const CreateNotification = () => {
  const router = useRouter();

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSendNotification = async () => {
    if (!subject.trim() || !content.trim()) {
      alert('Please enter both subject and content.');
      return;
    }

    const emailData = {
      subject: subject.trim(),
      body: content.trim(),
      location: selectedLocation || null, // Send location only if selected
    };

    try {
      await NotificationAPIClient.send_email({
        entityData: emailData,
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error sending email notification', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-white px-4 py-6">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-black ml-4">Send Notification Email</Text>
      </View>

      {/* Form */}
      <View className="flex-1 py-6 space-y-6">
        {/* Email Subject */}
        <View>
          <Text className="text-xs text-gray-500">EMAIL SUBJECT</Text>
          <TextInput
            className="border-b border-gray-300 text-lg text-black py-2"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        {/* Location Dropdown */}
        <View>
          <Text className="text-xs text-gray-500">SELECT LOCATION (OPTIONAL)</Text>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={(itemValue) => setSelectedLocation(itemValue)}
          >
            <Picker.Item label="All Locations" value="" />
            {locations.map((location) => (
              <Picker.Item key={location} label={location} value={location} />
            ))}
          </Picker>
        </View>

        {/* Email Content */}
        <View className="flex-1 py-4 space-y-4">
          <Text className="text-xs text-gray-500">EMAIL CONTENT</Text>
          <TextInput
            className="border border-gray-300 text-lg text-black py-2 px-2 rounded-md h-32"
            value={content}
            onChangeText={setContent}
            multiline
          />
        </View>
      </View>

      {/* Send Button */}
      <View className="px-4 py-4">
        <TouchableOpacity
          style={{ backgroundColor: Colors.light.accentPurple, borderRadius: 10, paddingVertical: 16 }}
          onPress={handleSendNotification}
        >
          <Text className="text-center text-white text-lg font-bold">SEND NOTIFICATION EMAIL</Text>
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showModal} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-3/4">
            <Text className="text-lg font-bold text-black">Notification Email Sent!</Text>
            <Text className="text-gray-600 mt-2">Users with notifications enabled will be emailed.</Text>
            <TouchableOpacity
              className="mt-4 p-2 rounded"
              onPress={handleCloseModal}
              style={{ backgroundColor: Colors.light.accentPurple }}
            >
              <Text className="text-white text-center">OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CreateNotification;
