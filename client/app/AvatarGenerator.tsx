// import React, { useRef, useState, useCallback, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ActivityIndicator,
//   Alert,
// } from 'react-native';
// import Webcam from 'react-webcam';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { getLocalStorageObj } from '../utils/LocalStorageUtils';
// import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';

// const videoConstraints = {
//   width: 640,
//   height: 480,
//   facingMode: 'user',
// };

// const AvatarGenerator: React.FC = () => {
//   const router = useRouter();
//   const webcamRef = useRef<Webcam>(null);

//   // State for captured image and generated avatar
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const [avatar, setAvatar] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
  
//   // State for current user (to get user id)
//   const [user, setUser] = useState<any>(null);

//   // Fetch current user on mount
//   useEffect(() => {
//     async function fetchUser() {
//       const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
//       if (userObject) {
//         setUser(userObject);
//       }
//     }
//     fetchUser();
//   }, []);

//   // Capture image from webcam
//   const capture = useCallback(() => {
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot();
//       if (imageSrc) {
//         setCapturedImage(imageSrc);
//         setAvatar(null); // reset previous avatar if any
//       } else {
//         window.alert('Error: Failed to capture image.');
//       }
//     }
//   }, []);

//   // Generate avatar by sending captured image to /cartoonify endpoint
//   const handleGenerateAvatar = async () => {
//     if (!capturedImage) {
//       window.alert('Error: Please capture an image first.');
//       return;
//     }
//     setLoading(true);
//     try {
//       console.log("Sending image to /cartoonify endpoint...");
//       const response = await fetch('http://localhost:8082/cartoonify', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ imageBase64: capturedImage }),
//       });
//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.error || 'Failed to cartoonify image');
//       }
//       const data = await response.json();
//       const { cartoonImage } = data;
//       console.log("Avatar generated successfully.");
//       setAvatar(cartoonImage);
//     } catch (error: any) {
//       console.error('Error generating avatar:', error);
//       window.alert(`Error: ${error.message || 'Failed to generate avatar.'}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset captured image and avatar for retaking photo
//   const retakePhoto = () => {
//     setCapturedImage(null);
//     setAvatar(null);
//   };

//   // Save avatar as profile pic, naming it with the user's ID
//   const handleSaveProfilePic = async () => {
//     if (!avatar) {
//       window.alert('Error: No avatar to save!');
//       return;
//     }
//     if (!user || !user.id) {
//       window.alert('Error: User information not found!');
//       return;
//     }
//     setSaving(true);
//     try {
//       console.log("Sending avatar to /saveProfilePic endpoint...");
//       const response = await fetch('http://localhost:8082/saveProfilePic', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           avatarBase64: avatar,
//           user_id: user.id, // Save image as <user.id>.jpg
//         }),
//       });
//       console.log("Response from /saveProfilePic:", response);
//       if (!response.ok) {
//         const errData = await response.json();
//         throw new Error(errData.error || 'Failed to save profile pic');
//       }
//       const data = await response.json();
//       console.log("Profile pic saved:", data);
//     //   window.alert(`Success: ${data.message}`);
//       router.push('/AccountSettings');
//     } catch (error: any) {
//       console.error('Error saving profile pic:', error);
//     //   window.alert(`Error: ${error.message || 'Failed to save profile pic.'}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.push('/AccountSettings')}>
//           <Ionicons name="arrow-back-outline" size={28} color="#333" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Avatar Generator</Text>
//       </View>

//       {!capturedImage ? (
//         <View style={styles.captureContainer}>
//           <Webcam
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             videoConstraints={videoConstraints}
//             style={styles.webcam}
//           />
//           <TouchableOpacity style={styles.captureButton} onPress={capture}>
//             <Text style={styles.captureButtonText}>Capture Image</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <View style={styles.previewContainer}>
//           <Text style={styles.previewHeader}>Preview</Text>
//           <Image source={{ uri: capturedImage }} style={styles.previewImage} />

//           {/* Generate Avatar Button */}
//           <TouchableOpacity
//             style={styles.generateButton}
//             onPress={handleGenerateAvatar}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text style={styles.generateButtonText}>Generate Avatar</Text>
//             )}
//           </TouchableOpacity>

//           {/* Display the Avatar if available */}
//           {avatar && (
//             <View style={styles.avatarResultContainer}>
//               <Text style={styles.avatarResultText}>Your AnimeGAN Avatar</Text>
//               <View style={styles.avatarFrame}>
//                 <Image source={{ uri: avatar }} style={styles.avatarImage} />
//               </View>

//               {/* Save as Profile Pic Button */}
//               <TouchableOpacity
//                 style={styles.saveButton}
//                 onPress={handleSaveProfilePic}
//                 disabled={saving}
//               >
//                 {saving ? (
//                   <ActivityIndicator color="#fff" />
//                 ) : (
//                   <Text style={styles.saveButtonText}>Save as Profile Pic</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           )}

