import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useMedia } from '@/context/MediaContext';
import { TikTokColors } from '@/constants/Colors';
import { FolderOpen } from 'lucide-react-native';

export default function SetupScreen() {
  const { pickDirectory } = useMedia();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePickFolder = async () => {
    setLoading(true);
    const success = await pickDirectory();
    setLoading(false);
    
    if (success) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerContent}>
        <FolderOpen size={64} color={TikTokColors.cyan} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Dossier Source</Text>
        <Text style={styles.subtitle}>
          Sélectionne le dossier principal (ex: Tubidy ou Download) contenant tes vidéos.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={TikTokColors.red} style={{ marginTop: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handlePickFolder}>
            <Text style={styles.buttonText}>Ouvrir l'explorateur</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TikTokColors.black,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TikTokColors.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TikTokColors.gray,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: TikTokColors.red,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: TikTokColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

