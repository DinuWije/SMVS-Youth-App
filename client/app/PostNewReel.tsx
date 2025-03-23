import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

const VIDEO_STORAGE_KEY = 'videoList'; // Key to store video list in AsyncStorage

// Example categories for multi-select
const ALL_CATEGORIES = ['Well-being', 'Health', 'Fitness', 'Mindfulness'];
const ALL_LOCATIONS = [
  'Atlanta',
  'New York',
  'Boston',
  'Cherry Hill',
  'Chicago',
  'Edison',
  'Jersey City',
  'San Francisco',
  'Toronto',
  'United Kingdom',
];

const PostNewReel: React.FC = () => {
  const router = useRouter(); // 🔥 Using router from expo-router
  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Multi-select categories
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

  // Toggle a category in or out of the selectedCategories array
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      // Remove it if already selected
      setSelectedCategories((prev) => prev.filter((cat) => cat !== category));
    } else {
      // Add it if not selected
      setSelectedCategories((prev) => [...prev, category]);
    }
  };

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
      router.push('/ReelsScreen'); // Ensure it goes to reelsScreen
    } catch (error) {
      console.error('Error saving video:', error);
      Alert.alert('Error', 'Failed to upload video.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push('/ReelsScreen');
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Post New Video</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter video title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Multi-Select Categories */}
        <Text style={styles.label}>Categories</Text>
        <View style={styles.categoriesContainer}>
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={styles.categoryText}>{cat}</Text>
                {isSelected && <FontAwesome name="check" size={16} color="green" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Single-Select Location (For Example) */}

        <Text style={styles.label}>Locations</Text>
        <View style={styles.categoriesContainer}>
          {ALL_LOCATIONS.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={styles.categoryText}>{cat}</Text>
                {isSelected && <FontAwesome name="check" size={16} color="green" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Video Selection */}
        <Text style={styles.label}>Video</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={pickVideo}>
          <Text style={styles.uploadText}>
            {videoFile ? 'Video Selected' : 'Upload Video'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Publish Button at the Bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity style={styles.publishButton} onPress={saveVideo}>
          <Text style={styles.publishText}>Publish</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostNewReel;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {},
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRightSpace: {
    width: 28,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  categoryItem: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryItemSelected: {
    backgroundColor: '#d0ffd0', // Light green when selected
  },
  categoryText: {
    fontSize: 14,
    color: '#555',
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
    flexWrap: 'wrap',
  },
  locationOption: {
    backgroundColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  locationSelected: {
    backgroundColor: '#d0ffd0',
  },
  locationText: {
    fontSize: 14,
    color: '#555',
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
    paddingBottom: 30,
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
