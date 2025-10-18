import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Platform,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition, {
  TextRecognitionResult,
  TextRecognitionBlock,
} from '@react-native-ml-kit/text-recognition';

const windowWidth = Dimensions.get('window').width;

type ParsedCard = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
};

const BusinessCardView = ({ setValue, controls, item }: any) => {
  console.log('🚀 ~ BusinessCardView ~ controls:', controls);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<TextRecognitionResult | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<TextRecognitionBlock[]>([]);
  const [parsed, setParsed] = useState<ParsedCard>({});
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(false);

  const pickFromCamera = async () => {
    const res = await launchCamera({ mediaType: 'photo', quality: 1 });
    if (res.didCancel) return;
    if (res.assets && res.assets.length > 0) {
      let uri = res.assets[0].uri!;
      const asset = res.assets[0];
      if (Platform.OS === 'android' && !uri.startsWith('file://')) {
        uri = 'file://' + uri;
      }
      setBase64(`${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`);
      setImageUri(uri);
    }
  };

  const pickFromGallery = async () => {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 1 });
    if (res.didCancel) return;
    if (res.assets && res.assets.length > 0) {
      let uri = res.assets[0].uri!;
      const asset = res.assets[0];

      if (Platform.OS === 'android' && !uri.startsWith('file://')) {
        uri = 'file://' + uri;
      }
      setBase64(`${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`);

      setImageUri(uri);
    }
  };

  useEffect(() => {
    (async () => {
      if (!imageUri) return;
      setLoading(true);
      try {
        const result = await TextRecognition.recognize(imageUri);
        console.log('OCR result', result);
        setOcrResult(result);
        setBoundingBoxes(result.blocks);
        const joined = result.blocks.map(b => b.text).join(' ');
        const p = parseCard(joined);
        setParsed(p);
      } catch (err) {
        console.error('OCR error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [imageUri]);

  const parseCard = (text: string): any => {
    const cleanedData = text.replace(/\s+/g, ' ').trim();

    const emails = [
      ...cleanedData.matchAll(/\b[A-Za-z0-9._%+-]+ *@ *[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g),
    ].map(e => e[0].replace(/\s+/g, ''));

    const phones = [...cleanedData.matchAll(/\+91[-\s]?\d{10}/g)].map(p =>
      p[0].replace(/\s+/g, ''),
    );

    const websites = [...cleanedData.matchAll(/\b(www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g)].map(
      w => w[0],
    );

    const companyMatch = text.match(/^(.*?)(Development|Company)/i);
    const company = companyMatch ? companyMatch[1].trim().replace(/\s+$/, '') : '';

    const addressMatch = text.match(/Company\s+(.*?)Mobile:/is);
    const address = addressMatch ? addressMatch[1].trim().replace(/\s+/g, ' ') : '';

    const result = {
      name: '', 
      emailid: emails[0] || '',
      emailid2: emails[1] || '',
      designation: '', 
      mobileno: phones[0] || '',
      mobileno2: phones[1] || '',
      company,
      address,
      website: websites[0] || '',
      [item?.field]: base64,
    };
    console.log('🚀 ~ parseCard ~ result:', result);
    setValue(result);
    return result;
  };

  const renderBoundingBoxes = () => {
    if (!ocrResult || !boundingBoxes || boundingBoxes.length === 0) return null;
    return boundingBoxes.map((block, idx) => {
      const { frame } = block;
      if (!frame) return null;

      const scaleX = windowWidth / frame.width;
      const scaleY = scaleX;
      return (
        <View
          key={`box-${idx}`}
          style={{
            position: 'absolute',
            left: frame.left * scaleX,
            top: frame.top * scaleY,
            width: frame.width * scaleX,
            height: frame.height * scaleY,
            borderColor: 'rgba(0,255,0,0.7)',
            borderWidth: 1,
          }}
        />
      );
    });
  };

  return (
    <ScrollView>
      <Text style={styles.title}>Business Card Reader</Text>
      <View style={styles.buttonRow}>
        <Button title="Camera" onPress={pickFromCamera} />
        <View style={{ width: 16 }} />
        <Button title="Gallery" onPress={pickFromGallery} />
      </View>
      {imageUri && (
        <View style={{ marginTop: 16 }}>
          <View style={{ width: windowWidth, height: windowWidth * 0.6 }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
            {renderBoundingBoxes()}
          </View>
        </View>
      )}
      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ margin: 20 }} />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  title: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  results: {
    marginTop: 24,
    width: '90%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  resultText: { fontSize: 16, marginVertical: 4 },
});

export default BusinessCardView;