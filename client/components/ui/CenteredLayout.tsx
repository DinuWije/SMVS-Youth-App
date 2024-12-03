import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

// This component wraps the children with the centering layout
const CenteredLayout = ({ children }) => {
  return (
    <SafeAreaView style={styles.container}>
      {children}
    </SafeAreaView>
  );
};

// Styles for centering content
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Set background color to white
    justifyContent: 'center', // Center content vertically
    alignItems: 'center',     // Center content horizontally
  },
});

export default CenteredLayout;
