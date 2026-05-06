import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Heart, MessageCircle, Share2, Music } from 'lucide-react-native';
import { TikTokColors } from '@/constants/Colors';

const { height } = Dimensions.get('window');
// On soustrait la hauteur approximative de la barre de navigation
const ITEM_HEIGHT = height - 49; 

export type LocalVideo = {
  id: string;
  uri: string;
  filename: string;
};

type VideoPostProps = {
  video: LocalVideo;
  isActive: boolean;
};

export default function VideoPost({ video, isActive }: VideoPostProps) {
  // Initialisation du lecteur vidéo avec expo-video
  const player = useVideoPlayer(video.uri, player => {
    player.loop = true;
    // On ne lance la lecture au démarrage que si la vidéo est active
    if (isActive) {
      player.play();
    }
  });

  // Réagir aux changements de visibilité (scroll)
  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
      // Optionnel : on pourrait remettre la vidéo au début avec player.seekBy ou similaire
      // mais le comportement standard de TikTok est de reprendre là où ça s'est arrêté
    }
  }, [isActive, player]);

  // Si on clique sur la vidéo, on fait Play/Pause
  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={togglePlayPause} 
        style={styles.videoWrapper}
      >
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false} // On cache les contrôles natifs pour faire du TikTok
          contentFit="cover" // Remplir l'écran verticalement
        />
      </TouchableOpacity>

      {/* OVERLAY TIKTOK (Texte et Boutons) */}
      <View style={styles.overlay}>
        {/* Partie gauche : Infos (Nom, Description) */}
        <View style={styles.infoContainer}>
          <Text style={styles.username}>@utilisateur_local</Text>
          <Text style={styles.description} numberOfLines={2}>
            {video.filename}
          </Text>
          <View style={styles.musicContainer}>
            <Music size={16} color="white" />
            <Text style={styles.musicText}>Son original - vidéo locale</Text>
          </View>
        </View>

        {/* Partie droite : Boutons (Like, Comment, Share) */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <Heart size={35} color="white" />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={35} color="white" />
            <Text style={styles.actionText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={35} color="white" />
            <Text style={styles.actionText}>Partager</Text>
          </TouchableOpacity>
          
          <View style={styles.avatarPlaceholder} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: ITEM_HEIGHT,
    backgroundColor: 'black',
    justifyContent: 'center',
  },
  videoWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    paddingBottom: 20, // Espace pour ne pas toucher la barre de navigation
    paddingHorizontal: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  musicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  musicText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 8,
  },
  actionContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 60,
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 20,
  },
  actionText: {
    color: 'white',
    marginTop: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: TikTokColors.gray,
    borderWidth: 2,
    borderColor: 'white',
  },
});
