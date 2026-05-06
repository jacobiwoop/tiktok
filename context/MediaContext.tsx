import React, { createContext, useContext, useState, useEffect } from 'react';
import * as MediaLibrary from 'expo-media-library';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MediaContextType = {
  isReady: boolean;
  hasPermission: boolean;
  selectedAlbums: string[];
  saveSelectedAlbums: (albumIds: string[]) => Promise<void>;
  requestPermission: () => Promise<boolean>;
};

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

const ALBUMS_STORAGE_KEY = '@tiktok_selected_albums';

export const MediaProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);

  useEffect(() => {
    async function initContext() {
      try {
        // 1. Vérifier les permissions actuelles sans les forcer
        const permissionInfo = await MediaLibrary.getPermissionsAsync();
        setHasPermission(permissionInfo.granted);

        // 2. Charger les albums sauvegardés
        const savedAlbums = await AsyncStorage.getItem(ALBUMS_STORAGE_KEY);
        if (savedAlbums) {
          setSelectedAlbums(JSON.parse(savedAlbums));
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du MediaContext", error);
      } finally {
        setIsReady(true);
      }
    }

    initContext();
  }, []);

  const requestPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const saveSelectedAlbums = async (albumIds: string[]) => {
    try {
      await AsyncStorage.setItem(ALBUMS_STORAGE_KEY, JSON.stringify(albumIds));
      setSelectedAlbums(albumIds);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des albums", error);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        isReady,
        hasPermission,
        selectedAlbums,
        saveSelectedAlbums,
        requestPermission,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};
