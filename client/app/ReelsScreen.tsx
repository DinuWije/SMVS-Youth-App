import React, { useRef, useState, useEffect } from 'react';
import { FlatList, View, Dimensions, StyleSheet, Text, TouchableOpacity, Image, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';
import { Video } from 'expo-av';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const firebaseVideoUrl =
  'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4678261-hd_1080_1920_25fps.mp4?alt=media&token=a15d672d-805a-439e-8011-d5e3c5b994b4';
const sampleVideoUrl2 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434150-hd_1080_1920_30fps.mp4?alt=media&token=ffd023e5-5599-48ae-93b7-bf54b3ad587e';
const sampleVideoUrl3 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434286-hd_1080_1920_30fps.mp4?alt=media&token=7dc85882-95f1-4c86-824c-b97954994e34';
const sampleVideoUrl4 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/6010489-uhd_2160_3840_25fps.mp4?alt=media&token=6a8b87c1-abf5-43a8-9ebe-c9dffc0c8d0c';
const sampleVideoUrl5 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434242-uhd_2160_3840_24fps.mp4?alt=media&token=973c6f6c-aa69-43be-8b2d-44a48c733416';
const sampleVideoUrl6 =  'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4040354-uhd_2160_3840_30fps.mp4?alt=media&token=e48457c7-1402-4ff1-a0c0-8f2c25f876a5';

const videoList = [
  { 
    title: 'Sunset Bliss', 
    videoUrl: firebaseVideoUrl, 
    location: 'San Francisco', 
    user: 'natureviewer',
    profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
    caption: 'Full moon reflecting over the Bay Area waters.',
    hashtags: ['moonlight', 'bayarea', 'sanfrancisco', 'nightsky', 'well-being', 'health', 'fitness', 'mindfulness']
  },
  { 
    title: 'Mountain Peaks', 
    videoUrl: sampleVideoUrl2, 
    location: 'Toronto', 
    user: 'adventureseeker',
    profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    caption: 'Finding peace at the mountain summit.',
    hashtags: ['mountains', 'hiking', 'outdoors', 'nature', 'well-being', 'health', 'fitness', 'mindfulness']
  },
  { 
    title: 'Scenic Drives', 
    videoUrl: sampleVideoUrl5, 
    location: 'Boston', 
    user: 'roadtripper',
    profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
    caption: 'Cruising through the countryside.',
    hashtags: ['driving', 'roadtrip', 'scenic', 'countryside', 'well-being', 'health', 'fitness', 'mindfulness']
  },
  { 
    title: 'Urban Flow', 
    videoUrl: sampleVideoUrl4, 
    location: 'Chicago', 
    user: 'cityscaper',
    profileImage: 'https://randomuser.me/api/portraits/women/29.jpg',
    caption: 'The city never sleeps.',
    hashtags: ['urban', 'citylife', 'architecture', 'nightcity', 'well-being', 'health', 'fitness', 'mindfulness']
  },
  { 
    title: 'Nature Sounds', 
    videoUrl: sampleVideoUrl3, 
    location: 'Atlanta', 
    user: 'soundscaper',
    profileImage: 'https://randomuser.me/api/portraits/men/55.jpg',
    caption: 'Listen to the peaceful sounds of nature.',
    hashtags: ['nature', 'sounds', 'peaceful', 'meditation', 'well-being', 'health', 'fitness', 'mindfulness']
  },
  { 
    title: 'Flowers', 
    videoUrl: sampleVideoUrl6, 
    location: 'Jersey City', 
    user: 'floraldesigner',
    profileImage: 'https://randomuser.me/api/portraits/women/33.jpg',
    caption: 'Spring blooms in the garden.',
    hashtags: ['flowers', 'garden', 'spring', 'colors', 'well-being', 'health', 'fitness', 'mindfulness']
  },
];

const ReelsScreen = () => {
  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(contentOffsetY / screenHeight);
    setCurrentVideoIndex(index);
    setExpandedCaption(false); // Reset caption expansion when scrolling
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video) {
        if (index === currentVideoIndex) {
          video.play();
        } else {
          video.pause();
        }
      }
    });
  }, [currentVideoIndex]);

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.videoContainer}>
      {Platform.OS === 'web' ? (
        <video
          ref={(ref) => (videoRefs.current[index] = ref)}
          src={item.videoUrl}
          muted
          loop
          playsInline
          autoPlay
          style={styles.video}
        />
      ) : (
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.videoUrl }}
          isMuted
          isLooping
          resizeMode="cover"
          shouldPlay={index === currentVideoIndex}
          style={styles.video}
        />
      )}

      {/* Top gradient overlay */}
      <View style={styles.topGradient}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>

      {/* Bottom gradient overlay with content */}
      <View style={styles.bottomGradient}>
        {/* User info and caption */}
        <View style={styles.userInfoContainer}>
          <Image 
            source={{ uri: item.profileImage }} 
            style={styles.profileImage} 
          />
          <View style={styles.userTextContainer}>
            <Text style={styles.username}>{item.user}</Text>
            <TouchableOpacity onPress={() => setExpandedCaption(!expandedCaption)}>
              <Text style={styles.caption} numberOfLines={expandedCaption ? undefined : 1}>
                {item.caption}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hashtags */}
        <View style={styles.hashtagContainer}>
          {item.hashtags.map((tag, idx) => (
            <Text key={idx} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videoList}
        renderItem={renderItem}
        keyExtractor={(item, index) => String(index)}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={screenHeight}
        snapToAlignment="start"
        decelerationRate="fast"
      />

      {/* Floating Add Reel Button */}
      <TouchableOpacity
        style={styles.addReelButton}
        onPress={() => router.push('/PostNewReel')}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>

      <NavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    height: screenHeight,
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100vw',
    height: '100vh',
    objectFit: 'cover',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0))',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#aaaaaa',
    marginLeft: 4,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 70, // Adjusted to make room for navigation bar
    left: 0,
    right: 0,
    paddingBottom: 10,
    paddingHorizontal: 15,
    // backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingTop: 40,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  userTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
  },
  caption: {
    fontSize: 14,
    color: 'white',
    marginTop: 2,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  hashtag: {
    fontSize: 13,
    color: '#4a90e2',
    marginRight: 8,
    marginBottom: 5,
  },
  addReelButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: '#9c64f4',
    padding: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ReelsScreen;