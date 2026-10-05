import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { usePhotos } from '@/context/GeoPhotosContext';

export default function GeoCamScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { addPhoto } = usePhotos();

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>Se requiere permiso de cámara</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.btn}>
          <Text style={styles.btnText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    try {
      // 1. Pedir permiso de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita ubicación para marcar la foto en el mapa.');
        return;
      }

      // 2. Capturar foto con la cámara
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });

        // 3. Obtener coordenadas GPS
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        // 4. Guardar en el contexto global
        addPhoto({
          id: Date.now().toString(),
          uri: photo.uri,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: Date.now(),
        });

        Alert.alert('¡Foto tomada!', 'La imagen y su ubicación se guardaron correctamente.');
      }
    } catch (error) {
      console.error('Error capturando foto con ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación o tomar la foto.');
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePhoto} style={styles.captureButton}>
            <View style={styles.innerCircle} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  permissionText: { textAlign: 'center' },
  camera: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#ffffff',
  },
  btn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  btnText: { color: '#fff' },
});