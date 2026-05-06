import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, ViewToken } from 'react-native';
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { useMedia } from '@/context/MediaContext';
import { TikTokColors } from '@/constants/Colors';
import VideoPost, { LocalVideo } from '@/components/VideoPost';

export default function VideoFeedScreen() {
  const { selectedDirectoryUri } = useMedia();
  const [videos, setVideos] = useState<LocalVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  useEffect(() => {
    if (selectedDirectoryUri) {
      loadVideosFromDirectory();
    }
  }, [selectedDirectoryUri]);

  const loadVideosFromDirectory = async () => {
    setLoading(true);
    
    try {
      const files = await StorageAccessFramework.readDirectoryAsync(selectedDirectoryUri!);
      
      const videoUris = files.filter((uri: string) => {
        const lowerUri = uri.toLowerCase();
        return lowerUri.endsWith('.mp4') || lowerUri.endsWith('.mkv') || lowerUri.endsWith('.mov') || lowerUri.endsWith('.webm');
      });

      const formattedVideos: LocalVideo[] = videoUris.map((uri: string, index: number) => {
        const parts = uri.split('%2F');
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

  // --- LOGIQUE TIKTOK (Viewability) ---
  // On détecte quel élément est le plus visible à l'écran
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== null) {
      setActiveVideoIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60, // L'élément doit être au moins à 60% à l'écran
  }).current;

  const renderItem = ({ item, index }: { item: LocalVideo; index: number }) => {
    return (
      <VideoPost 
        video={item} 
        isActive={index === activeVideoIndex} 
      />
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
          <Text style={{ color: 'white', textAlign: 'center' }}>Aucune vidéo trouvée dans ce dossier.</Text>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          // Optimisations de performance
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews={true}
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
});


