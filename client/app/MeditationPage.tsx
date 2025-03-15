import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Audio } from "expo-av";
import LottieView from "lottie-react-native";
import Slider from "@react-native-community/slider"; // Progress bar
import NavigationBar from "../components/NavigationBar";

// Example audio files
const AUDIO_FILES = [
  {
    id: "1",
    label: "Morning Calm",
    url: "https://firebasestorage.googleapis.com/v0/b/smvs-youth-app.firebasestorage.app/o/audio1.mp3?alt=media",
  },
  { id: "2", label: "Deep Relaxation", url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio2.mp3?alt=media" },
  { id: "3", label: "Focus Boost", url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio3.mp3?alt=media" },
  { id: "4", label: "Sleep Meditation", url: "https://firebasestorage.googleapis.com/v0/b/YOUR_BUCKET/o/audio4.mp3?alt=media" },
];

// Get screen dimensions for dynamic sizing
const { width } = Dimensions.get("window");

const MeditationPage = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);

  // State for the progress bar
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playAudio = async (url: string, id: string) => {
    try {
      // If something is already playing, stop/unload first
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setPlaying(null);
        setPaused(false);
      }

      setLoading(true);

      // Create a new Sound instance
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url });
      setSound(newSound);
      setPlaying(id);
      setPaused(false);
      setLoading(false);

      // Start playing audio
      await newSound.playAsync();

      // Update progress & handle completion
      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded) {
          // Update duration & progress if available
          if (status.durationMillis) {
            setDuration(status.durationMillis);
          }
          if (status.positionMillis && status.durationMillis) {
            setProgress(status.positionMillis / status.durationMillis);
          }

          // If the track finished, reset states
          if (status.didJustFinish) {
            await newSound.unloadAsync();
            setPlaying(null);
            setPaused(false);
            setProgress(0);
          }
        }
      });
    } catch (error) {
      console.error("Error playing audio:", error);
      setLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (!sound) return;
    if (paused) {
      // Resume
      await sound.playAsync();
      setPaused(false);
    } else {
      // Pause
      await sound.pauseAsync();
      setPaused(true);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Title */}
      <View className="px-6 py-4 flex-row justify-between items-center">
        <Text className="text-3xl font-bold">Meditation</Text>
      </View>

      {/* Animated Lottie (Bigger) */}
      <View className="items-center">
        {/* Set the parent size explicitly */}
        <View style={{ width: width, height: width }}>
          <LottieView
            source={require("../assets/meditationAnimation.json")}
            style={{ flex: 1 }}
            resizeMode="contain"
            autoPlay
            loop
          />
        </View>
      </View>

      {/* Dropdown Picker */}
      <View className="px-6 py-4">
        <DropDownPicker
          open={open}
          value={selectedAudio}
          items={AUDIO_FILES.map((audio) => ({ label: audio.label, value: audio.id }))}
          setOpen={setOpen}
          setValue={setSelectedAudio}
          placeholder="Select an audio"
        />
      </View>

      {/* Play/Pause Buttons */}
      <View className="px-6 flex-row justify-center items-center gap-4">
        {selectedAudio && (
          <TouchableOpacity
            className="bg-purple-500 px-6 py-3 rounded-lg"
            onPress={() => {
              const audio = AUDIO_FILES.find((a) => a.id === selectedAudio);
              if (audio) playAudio(audio.url, audio.id);
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-lg">Play</Text>
            )}
          </TouchableOpacity>
        )}

        {playing && (
          <TouchableOpacity
            className="bg-gray-500 px-6 py-3 rounded-lg"
            onPress={pauseAudio}
          >
            <Text className="text-white text-lg">{paused ? "Resume" : "Pause"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      {playing && (
        <View className="px-6 mt-4">
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={0}
            maximumValue={1}
            value={progress}
            minimumTrackTintColor="#8e44ad"
            maximumTrackTintColor="#ccc"
            thumbTintColor="#8e44ad"
            onSlidingComplete={(val) => {
              if (sound && duration > 0) {
                const newPosition = val * duration;
                sound.setPositionAsync(newPosition);
              }
            }}
          />
        </View>
      )}

      {/* Navigation Bar */}
      <View className="absolute bottom-0 left-0 right-0">
        <NavigationBar />
      </View>
    </View>
  );
};

export default MeditationPage;
