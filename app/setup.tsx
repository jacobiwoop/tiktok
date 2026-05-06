import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { useMedia } from '@/context/MediaContext';
import { TikTokColors } from '@/constants/Colors';
import { CheckCircle, Circle } from 'lucide-react-native';

export default function SetupScreen() {
  const { hasPermission, requestPermission, saveSelectedAlbums } = useMedia();
  const router = useRouter();
  
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasPermission) {
      loadAlbums();
    }
  }, [hasPermission]);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
      // On filtre pour ne garder que ceux qui ont des items
      setAlbums(fetchedAlbums.filter(a => a.assetCount > 0));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAlbum = (id: string) => {
    setLocalSelected(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (localSelected.length === 0) {
      alert("Veuillez sélectionner au moins un dossier.");
      return;
    }
    await saveSelectedAlbums(localSelected);
    router.replace('/(tabs)');
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.title}>Bienvenue !</Text>
          <Text style={styles.subtitle}>Pour commencer, TikTok Local a besoin d'accéder à tes vidéos.</Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Quels dossiers utiliser ?</Text>
      <Text style={styles.subtitle}>Sélectionne les sources de tes vidéos</Text>

      {loading ? (
        <ActivityIndicator size="large" color={TikTokColors.cyan} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = localSelected.includes(item.id);
            return (
              <TouchableOpacity 
                style={[styles.albumItem, isSelected && styles.albumItemSelected]} 
                onPress={() => toggleAlbum(item.id)}
              >
                <View style={styles.albumInfo}>
                  <Text style={styles.albumTitle}>{item.title}</Text>
                  <Text style={styles.albumCount}>{item.assetCount} éléments</Text>
                </View>
                {isSelected ? (
                  <CheckCircle color={TikTokColors.red} size={24} />
                ) : (
                  <Circle color={TikTokColors.gray} size={24} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity 
        style={[styles.button, localSelected.length === 0 && styles.buttonDisabled]} 
        onPress={handleFinish}
        disabled={localSelected.length === 0}
      >
        <Text style={styles.buttonText}>Lancer TikTok</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TikTokColors.black,
    padding: 20,
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
    marginTop: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: TikTokColors.gray,
    textAlign: 'center',
    marginBottom: 30,
  },
  list: {
    paddingBottom: 20,
  },
  albumItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#111',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  albumItemSelected: {
    borderColor: TikTokColors.red,
    backgroundColor: '#222',
  },
  albumInfo: {
    flex: 1,
  },
  albumTitle: {
    fontSize: 18,
    color: TikTokColors.white,
    fontWeight: '600',
  },
  albumCount: {
    fontSize: 14,
    color: TikTokColors.gray,
    marginTop: 4,
  },
  button: {
    backgroundColor: TikTokColors.red,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#444',
  },
  buttonText: {
    color: TikTokColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
