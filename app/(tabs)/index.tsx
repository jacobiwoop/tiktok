import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Dimensions, ActivityIndicator } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useMedia } from '@/context/MediaContext';
import { TikTokColors } from '@/constants/Colors';

const { height } = Dimensions.get('window');
// On soustrait approximativement la hauteur de la barre de navigation
const ITEM_HEIGHT = height - 49; 

export default function VideoFeedScreen() {
  const { selectedAlbums } = useMedia();
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedAlbums.length > 0) {
      loadVideosFromAlbums();
    }
  }, [selectedAlbums]);

  const loadVideosFromAlbums = async () => {
    setLoading(true);
    let allAssets: MediaLibrary.Asset[] = [];
    
    try {
      for (const albumId of selectedAlbums) {
        const result = await MediaLibrary.getAssetsAsync({
          album: albumId,
          mediaType: 'video', // On ne veut que les vidéos !
          first: 20, // On en charge 20 pour commencer
        });
        allAssets = [...allAssets, ...result.assets];
      }
      
      // On mélange ou on trie selon tes préférences, ici on prend tel quel
      setVideos(allAssets);
    } catch (error) {
      console.error("Erreur lors du chargement des vidéos :", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
    return (
      <View style={[styles.videoContainer, { height: ITEM_HEIGHT }]}>
        {/* Placeholder avant d'intégrer le vrai lecteur vidéo */}
        <Text style={{ color: 'white' }}>Vidéo : {item.filename}</Text>
        <Text style={{ color: 'gray' }}>Durée : {item.duration}s</Text>
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
          <Text style={{ color: 'white' }}>Aucune vidéo trouvée dans ces dossiers.</Text>
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
    borderBottomColor: '#222', // Pour voir la séparation temporairement
  },
});
