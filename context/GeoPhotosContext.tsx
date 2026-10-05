import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';

export interface PhotoLocation {
  id: string;
  uri: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface PhotoContextType {
  photos: PhotoLocation[];
  addPhoto: (photo: PhotoLocation) => void;
}

const PhotoContext = createContext<PhotoContextType>({
  photos: [],
  addPhoto: () => {},
});

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<PhotoLocation[]>([]);

  // La foto más reciente queda en la posición 0
  const addPhoto = useCallback((photo: PhotoLocation) => {
    setPhotos((prev) => [photo, ...prev]);
  }, []);

  const value = useMemo(() => ({ photos, addPhoto }), [photos, addPhoto]);

  return <PhotoContext.Provider value={value}>{children}</PhotoContext.Provider>;
};

export const usePhotos = () => useContext(PhotoContext);