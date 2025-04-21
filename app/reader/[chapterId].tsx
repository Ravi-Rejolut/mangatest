import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ImageZoom from 'react-native-image-pan-zoom';

import { chapterImageMap } from '@/utils/imageMap';

const Reader = () => {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const imageSource = chapterImageMap[chapterId];

  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof imageSource === 'number') {
      const { width, height } = Image.resolveAssetSource(imageSource);
      setImageDimensions({ width, height });
    }
  }, [imageSource]);

  const handleMove = (position: {
    scale: number;
    positionX: number;
    positionY: number;
  }) => {
    setZoomLevel(position.scale);
    setScrollPosition({ x: position.positionX, y: position.positionY });
  };

  if (!imageDimensions) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  const { width: imageWidth, height: imageHeight } = imageDimensions;

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <ImageZoom
        cropWidth={screenWidth}
        cropHeight={screenHeight}
        imageWidth={imageWidth}
        imageHeight={imageHeight}
        minScale={0.2}
        maxScale={5}
        enableCenterFocus={false}
        onMove={handleMove}
      >
        <Image
          source={imageSource}
          style={{
            width: imageWidth,
            height: imageHeight,
          }}
          resizeMode="contain"
        />
      </ImageZoom>

      {/* Optional overlay to show zoom and scroll */}
      <View style={{ position: 'absolute', top: 40, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 5 }}>
        <Text style={{ color: 'white', fontSize: 12 }}>
          Zoom: {zoomLevel.toFixed(2)}{'\n'}
          X: {scrollPosition.x.toFixed(0)}  Y: {scrollPosition.y.toFixed(0)}
        </Text>
      </View>
    </View>
  );
};

export default Reader;
