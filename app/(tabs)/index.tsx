import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useMedia } from '@/context/MediaContext';
import { TikTokColors } from '@/constants/Colors';

const { StorageAccessFramework } = FileSystem;
const { height } = Dimensions.get('window');
const ITEM_HEIGHT = height - 49; 

// On crée un petit type pour représenter nos vidéos locales
type LocalVideo = {
  id: string;
  uri: string;
  filename: string;
};

export default function VideoFeedScreen() {
  const { selectedDirectoryUri } = useMedia();
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedDirectoryUri) {
      loadVideosFromDirectory();
    }
  }, [selectedDirectoryUri]);

  const loadVideosFromDirectory = async () => {
    setLoading(true);
    
    try {
      // 1. On lit tout le contenu du dossier sélectionné
      const files = await StorageAccessFramework.readDirectoryAsync(selectedDirectoryUri!);
      
      // 2. On filtre pour ne garder que les vidéos
      const videoUris = files.filter(uri => {
        const lowerUri = uri.toLowerCase();
        return lowerUri.endsWith('.mp4') || lowerUri.endsWith('.mkv') || lowerUri.endsWith('.mov') || lowerUri.endsWith('.webm');
      });

      // 3. On formate les données pour notre FlatList
      const formattedVideos: LocalVideo[] = videoUris.map((uri, index) => {
        // On extrait le nom du fichier à partir de l'URI (un peu basique mais ça marche)
        const parts = uri.split('%2F'); // %2F est souvent le slash encodé
        const filename = parts[parts.length - 1] || `Video_${index}`;
        
        return {
          id: uri,
          uri: uri,
          filename: decodeURIComponent(filename),
        };
      });

      setVideos(formattedVideos);
    } catch (error) {
      console.error("Erreur lors du chargement du dossier :", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: LocalVideo }) => {
    return (
      <View style={[styles.videoContainer, { height: ITEM_HEIGHT }]}>
        {/* Placeholder avant d'intégrer expo-video */}
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
          🎥 {item.filename}
        </Text>
        <Text style={{ color: TikTokColors.gray }}>Prêt à être lu</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={TikTokColors.cyan} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {videos.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: 'white', textAlign: 'center' }}>Aucune vidéo mp4/mkv trouvée dans ce dossier.</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
});

