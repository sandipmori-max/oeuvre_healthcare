import MaterialIcons from '@react-native-vector-icons/material-icons';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface Props {
  item?: { field: string };
  handleSignatureAttachment?: (data: string, field: string) => void;
}

const SignaturePad: React.FC<Props> = ({ item, handleSignatureAttachment }) => {
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>(''); // 👈 now managed in state
  const [hasSignature, setHasSignature] = useState(false);

  const currentPathRef = useRef<string>('');

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current = `M${locationX} ${locationY}`;
        setCurrentPath(currentPathRef.current);
        setHasSignature(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPathRef.current += ` L${locationX} ${locationY}`;
        setCurrentPath(currentPathRef.current); // 👈 update state continuously
      },
      onPanResponderRelease: () => {
        if (currentPathRef.current) {
          setPaths((prev) => [...prev, currentPathRef.current]);
          currentPathRef.current = '';
          setCurrentPath('');
        }
      },
    })
  ).current;

  const handleClear = () => {
    setPaths([]);
    setCurrentPath('');
    currentPathRef.current = '';
    setHasSignature(false);
  };

  const handleSave = () => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="300" height="180">
        ${paths
          .map(
            (d) =>
              `<path d="${d}" stroke="black" fill="none" stroke-width="2"/>`
          )
          .join('')}
      </svg>
    `;

    console.log('Signature Captured:', svgString);

    if (handleSignatureAttachment && item?.field) {
      handleSignatureAttachment(`${item?.field}.svg; ${svgString}`, item?.field);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginVertical: 8 }}>{item?.field}</Text>
      <View style={styles.signatureBox} {...panResponder.panHandlers}>
        <Svg style={{ flex: 1 }}>
          {paths.map((d, i) => (
            <Path
              key={`path-${i}`}
              d={d}
              stroke="black"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {currentPath !== '' && (
            <Path
              d={currentPath}
              stroke="black"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>

        {hasSignature && (
          <View style={styles.buttonOverlay}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <MaterialIcons name="save" size={18} color="#fff" />
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClear}
            >
              <MaterialIcons name="clear" size={18} color="#fff" />
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default SignaturePad;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 12,
    backgroundColor: '#F8F9FA',
  },
  signatureBox: {
    height: 182,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  buttonOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  clearButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '600',
  },
});
