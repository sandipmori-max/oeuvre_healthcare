import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import useTranslations from '../../../../hooks/useTranslations';


const BusinessCardView = ({ setValue, controls, item, baseLink, infoData }: any) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(Date.now());
  const [showPicker, setShowPicker] = useState(false);
  const { t } = useTranslations();


  const getImageUri = (type: 'small' | 'large') => {
    const base =
      imageUri ||
      `${baseLink}fileupload/1/${infoData?.tableName}/${infoData?.id}/${
        type === 'small' ? `d_${item?.text}` : item?.text
      }`;
    return `${base}?cb=${cacheBuster}`;
  };


  const checkPermission = async (type: 'camera' | 'gallery') => {
    let permission;


    if (Platform.OS === 'ios') {
      permission = type === 'camera' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.IOS.PHOTO_LIBRARY;
    } else {
      const androidVersion = parseInt(Platform.Version as string, 10);
      if (type === 'camera') {
        permission = PERMISSIONS.ANDROID.CAMERA;
      } 
      // else {
      //   permission =
      //     androidVersion >= 33
      //       ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
      //       : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
      // }
    }


    const result = await check(permission);
    console.log('🚀 Permission Check:', result);


    switch (result) {
      case RESULTS.GRANTED:
        return true;


      case RESULTS.DENIED: {
        const req = await request(permission);
        if (req === RESULTS.GRANTED) return true;


        Alert.alert(
          `${type === 'camera' ? 'Camera' : 'Gallery'} Permission Required`,
          `Please allow ${type === 'camera' ? 'camera' : 'gallery'} access to continue.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Settings', onPress: () => openSettings() },
          ]
        );
        return false;
      }


      case RESULTS.BLOCKED:
        Alert.alert(
          `${type === 'camera' ? 'Camera' : 'Gallery'} Permission Blocked`,
          `Please enable ${type === 'camera' ? 'Camera' : 'Gallery'} access from Settings.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Go to Settings', onPress: () => openSettings() },
          ]
        );
        return false;


      case RESULTS.UNAVAILABLE:
        Alert.alert(
          'Feature Unavailable',
          `${type === 'camera' ? 'Camera' : 'Gallery'} permission is not available on this device.`
        );
        return false;


      default:
        return false;
    }
  };


  const pickFromCamera = async () => {
    const granted = await checkPermission('camera');
    if (!granted) return;


    setShowPicker(false);
    const res = await launchCamera({ mediaType: 'photo', quality: 0.5, includeBase64: true });
    if (res.didCancel) return;


    if (res.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      let uri = asset.uri!;
      if (Platform.OS === 'android' && !uri.startsWith('file://')) uri = 'file://' + uri;
      setCacheBuster(Date.now());
      setBase64(`${item?.field}.jpeg; data:${asset.type};base64,${asset.base64}`);
      setImageUri(uri);
    }
  };


  const pickFromGallery = async () => {
    const granted = await checkPermission('gallery');
    if (!granted) return;


    setShowPicker(false);
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.5, includeBase64: true });
    if (res.didCancel) return;


    if (res.assets && res.assets.length > 0) {
      const asset = res.assets[0];
      let uri = asset.uri!;
      if (Platform.OS === 'android' && !uri.startsWith('file://')) uri = 'file://' + uri;
      setCacheBuster(Date.now());
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
        const joined = result.blocks.map(b => b.text).join('\n');
        const parsed = parseCard(joined);
        setValue(parsed);
      } catch (err) {
        console.error('❌ OCR error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [imageUri]);

  // 🧠 Ultra Pro-Max OCR Algorithm
  const parseCard = (text: string): any => {

    console.log("text -----------------------  ", text)
    // Normalize text
    let cleanText = text
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[|]/g, 'I')
      .replace(/\s*@\s*/g, '@')
      .replace(/\s*\.\s*/g, '.')
      .replace(/\s{2,}/g, ' ')
      .trim();


    const lines = cleanText
      .split(/\n|\\n/)
      .map(l => l.trim())
      .filter(l => l.length > 0);


    const result: any = {
      name: '',
      designation: '',
      company: '',
      emailid: '',
      emailid2: '',
      mobileno: '',
      mobileno2: '',
      website: '',
      address: '',
      [item?.field]: base64,
      cardtext: cleanText,
    };


    // Emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+ *@ *[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    const emails = [...cleanText.matchAll(emailRegex)].map(e => e[0].replace(/\s+/g, ''));
    result.emailid = emails[0] || '';
    result.emailid2 = emails[1] || '';


    // Phones
    const phoneRegex = /(\+?\d[\d\s().-]{7,}\d)/g;
    const phones = [...cleanText.matchAll(phoneRegex)]
      .map(p => p[0].replace(/[^\d+]/g, ''))
      .filter(p => p.length >= 10 && p.length <= 14);
    const uniquePhones = [...new Set(phones)];
    result.mobileno = uniquePhones[0] || '';
    result.mobileno2 = uniquePhones[1] || '';


// 🌐 Strict Website Extraction (Only URLs starting with https, http, or www)
const webRegex = /\b((https?:\/\/|www\.)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:[\/\w.-]*)?\b/g;

const invalidDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'rediffmail.com',
  'icloud.com',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'yandex.com',
  'aol.com',
  'msn.com',
];

let websites = [...cleanText.matchAll(webRegex)]
  .map(w =>
    w[0]
      .replace(/[-–—;,]+$/g, '') // remove trailing junk like -, ;, ,
      .replace(/\s+(pvt|ltd|private|limited|company|solutions?|technologies|systems?).*/i, '') // remove suffixes after domain
      .replace(/^https?:\/\//i, '') // remove protocol
      .replace(/^\/+|\/+$/g, '') // remove stray slashes
      .trim()
  )
  .filter(w =>
    (w.startsWith('www.') || w.startsWith('http') || w.startsWith('https')) &&
    /\.[a-z]{2,}$/i.test(w) &&
    !invalidDomains.some(domain => w.toLowerCase().includes(domain))
  );

if (!websites.length && result.emailid) {
  const domain = result.emailid.split('@')[1]?.toLowerCase();
  // Only add fallback if it’s not generic AND you want to keep the `www.` format
  if (domain && domain.includes('.') && !invalidDomains.includes(domain)) {
    websites.push(`www.${domain}`);
  }
}

// Remove duplicates and assign
websites = [...new Set(websites)];
result.website = websites[0] || '';


    // Keywords
     const jobKeywords =
      /(engineer|developer|manager|director|designer|consultant|executive|officer|lead|analyst|specialist|founder|owner|ceo|cto|cfo|coo|president|partner|architect|product|project|marketing|sales|business|finance|hr|trainer|supervisor|administrator|head|chairman|chairperson|chief|vice\s*president|vp|team\s*lead|technical\s*lead|intern|apprentice|engineer\s*in\s*charge|coordinator|support|technician|operator|advisor|representative|agent|developer\s*advocate|solution\s*architect|principal|managing\s*director|associate|assistant\s*manager|director\s*of|leader|marketing\s*head|accountant|auditor|officer\s*in\s*charge|executive\s*assistant|recruiter|researcher|strategist|planner|owner\s*&\s*founder|co-\s*founder|managing\s*partner|senior|junior)/i;

    const companyKeywords =
      /(pvt|ltd|private|limited|inc|llp|corp|corporation|company|solutions?|system|systems?|technologies|technology|software|consultancy|consulting|industries|industry|group|enterprise|enterprises|services|service|agency|studio|infra|builders?|automation|manufacturing|consultants?|communications?|exports?|traders?|trade|marketing|networks?|digital|ventures?|logistics|supply\s*chain|construction|builders|developers|foods?|pharma|labs?|lab|retail|education|academy|school|institute|college|foundation|trust|ngo|organization|hospital|clinic|medicare|healthcare|finance|capital|bank|investment|motors?|auto|plastics?|chemicals?|paints?|electricals?|electronics?|fabrics?|fashion|garments?|wears?|hardware|steel|cement|machinery|equipments?|textiles?|interiors?|decor|printing|press|media|events?|tours?|travels?|resorts?|hospitality|it\s*solutions|data\s*systems|communications?|telecom|ai|ml|robotics?|iot|research|developers?)/i;

     

    // Company
    const companyCandidates = lines.map((l, i) => {
      let score = 0;
      if (companyKeywords.test(l)) score += 3;
      if (l === l.toUpperCase()) score += 2;
      if (!/@|\d/.test(l) && l.length < 45) score += 1;
      if (i < 5) score += 1;
      return { text: l, score };
    });
    const bestCompany = companyCandidates.sort((a, b) => b.score - a.score)[0];
    if (bestCompany?.score > 2) result.company = bestCompany.text;


    // Name
    const nameCandidates = lines.map((l, i) => {
      let score = 0;
      if (/^[A-Z][A-Za-z.' -]+$/.test(l)) score += 2;
      if (l.split(' ').length >= 2 && l.split(' ').length <= 4) score += 2;
      if (!/@|\d|www/.test(l)) score += 2;
      if (i <= 4) score += 1;
      if (jobKeywords.test(l)) score -= 2;
      if (companyKeywords.test(l)) score -= 1;
      return { text: l, score };
    });
    const bestName = nameCandidates.sort((a, b) => b.score - a.score)[0];
    if (bestName?.score > 3 && bestName.text !== result.company) result.name = bestName.text;


    // Designation
    const designationCandidates = lines.map((l, i) => {
      let score = 0;
      if (jobKeywords.test(l)) score += 3;
      if (/^[A-Z]/.test(l)) score += 1;
      if (l.split(' ').length < 6) score += 1;
      if (i < 6) score += 1;
      if (/@|www|,|\.com/.test(l)) score -= 1;
      return { text: l, score };
    });
    const bestDesignation = designationCandidates.sort((a, b) => b.score - a.score)[0];
    if (bestDesignation?.score > 3) result.designation = bestDesignation.text;


   // 🏠 Improved Address Extraction Logic
const addressKeywords =
  /(street|road|st\.|rd\.|ave|avenue|sector|block|area|society|city|district|village|plot|no\.|building|bldg|floor|lane|cross|main|pin|zip|pincode|india|gujarat|maharashtra|delhi|bangalore|bengaluru|hyderabad|pune|chennai|kolkata|noida|gurgaon|jaipur|ahmedabad|surat|vadodara|mumbai|thane|coimbatore|kochi|trivandrum|indore|bhopal|patna|ranchi|nagpur|lucknow|kanpur|chandigarh|mysore|vizag|vishakhapatnam|goa|odisha|orissa|uttar\s*pradesh|madhya\s*pradesh|west\s*bengal|tamil\s*nadu|karnataka|kerala|andhra\s*pradesh|telangana|address|landmark|behind|near|beside|opposite|post|po\s*box|zip\s*code|state|country|floor|flat|apt|apartment|tower|complex|society|colony|enclave|vihar|nagar)/i;

// Find address start — ignore false positives like “M.No.”
const addrStart = lines.findIndex((l, idx) => {
  if (/M\.?No\.?/i.test(l)) return false; // ❌ skip lines like “M.No.”
  if (/(@|www|mob|phone|tel|mail)/i.test(l)) return false; // ❌ skip contact lines
  return addressKeywords.test(l);
});

if (addrStart !== -1) {
  const addrLines = [];
  for (let i = addrStart; i < lines.length; i++) {
    // stop if another contact-related line appears
    if (/(@|www|mob|phone|tel|mail)/i.test(lines[i])) break;
    addrLines.push(lines[i]);
  }

  // Join and clean up
  result.address = addrLines
    .join(', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/[,;]+$/g, '')
    .trim();
} else {
  // fallback: last 4 lines, excluding contact info
  const tail = lines.slice(-5).filter(l => !/@|www|mob|phone|tel/.test(l));
  if (tail.length >= 2)
    result.address = tail
      .join(', ')
      .replace(/\s{2,}/g, ' ')
      .replace(/[,;]+$/g, '')
      .trim();
}


    // Cleanup
    for (const k of Object.keys(result)) {
      if (typeof result[k] === 'string')
        result[k] = result[k].replace(/\s{2,}/g, ' ').replace(/[,;]+$/, '').trim();
    }


    // console.log('✅ Parsed OCR Result:', result);
    setValue(result);
    return result;
  };


  return (
    <ScrollView>
      <Text style={styles.title}>{t("title.title9")}</Text>


      <View style={{ alignItems: 'center', marginVertical: 12 }}>
        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          style={[styles.imageThumb, { justifyContent: 'center', alignItems: 'center' }]}
        >
          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Image
              key={item.field}
              source={{ uri: imageUri ? imageUri : getImageUri('small') }}
              style={styles.imageThumb}
              resizeMode="cover"
            />
          )}
          <View style={styles.editIconContainer}>
            <MaterialIcons name="edit" size={18} color="#000" />
          </View>
        </TouchableOpacity>
      </View>


      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>


        <View style={styles.bottomSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{t("title.title10")}</Text>
            <TouchableOpacity onPress={() => setShowPicker(false)} style={styles.closeIcon}>
              <MaterialIcons name="close" size={22} color="#333" />
            </TouchableOpacity>
          </View>


          <View style={styles.optionRow}>
            <TouchableOpacity style={styles.optionCard} onPress={pickFromCamera}>
              <MaterialIcons name="photo-camera" size={40} color="#000" />
              <Text style={styles.optionText}>{t("title.title11")}</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.optionCard} onPress={pickFromGallery}>
              <MaterialIcons name="photo-library" size={40} color="#000" />
              <Text style={styles.optionText}>{t("title.title12")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  imageThumb: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginVertical: 2,
  },
  editIconContainer: {
    position: 'absolute',
    right: -10,
    top: '4%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    alignItems: 'center',
  },
  sheetHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: { fontSize: 18, fontWeight: '600', color: '#222' },
  closeIcon: { padding: 6, borderRadius: 30, backgroundColor: '#f2f2f2' },
  optionRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionCard: {
    width: '42%',
    height: 110,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { marginTop: 10, fontSize: 16, fontWeight: '600', color: '#333' },
});


export default BusinessCardView;