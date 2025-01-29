import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const NavigationBar = () => {
  const router = useRouter();

  return (
    <View className="flex-row justify-around items-center border-t border-gray-200 p-4 bg-white">
      <TouchableOpacity onPress={() => router.push('./Welcome')}>
        <FontAwesome5 name="home" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('./Login')}>
        <FontAwesome5 name="users" size={24} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('./Feed')}>
        <FontAwesome5 name="file-alt" size={24} color="purple" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('./Register')}>
        <FontAwesome5 name="cog" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );
};

export default NavigationBar;