//           {/* Retake Photo */}
//           <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
//             <Text style={styles.retakeButtonText}>Retake Photo</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </View>
//   );
// };

// export default AvatarGenerator;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fefefe',
//     paddingHorizontal: 20,
//     paddingTop: 40,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '600',
//     color: '#333',
//     marginLeft: 10,
//   },
//   captureContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   webcam: {
//     width: 640,
//     height: 480,
//     backgroundColor: '#000',
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   captureButton: {
//     marginTop: 20,
//     backgroundColor: '#1178F8',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   captureButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   previewContainer: {
//     alignItems: 'center',
//   },
//   previewHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//     color: '#333',
//   },
//   previewImage: {
//     width: 320,
//     height: 240,
//     borderRadius: 10,
//     backgroundColor: '#ccc',
//     marginBottom: 20,
//   },
//   generateButton: {
//     backgroundColor: '#28a745',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   generateButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   avatarResultContainer: {
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 20,
//   },
//   avatarResultText: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 8,
//     color: '#333',
//   },
//   avatarFrame: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#ddd',
//     marginBottom: 12,
//   },
//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     resizeMode: 'cover',
//   },
//   saveButton: {
//     backgroundColor: '#FF9900',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   saveButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   retakeButton: {
//     backgroundColor: '#555',
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//     borderRadius: 8,
//   },
//   retakeButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '500',
//   },
// });


import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Webcam from 'react-webcam';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getLocalStorageObj } from '../utils/LocalStorageUtils';
import AUTHENTICATED_USER_KEY from '../constants/AuthConstants';

const videoConstraints = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const AvatarGenerator = () => {
  const router = useRouter();
  const webcamRef = useRef(null);

  // State for captured image and generated avatar
  const [capturedImage, setCapturedImage] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // State for current user (to get user id)
  const [user, setUser] = useState(null);

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      const userObject = await getLocalStorageObj(AUTHENTICATED_USER_KEY);
      if (userObject) {
        setUser(userObject);
      }
    }
    fetchUser();
  }, []);

  // Capture image from webcam
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedImage(imageSrc);
        setAvatar(null); // reset previous avatar if any
      } else {
        window.alert('Error: Failed to capture image.');
      }
    }
  }, []);

  // Generate avatar by sending captured image to /cartoonify endpoint
  const handleGenerateAvatar = async () => {
    if (!capturedImage) {
      window.alert('Error: Please capture an image first.');
      return;
    }
    setLoading(true);
    try {
      console.log("Sending image to /cartoonify endpoint...");
      const response = await fetch('http://localhost:8082/cartoonify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: capturedImage }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to cartoonify image');
      }
      const data = await response.json();
      const { cartoonImage } = data;
      console.log("Avatar generated successfully.");
      setAvatar(cartoonImage);
    } catch (error) {
      console.error('Error generating avatar:', error);
      window.alert(`Error: ${error.message || 'Failed to generate avatar.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset captured image and avatar for retaking photo
  const retakePhoto = () => {
    setCapturedImage(null);
    setAvatar(null);
  };

  // Save avatar as profile pic, naming it with the user's ID
  const handleSaveProfilePic = async () => {
    if (!avatar) {
      window.alert('Error: No avatar to save!');
      return;
    }
    if (!user || !user.id) {
      window.alert('Error: User information not found!');
      return;
    }
    setSaving(true);
    try {
      console.log("Sending avatar to /saveProfilePic endpoint...");
      const response = await fetch('http://localhost:8082/saveProfilePic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarBase64: avatar,
          user_id: user.id, // Save image as <user.id>.jpg
        }),
      });
      console.log("Response from /saveProfilePic:", response);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save profile pic');
      }
      const data = await response.json();
      console.log("Profile pic saved:", data);
      router.push('/AccountSettings');
    } catch (error) {
      console.error('Error saving profile pic:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/AccountSettings')}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Avatar Generator</Text>
      </View>

      {!capturedImage ? (
        <View style={styles.captureContainer}>
          <View style={styles.webcamContainer}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              style={styles.webcam}
            />
          </View>
          <TouchableOpacity style={styles.captureButton} onPress={capture}>
            <Ionicons name="camera" size={22} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          </View>

          {!avatar ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleGenerateAvatar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Generate Avatar</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.avatarResultContainer}>
              <Text style={styles.sectionTitle}>Your AnimeGAN Avatar</Text>
              <View style={styles.avatarFrame}>
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              </View>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSaveProfilePic}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Save as Profile Pic</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.secondaryButton} onPress={retakePhoto}>
            <Ionicons name="refresh" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Retake Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AvatarGenerator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginLeft: 12,
  },
  captureContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webcamContainer: {
    width: '100%',
    height: 480,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  webcam: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    alignSelf: 'center',
  },
  imagePreviewContainer: {
    width: 320,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 320,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 320,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 320,
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5C6BC0',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '90%',
    maxWidth: 320,
    marginTop: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarResultContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
  },
  avatarFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});