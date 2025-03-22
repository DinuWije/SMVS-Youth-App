import React, { useRef, useState, useEffect } from 'react';
import { FlatList, View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');


const firebaseVideoUrl =
  'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4678261-hd_1080_1920_25fps.mp4?alt=media&token=a15d672d-805a-439e-8011-d5e3c5b994b4';
const sampleVideoUrl2 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434150-hd_1080_1920_30fps.mp4?alt=media&token=ffd023e5-5599-48ae-93b7-bf54b3ad587e';
const sampleVideoUrl3 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434286-hd_1080_1920_30fps.mp4?alt=media&token=7dc85882-95f1-4c86-824c-b97954994e34';
const sampleVideoUrl4 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/6010489-uhd_2160_3840_25fps.mp4?alt=media&token=6a8b87c1-abf5-43a8-9ebe-c9dffc0c8d0c';
const sampleVideoUrl5 = 'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4434242-uhd_2160_3840_24fps.mp4?alt=media&token=973c6f6c-aa69-43be-8b2d-44a48c733416';
const sampleVideoUrl6 =  'https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/4040354-uhd_2160_3840_30fps.mp4?alt=media&token=e48457c7-1402-4ff1-a0c0-8f2c25f876a5';

const videoList = [
  { title: 'Sunset Bliss', videoUrl: firebaseVideoUrl, location: 'San Francisco', likes: '106K' },
  { title: 'Mountain Peaks', videoUrl: sampleVideoUrl2, location: 'Toronto', likes: '85K' },
  { title: 'Scenic Drives', videoUrl: sampleVideoUrl5, location: 'Boston', likes: '150K' },
  { title: 'Urban Flow', videoUrl: sampleVideoUrl4, location: 'Chicago', likes: '98K' },
  { title: 'Nature Sounds', videoUrl: sampleVideoUrl3, location: 'Atlanta', likes: '120K' },
  { title: 'Flowers', videoUrl: sampleVideoUrl6, location: 'Jersey City', likes: '120K' },
];


const ReelsScreen: React.FC = () => {
  const router = useRouter();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleScroll = (event: any) => {
    const contentOffsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(contentOffsetY / screenHeight);
    setCurrentVideoIndex(index);
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
      <video
        ref={(ref) => (videoRefs.current[index] = ref)}
        src={item.videoUrl}
        muted
        loop
        playsInline
        style={styles.video}
      />
      {/* Overlay for title and location */}
      <View style={styles.overlayContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.location}>{item.location}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
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
  overlayContainer: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  location: {
    fontSize: 12,
    color: 'white',
  },
  addReelButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
    borderRadius: 50,
  },
});

export default ReelsScreen;
