import React, { createContext, useContext, useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { StorageAccessFramework } = FileSystem;

type MediaContextType = {
  isReady: boolean;
  selectedDirectoryUri: string | null;
  pickDirectory: () => Promise<boolean>;
};

const MediaContext = createContext<MediaContextType | null>(null);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

const DIRECTORY_STORAGE_KEY = '@tiktok_saf_directory';

export const MediaProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [selectedDirectoryUri, setSelectedDirectoryUri] = useState<string | null>(null);

  useEffect(() => {
    async function initContext() {
      try {
        const savedUri = await AsyncStorage.getItem(DIRECTORY_STORAGE_KEY);
        if (savedUri) {
          // On pourrait vérifier si on a toujours accès à l'URI, mais on suppose que oui pour l'instant
          setSelectedDirectoryUri(savedUri);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation du MediaContext", error);
      } finally {
        setIsReady(true);
      }
    }

    initContext();
  }, []);

  const pickDirectory = async () => {
    try {
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (permissions.granted) {
        const uri = permissions.directoryUri;
        await AsyncStorage.setItem(DIRECTORY_STORAGE_KEY, uri);
        setSelectedDirectoryUri(uri);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erreur lors de la sélection du dossier", error);
      return false;
    }
  };

  return (
    <MediaContext.Provider
      value={{
        isReady,
        selectedDirectoryUri,
        pickDirectory,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

