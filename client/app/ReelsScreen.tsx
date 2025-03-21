// import React, { useRef, useState, useEffect } from 'react';
// import { FlatList, View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
// import { FontAwesome } from '@expo/vector-icons';
// import NavigationBar from '../components/NavigationBar';

// const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// // Sample video list
// const videoList = [
//   { title: 'Sunset Bliss', videoSrc: require('../assets/videos/1.mp4'), location: 'San Francisco', likes: '106K' },
//   { title: 'Mountain Peaks', videoSrc: require('../assets/videos/2.mp4'), location: 'Toronto', likes: '85K' },
//   { title: 'City Lights', videoSrc: require('../assets/videos/3.mp4'), location: 'Boston', likes: '150K' },
//   { title: 'City Lights', videoSrc: require('../assets/videos/4.mp4'), location: 'Boston', likes: '150K' },
//   { title: 'City Lights', videoSrc: require('../assets/videos/5.mp4'), location: 'Boston', likes: '150K' },
// ];

// // Locations array for reference
// const locations = [
//   "Atlanta", "Boston", "Cherry Hill", "Chicago", "Edison",
//   "Jersey City", "San Francisco", "Toronto", "United Kingdom"
// ];

// const ReelsScreen: React.FC = () => {
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
//   const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

//   const handleScroll = (event: any) => {
//     const contentOffsetY = event.nativeEvent.contentOffset.y;
//     const index = Math.round(contentOffsetY / screenHeight);
//     setCurrentVideoIndex(index);
//   };

//   useEffect(() => {
//     videoRefs.current.forEach((video, index) => {
//       if (video) {
//         if (index === currentVideoIndex) {
//           video.play();
//         } else {
//           video.pause();
//         }
//       }
//     });
//   }, [currentVideoIndex]);

//   const renderItem = ({ item, index }: { item: any; index: number }) => (
//     <View style={styles.videoContainer}>
//       <video
//         ref={(ref) => (videoRefs.current[index] = ref)}
//         src={item.videoSrc}
//         muted
//         loop
//         playsInline
//         style={styles.video}
//       />
//       {/* Overlay for title, location, and likes */}
//       <View style={styles.overlayContainer}>
//         {/* Title and Location (Bottom Left) */}
//         <View style={styles.textContainer}>
//           <Text style={styles.title}>{item.title}</Text>
//           <Text style={styles.location}>{item.location}</Text>
//         </View>

//         {/* Like Button (Bottom Right) */}
//         {/* <View style={styles.likeContainer}>
//           <FontAwesome name="heart" size={16} color="white" />
//           <Text style={styles.likeText}>{item.likes}</Text>
//         </View> */}
//       </View>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={videoList}
//         renderItem={renderItem}
//         keyExtractor={(item, index) => String(index)}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//         pagingEnabled
//         showsVerticalScrollIndicator={false}
//         snapToInterval={screenHeight}
//         snapToAlignment="start"
//         decelerationRate="fast"
//       />

//       {/* Floating Add Reel Button */}
//       <TouchableOpacity
//         style={styles.addReelButton}
//         onPress={() => console.log("Navigate to PostNewReel")}
//       >
//         <FontAwesome name="plus" size={24} color="white" />
//       </TouchableOpacity>

//       <NavigationBar />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//   },
//   videoContainer: {
//     height: screenHeight,
//     width: screenWidth,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   video: {
//     width: '100vw',
//     height: '100vh',
//     objectFit: 'cover',
//   },
//   overlayContainer: {
//     position: 'absolute',
//     bottom: 70,
//     left: 20,
//     right: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   textContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//   },
//   title: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: 'white',
//   },
//   location: {
//     fontSize: 12,
//     color: 'white',
//   },
//   likeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     borderRadius: 12,
//   },
//   likeText: {
//     fontSize: 14,
//     color: 'white',
//     fontWeight: 'bold',
//   },
//   addReelButton: {
//     position: 'absolute',
//     bottom: 80,
//     right: 20,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     padding: 16,
//     borderRadius: 50,
//   },
// });

// export default ReelsScreen;


import React, { useRef, useState, useEffect } from 'react';
import { FlatList, View, Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import NavigationBar from '../components/NavigationBar';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

// Sample video list
const videoList = [
  { title: 'Sunset Bliss', videoSrc: require('../assets/videos/1.mp4'), location: 'San Francisco', likes: '106K' },
  { title: 'Mountain Peaks', videoSrc: require('../assets/videos/2.mp4'), location: 'Toronto', likes: '85K' },
  { title: 'City Lights', videoSrc: require('../assets/videos/3.mp4'), location: 'Boston', likes: '150K' },
  { title: 'Urban Flow', videoSrc: require('../assets/videos/4.mp4'), location: 'Chicago', likes: '98K' },
  { title: 'Nature Sounds', videoSrc: require('../assets/videos/5.mp4'), location: 'Atlanta', likes: '120K' },
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
        src={item.videoSrc}
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
        onPress={() => router.push('/PostNewReel')} // ✅ Navigates properly
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
