import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';

const VIDEO_STORAGE_KEY = 'videoList'; // Key to store video list in AsyncStorage

const PostNewReel: React.FC = () => {
  const router = useRouter(); // 🔥 Correctly using router from expo-router
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Well-being');
  const [location, setLocation] = useState('Atlanta');
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoList, setVideoList] = useState<string[]>([]);

  // Load stored video list from AsyncStorage
  useEffect(() => {
    const fetchVideoList = async () => {
      try {
        const storedVideos = await AsyncStorage.getItem(VIDEO_STORAGE_KEY);
        if (storedVideos) {
          setVideoList(JSON.parse(storedVideos));
        }
      } catch (error) {
        console.error('Error fetching video list:', error);
      }
    };

    fetchVideoList();
  }, []);

  // Handle Video Selection
  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideoFile(result.assets[0].uri);
    }
  };

  // Save video with correct filename & update storage
  const saveVideo = async () => {
    if (!videoFile) {
      Alert.alert('Error', 'Please select a video to upload.');
      return;
    }

    const newVideoName = `${videoList.length + 1}.mp4`;
    const newVideoPath = `/assets/videos/${newVideoName}`;

    try {
      // Append new video to list
      const updatedVideos = [...videoList, newVideoPath];
      await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(updatedVideos));
      setVideoList(updatedVideos);

      Alert.alert('Success', 'Video uploaded successfully!');
      router.back(); 
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Error', 'Failed to upload video.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesome name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Post New Video</Text>
      </View>

      {/* Form Inputs (Top Half of Screen) */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter video title"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Category</Text>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Well-being" value="Well-being" />
          <Picker.Item label="Health" value="Health" />
          <Picker.Item label="Fitness" value="Fitness" />
          <Picker.Item label="Mindfulness" value="Mindfulness" />
        </Picker>

        <Text style={styles.label}>Location</Text>
        <Picker
          selectedValue={location}
          onValueChange={(itemValue) => setLocation(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Atlanta" value="Atlanta" />
          <Picker.Item label="New York" value="New York" />
          <Picker.Item label="Los Angeles" value="Los Angeles" />
          <Picker.Item label="Chicago" value="Chicago" />
          <Picker.Item label="Edison" value="Edison" />
          <Picker.Item label="Jersey City" value="Jersey City" />
          <Picker.Item label="San Francisco" value="San Francisco" />
          <Picker.Item label="Toronto" value="Toronto" />
          <Picker.Item label="United Kingdom" value="United Kingdom" />
        </Picker>

        <Text style={styles.label}>Video</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
          <Text style={styles.uploadText}>
            {videoFile ? 'Video Selected' : 'Upload Video'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Publish Button at the Bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.publishButton} onPress={saveVideo}>
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flex: 1, // Pushes form to top half
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginTop: 5,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
  },
  uploadBox: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginTop: 5,
  },
  uploadText: {
    fontSize: 14,
    color: '#555',
  },
  bottomButtonContainer: {
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30, // Pushes to bottom
  },
  publishButton: {
    backgroundColor: '#9B5DE5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  publishText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default PostNewReel;
