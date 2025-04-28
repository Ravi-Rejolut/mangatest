import React, { useEffect, useState, useRef } from 'react';
import { 
  ActivityIndicator, 
  Dimensions, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  PanResponder,
  Modal,
  Switch,
  Alert,
  Image
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SubsamplingScaleImage, DoubleTapZoomStyle } from "@wuye/react-native-subsampling-scale-image";
import { Ionicons } from '@expo/vector-icons';

const Reader = () => {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // State variables
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uri, setUri] = useState<string>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScale, setCurrentScale] = useState(0.4);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true);
  const [isVerticalEdgeSwitchEnabled, setIsVerticalEdgeSwitchEnabled] = useState(false);
  const [centerPosition, setCenterPosition] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  // References
  const imageRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);

  // Constants for swipe detection
  const SWIPE_THRESHOLD = 100;
  const SWIPE_VELOCITY_THRESHOLD = 100;

  useEffect(() => {
    setImageUrls([
      'https://raw.githubusercontent.com/Ravi-Rejolut/publicImages/refs/heads/main/c1-1.jpg',
      'https://raw.githubusercontent.com/Ravi-Rejolut/publicImages/refs/heads/main/c1-2.jpg',
      'https://raw.githubusercontent.com/Ravi-Rejolut/publicImages/refs/heads/main/c1-3.jpg',
      'https://raw.githubusercontent.com/Ravi-Rejolut/publicImages/refs/heads/main/c1-4.jpg',
    ]);
  }, [chapterId]);

  // Load image URI when currentIndex changes
  useEffect(() => {
    if (imageUrls.length > 0) {
      loadImageUri(currentIndex);
    }
  }, [currentIndex, imageUrls]);

  // Function to load and resolve image URI
  const loadImageUri = (index) => {
    setIsLoading(true);
    
    Image.getSize(
      imageUrls[index],
      (width, height) => {
        setImageDimensions({ width, height });
        setUri(imageUrls[index]);
        setIsLoading(false);
      },
      (error) => {
        console.error('Error loading image:', error);
        Alert.alert('Error', 'Failed to load image');
        setIsLoading(false);
      }
    );
  };

  // Create pan responder for swipe detection
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
    },
    onPanResponderGrant: (event) => {
      startX.current = event.nativeEvent.pageX;
      startY.current = event.nativeEvent.pageY;
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isSwipeEnabled) return;

      const diffX = gestureState.dx;
      const diffY = gestureState.dy;
      const velocityX = Math.abs(gestureState.vx) * 1000;
      const velocityY = Math.abs(gestureState.vy) * 1000;

      // Only process swipes if we're at normal zoom level (to avoid conflicts with panning)
      const isZoomedOut = currentScale <= 1.0;
      
      // Horizontal swipe
      if (isZoomedOut && Math.abs(diffX) > SWIPE_THRESHOLD && velocityX > SWIPE_VELOCITY_THRESHOLD) {
        if (diffX > 0) {
          showPreviousImage();
        } else {
          showNextImage();
        }
        return;
      }

      // Vertical swipe
      if (isVerticalEdgeSwitchEnabled && 
          Math.abs(diffY) > SWIPE_THRESHOLD && 
          velocityY > SWIPE_VELOCITY_THRESHOLD) {
        if (diffY > 0 && isScrolledToTop()) {
          showPreviousImage();
        } else if (diffY < 0 && isScrolledToBottom()) {
          showNextImage();
        }
      }
    }
  });

  // Check if image is scrolled to top
  const isScrolledToTop = () => {
    if (!imageRef.current || imageDimensions.height === 0) return false;
    
    const viewHeight = screenHeight;
    const visibleHeight = viewHeight / currentScale;
    const minCenterY = visibleHeight / 2;
    
    return centerPosition.y <= minCenterY;
  };

  // Check if image is scrolled to bottom
  const isScrolledToBottom = () => {
    if (!imageRef.current || imageDimensions.height === 0) return false;
    
    const viewHeight = screenHeight;
    const visibleHeight = viewHeight / currentScale;
    const maxCenterY = imageDimensions.height - (visibleHeight / 2);
    
    return centerPosition.y >= maxCenterY;
  };

  // Navigate to next image
  const showNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
  };

  // Navigate to previous image
  const showPreviousImage = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? imageUrls.length - 1 : prevIndex - 1
    );
  };

  // Zoom to specific scale using animateScaleAndCenter
  const zoomTo = (scale) => {
    if (imageRef.current) {
      const centerX = screenWidth / 2;
      const centerY = screenHeight / 2;
      
      // Try using the individual methods instead
      try {
        if (typeof imageRef.current.animateScale === 'function') {
          imageRef.current.animateScale(scale);
        }
        
        if (typeof imageRef.current.animateCenter === 'function') {
          imageRef.current.animateCenter({ x: centerX, y: centerY });
        }
        
        setCurrentScale(scale);
      } catch (error) {
        console.error('Error setting scale or center:', error);
        Alert.alert("Error", "Failed to zoom: " + error.message);
      }
    } else {
      Alert.alert("Error", "Image not ready yet");
    }
  };

  // Handle center position changes for edge detection
  const handleCenterChanged = (event) => {
   
    if (event &&event.nativeEvent && event.nativeEvent.newCenter) {
      const {x,y}=event.nativeEvent.newCenter
      setCenterPosition({
        x: x || 0,
        y: y || 0
      });
    }
  };


  // Handle scale changes
  const handleScaleChanged = (event) => {
 
    if (event && event.nativeEvent && event.nativeEvent.newScale) {
      setCurrentScale(event.nativeEvent.newScale || currentScale);
    }
  };

  // Handle image load event to apply initial scale
  const handleImageLoad = (event) => {
    if (event && event.nativeEvent) {
      const { width, height } = event.nativeEvent;
      console.log(event.nativeEvent);
      setImageDimensions({ width, height });
      
      // Try using a timeout to make sure the image is fully rendered
      setTimeout(() => {
        if (imageRef.current && typeof imageRef.current.animateScaleAndCenter === 'function') {
          console.log('Setting initial scale after load:', currentScale);
          try {
            imageRef.current.animateScaleAndCenter({
              animateScale: currentScale,
              animateCenter: { 
                x: screenWidth / 2, 
                y: screenHeight / 2 
              }
            });
          } catch (error) {
            console.error('Error setting initial scale:', error);
          }
        } else {
          console.log('Image ref or scale method not available after load');
        }
      }, 500); // Add a small delay
    }
  };
  // Render settings modal
  const renderSettingsModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reader Settings</Text>
            
            {/* Swipe Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Swipe Navigation</Text>
              <Switch
                value={isSwipeEnabled}
                onValueChange={setIsSwipeEnabled}
              />
            </View>
            
            {/* Vertical Edge Toggle */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Enable Vertical Edge Switch</Text>
              <Switch
                value={isVerticalEdgeSwitchEnabled}
                onValueChange={setIsVerticalEdgeSwitchEnabled}
              />
            </View>
            
            {/* Zoom Buttons */}
            <View style={styles.zoomButtonsContainer}>
              <TouchableOpacity 
                style={styles.zoomButton} 
                onPress={() => zoomTo(1.0)}
              >
                <Text style={styles.zoomButtonText}>1x</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomButton} 
                onPress={() => zoomTo(2.0)}
              >
                <Text style={styles.zoomButtonText}>2x</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomButton} 
                onPress={() => zoomTo(4.0)}
              >
                <Text style={styles.zoomButtonText}>4x</Text>
              </TouchableOpacity>
            </View>
            
            {/* Close Button */}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setSettingsVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading || !uri) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading image...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Image Viewer */}
      {uri && (
        <SubsamplingScaleImage
          ref={imageRef}
          animateScale={2.0}
          zoomEnabled
          panEnabled
          quickScaleEnabled
          maxScale={5.0}
          minScale={0.2}
          doubleTapZoomStyle={DoubleTapZoomStyle.ZOOM_FOCUS_FIXED}
          source={{ uri: uri }}
          onLoad={handleImageLoad}
          onError={() => Alert.alert("Error", "Failed to load image")}
          onScaleChanged={handleScaleChanged}
          onCenterChanged={handleCenterChanged}
          style={styles.image}
        />
      )}

      {/* Settings Button */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSettingsVisible(true)}
      >
        <Ionicons name="settings" size={24} color="white" />
      </TouchableOpacity>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        <Text style={styles.pageIndicatorText}>
          Page {currentIndex + 1} / {imageUrls.length}
        </Text>
      </View>

      {/* Debug Info - Optional */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Scale: {currentScale.toFixed(2)}{'\n'}
          Position: X: {centerPosition.x.toFixed(0)}, Y: {centerPosition.y.toFixed(0)}{'\n'}
          Dimensions: {imageDimensions.width}x{imageDimensions.height}
        </Text>
      </View>

      {/* Settings Modal */}
      {renderSettingsModal()}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
  image: {
    // width: 400,
    // height: 800,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pageIndicator: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pageIndicatorText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  zoomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  zoomButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  zoomButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Reader;