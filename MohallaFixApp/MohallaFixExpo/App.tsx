


// Final code 

import React, { useCallback, useEffect, useState } from 'react';
// import { File } from 'expo-file-system';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// IMPORTANT: Apne computer ka current IPv4 address yahan likho.
const API_URL = 'http://192.168.0.101:5000/api';
const SERVER_URL = API_URL.replace('/api', '');

const COLORS = {
  navy: '#1D4969',
  navyDark: '#15364F',
  green: '#16A765',
  greenLight: '#E8F7EF',
  background: '#F3F6F9',
  white: '#FFFFFF',
  text: '#243746',
  muted: '#8293A1',
  border: '#E4EBF0',
  red: '#D94B4B',
  orange: '#E69A36',
};

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = [
  'Electricity',
  'Water Supply',
  'Road & Potholes',
  'Garbage & Sanitation',
  'Street Light',
];

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Complaint = {
  _id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  image?: string;
  status: string;
  priority?: string;
  createdAt?: string;
  user?: {
    name?: string;
    email?: string;
  };
};

export default function App() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState<User | null>(null);

  
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState('');
const [phone, setPhone] = useState('');
const [isSignup, setIsSignup] = useState(false);
const [showPassword, setShowPassword] = useState(false);
const [loginLoading, setLoginLoading] = useState(false);


  const [activeTab, setActiveTab] = useState('feed');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dbStatus, setDbStatus] = useState('Connecting...');

 

  const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [location, setLocation] = useState('');
const [category, setCategory] = useState(CATEGORIES[0]);
const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

const [showCategories, setShowCategories] = useState(false);
const [selectedImage, setSelectedImage] =
  useState<ImagePicker.ImagePickerAsset | null>(null);
const [submitting, setSubmitting] = useState(false);


  const [expandedId, setExpandedId] = useState('');

  
const handleLogin = async () => {
  try {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Email and password are required');
      return;
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert('Login Failed', data.message || 'Please try again');
      return;
    }

    if (data.user?.role !== 'resident') {
      Alert.alert('Access Denied', 'Only resident accounts can use this app.');
      return;
    }

    // Apne existing token aur user state ke naam ke mutabiq save karo
    setToken(data.token);
    setUser(data.user);

    Alert.alert('Success', 'Login successful!');

  } catch (error) {
    console.log('LOGIN ERROR:', error);
    Alert.alert(
      'Connection Error',
      'Backend se connection nahi ho raha. API_URL aur server check karo.'
    );
  }
};


const handleSignup = async () => {
  if (!fullName.trim() || !email.trim() || !password) {
    Alert.alert('Error', 'Name, email and password required hain.');
    return;
  }

  if (password.length < 8) {
    Alert.alert('Error', 'Password minimum 8 characters ka hona chahiye.');
    return;
  }

  try {
    setLoginLoading(true);

    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        phone: phone.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    Alert.alert(
      'Account Created',
      'Your account is ready. Please login now.'
    );

    setIsSignup(false);
    setFullName('');
    setPhone('');
    setPassword('');

  } catch (error: any) {
    Alert.alert('Signup Error', error.message);
  } finally {
    setLoginLoading(false);
  }
};





  const handleLogout = () => {
    Alert.alert('Logout', 'Kya tum logout karna chahte ho?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          setToken('');
          setUser(null);
          setComplaints([]);
          setActiveTab('feed');
          setSelectedImage(null);
          setTitle('');
          setDescription('');
          setLocation('');
        },
      },
    ]);
  };

  // ---------------- FETCH COMPLAINTS ----------------

  // const fetchComplaints = useCallback(async (showLoader = false) => {
  //   try {
  //     if (showLoader) setLoadingComplaints(true);

  //     const response = await fetch(`${API_URL}/complaints`);

  //     if (!response.ok) {
  //       throw new Error('Complaints fetch nahi ho sakin.');
  //     }

  //     const data = await response.json();

  //     if (!Array.isArray(data)) {
  //       throw new Error('Backend ka complaints response array nahi hai.');
  //     }

  //     setComplaints(data);
  //     setDbStatus('Connected');
  //   } catch (error) {
  //     setDbStatus('Connection unavailable');
  //   } finally {
  //     setLoadingComplaints(false);
  //     setRefreshing(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!token) return;

  //   fetchComplaints(true);

  //   // Har 5 seconds mein latest complaints aur status refresh honge.
  //   const interval = setInterval(() => {
  //     fetchComplaints(false);
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, [token, fetchComplaints]);

  // const onRefresh = () => {
  //   setRefreshing(true);
  //   fetchComplaints(false);
  // };


const fetchComplaints = useCallback(async (showLoader = false) => {
  try {
    if (!token) return;

    if (showLoader) setLoadingComplaints(true);

    const response = await fetch(`${API_URL}/complaints`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Complaints fetch nahi ho sakin.');
    }

    if (!Array.isArray(data.complaints)) {
      throw new Error('Backend response mein complaints array nahi hai.');
    }

    setComplaints(data.complaints);
    setDbStatus('Connected');

  } catch (error) {
    console.log('FETCH COMPLAINTS ERROR:', error);
    setDbStatus('Connection unavailable');
  } finally {
    setLoadingComplaints(false);
    setRefreshing(false);
  }
}, [token]);


// new

// Automatically fetch complaints after login
useEffect(() => {
  if (!token) return;

  fetchComplaints(true);

  // Har 5 seconds mein admin ke status updates refresh honge.
  const interval = setInterval(() => {
    fetchComplaints(false);
  }, 5000);

  return () => clearInterval(interval);
}, [token, fetchComplaints]);

// Pull-to-refresh
const onRefresh = () => {
  setRefreshing(true);
  fetchComplaints(false);
};


  // ---------------- IMAGE PICKER ----------------

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission required',
          'Image select karne ke liye gallery permission allow karo.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    } catch {
      Alert.alert('Error', 'Gallery open nahi ho saki.');
    }
  };

  // ---------------- SUBMIT COMPLAINT ----------------



// const submitComplaint = async () => {
//   if (!title.trim() || !description.trim() || !location.trim()) {
//     Alert.alert(
//       'Missing Information',
//       'Title, description aur location enter karo.'
//     );
//     return;
//   }

//   if (!selectedImage?.uri) {
//     Alert.alert(
//       'Image Required',
//       'Complaint ke saath image select karna zaroori hai.'
//     );
//     return;
//   }

//   if (!token) {
//     Alert.alert('Login Required', 'Pehle login karo.');
//     return;
//   }

//   try {
//     setSubmitting(true);

//     const formData = new FormData();

//     formData.append('title', title.trim());
//     formData.append('category', category);
//     formData.append('description', description.trim());
//     formData.append('location', location.trim());
//     formData.append('priority', 'Medium');

    
//     formData.append('image', {
//   uri: selectedImage.uri,
//   name: selectedImage.fileName || `complaint-${Date.now()}.jpg`,
//   type: selectedImage.mimeType || 'image/jpeg',
// } as any);

// //     const imageFile = new File(selectedImage.uri);

// // formData.append('image', imageFile);

//     const response = await fetch(
//       `${API_URL}/complaints`,
//       {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       }
//     );

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         data.message || 'Complaint submission failed.'
//       );
//     }

//     Alert.alert(
//       'Success!',
//       'Your complaint has been registered successfully.'
//     );

//     setTitle('');
//     setDescription('');
//     setLocation('');
//     setSelectedImage(null);
//     setCategory(CATEGORIES[0]);

//     setActiveTab('feed');

//     await fetchComplaints(false);

//   } catch (error: any) {
//     console.error('COMPLAINT ERROR:', error);

//     Alert.alert(
//       'Submission Error',
//       error.message || 'Something went wrong.'
//     );

//   } finally {
//     setSubmitting(false);
//   }
// };



const submitComplaint = async () => {
  if (!title.trim() || !description.trim() || !location.trim()) {
    Alert.alert(
      'Missing Information',
      'Title, description aur location enter karo.'
    );
    return;
  }

  if (!token) {
    Alert.alert('Login Required', 'Pehle login karo.');
    return;
  }

  try {
    setSubmitting(true);

    const formData = new FormData();

    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('description', description.trim());
    formData.append('location', location.trim());
    formData.append('priority', priority);

    // Image optional hai
    if (selectedImage?.uri) {
      formData.append('image', {
        uri: selectedImage.uri,
        name:
          selectedImage.fileName ||
          `complaint-${Date.now()}.jpg`,
        type: selectedImage.mimeType || 'image/jpeg',
      } as any);
    }

    const response = await fetch(`${API_URL}/complaints`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Complaint submission failed.'
      );
    }

    Alert.alert(
      'Success!',
      'Your complaint has been registered successfully.'
    );

    setTitle('');
    setDescription('');
    setLocation('');
    setSelectedImage(null);
    setCategory(CATEGORIES[0]);
    setPriority('Medium');

    setActiveTab('feed');

    await fetchComplaints(true);

  } catch (error: any) {
    console.error('COMPLAINT ERROR:', error);

    Alert.alert(
      'Submission Error',
      error.message || 'Something went wrong.'
    );

  } finally {
    setSubmitting(false);
  }
};

  
  // ---------------- HELPERS ----------------

  const getImageUrl = (image?: string) => {
    if (!image) return '';

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    return `${SERVER_URL}/uploads/${image.replace(/^\/+/, '')}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'Resolved') return COLORS.green;
    if (status === 'In Progress') return COLORS.orange;
    return COLORS.navy;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Recently reported';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return 'Recently reported';

    return parsedDate.toLocaleString();
  };

  const myComplaints = complaints.filter(
    (item) =>
      item.user?.email?.toLowerCase() === user?.email?.toLowerCase()
  );

  const resolvedCount = myComplaints.filter(
    (item) => item.status === 'Resolved'
  ).length;

  // ---------------- LOGIN SCREEN ----------------

  if (!token || !user) {
    return (
      <SafeAreaView style={styles.loginScreen}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <KeyboardAvoidingView
          style={styles.loginKeyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.loginScroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brandIcon}>
              <Text style={styles.brandLetter}>M</Text>
            </View>

            <Text style={styles.brandName}>MohallaFix</Text>
            <Text style={styles.brandSubtitle}>
              Better neighbourhoods start with you.
            </Text>


<View style={styles.loginCard}>

  <Text style={styles.loginHeading}>
    {isSignup ? 'Create Account' : 'Welcome back'}
  </Text>

  <Text style={styles.loginDescription}>
    {isSignup
      ? 'Join MohallaFix and help your neighbourhood.'
      : 'Login to manage your neighbourhood complaints.'}
  </Text>

{isSignup && (
  <>
    <Text style={styles.fieldLabel}>Full Name</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter your full name"
      placeholderTextColor={COLORS.muted}
      value={fullName}
      onChangeText={setFullName}
      autoCapitalize="words"
    />

    <Text style={styles.fieldLabel}>Phone Number</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter your phone number"
      placeholderTextColor={COLORS.muted}
      value={phone}
      onChangeText={setPhone}
      keyboardType="phone-pad"
    />
  </>
)}

<Text style={styles.fieldLabel}>Email Address</Text>
<TextInput
  style={styles.input}
  placeholder="Enter your email"
  placeholderTextColor={COLORS.muted}
  keyboardType="email-address"
  autoCapitalize="none"
  autoCorrect={false}
  value={email}
  onChangeText={setEmail}
/>

<Text style={styles.fieldLabel}>Password</Text>

<View style={styles.passwordContainer}>
  <TextInput
    style={styles.passwordInput}
    placeholder="Enter your password"
    placeholderTextColor={COLORS.muted}
    secureTextEntry={!showPassword}
    value={password}
    onChangeText={setPassword}
  />

  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
  >
    <Text style={styles.showPassword}>
      {showPassword ? 'Hide' : 'Show'}
    </Text>
  </TouchableOpacity>
</View>

<TouchableOpacity
  style={[styles.primaryButton, loginLoading && styles.disabled]}
  onPress={isSignup ? handleSignup : handleLogin}
  disabled={loginLoading}
>
  {loginLoading ? (
    <ActivityIndicator color={COLORS.white} />
  ) : (
    <Text style={styles.primaryButtonText}>
      {isSignup ? 'Create Account' : 'Login to account'}
    </Text>
  )}
</TouchableOpacity>

<TouchableOpacity
  style={{ alignItems: 'center', marginTop: 18, padding: 8 }}
  onPress={() => {
    setIsSignup(!isSignup);
    setPassword('');
  }}
  disabled={loginLoading}
>
  <Text style={{ color: COLORS.navy, fontWeight: '700' }}>
    {isSignup
      ? 'Already have an account? Login'
      : "New to MohallaFix? Sign Up"}
  </Text>
</TouchableOpacity>


</View>

            
{/* <Text style={styles.loginHeading}>
  {isSignup ? 'Create Account' : 'Welcome back'}
</Text>

<Text style={styles.loginDescription}>
  {isSignup
    ? 'Join MohallaFix and help your neighbourhood.'
    : 'Login to manage your neighbourhood complaints.'}
</Text> */}

  {/* {isSignup && (
    <>
      <Text style={styles.fieldLabel}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        placeholderTextColor={COLORS.muted}
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <Text style={styles.fieldLabel}>Phone Number</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your phone number"
        placeholderTextColor={COLORS.muted}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
    </>
  )}

  <Text style={styles.fieldLabel}>Email Address</Text>
  <TextInput
    style={styles.input}
    placeholder="Enter your email"
    placeholderTextColor={COLORS.muted}
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    value={email}
    onChangeText={setEmail}
  />

  <Text style={styles.fieldLabel}>Password</Text>

  <View style={styles.passwordContainer}>
    <TextInput
      style={styles.passwordInput}
      placeholder="Enter your password"
      placeholderTextColor={COLORS.muted}
      secureTextEntry={!showPassword}
      value={password}
      onChangeText={setPassword}
    />

    <TouchableOpacity
      onPress={() => setShowPassword(!showPassword)}
    >
      <Text style={styles.showPassword}>
        {showPassword ? 'Hide' : 'Show'}
      </Text>
    </TouchableOpacity>
  </View>

  <TouchableOpacity
    style={[styles.primaryButton, loginLoading && styles.disabled]}
    onPress={isSignup ? handleSignup : handleLogin}
    disabled={loginLoading}
  >
    {loginLoading ? (
      <ActivityIndicator color={COLORS.white} />
    ) : (
      <Text style={styles.primaryButtonText}>
        {isSignup ? 'Create Account' : 'Login to account'}
      </Text>
    )}
  </TouchableOpacity>

  <TouchableOpacity
    style={{ alignItems: 'center', marginTop: 18, padding: 8 }}
    onPress={() => {
      setIsSignup(!isSignup);
      setPassword('');
    }}
    disabled={loginLoading}
  >
    <Text style={{ color: COLORS.navy, fontWeight: '700' }}>
      {isSignup
        ? 'Already have an account? Login'
        : "New to MohallaFix? Sign Up"}
    </Text>
  </TouchableOpacity> */}



            <Text style={styles.loginFooter}>
              MohallaFix · Community Service Platform
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ---------------- MAIN APP ----------------

  return (
    
      <SafeAreaView style={styles.app}>
    <StatusBar
      barStyle="light-content"
      backgroundColor={COLORS.navyDark}
    />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>MohallaFix</Text>
          <Text style={styles.headerSubtitle}>Community Dashboard</Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.onlineDot} />
          <Text style={styles.headerOnline}>Live</Text>
        </View>
      </View>

<ScrollView
  style={styles.content}
  contentContainerStyle={styles.contentContainer}
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
  showsVerticalScrollIndicator={true}
  persistentScrollbar={Platform.OS === 'android'}
>

{/* 
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      > */}
        {/* FEED */}

        {activeTab === 'feed' && (
          <View>
            <Text style={styles.pageTitle}>Community Feed</Text>
            <Text style={styles.pageSubtitle}>
              Latest neighbourhood complaints and updates.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{complaints.length}</Text>
                <Text style={styles.statLabel}>Total Reports</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {complaints.filter((c) => c.status === 'Pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {complaints.filter((c) => c.status === 'Resolved').length}
                </Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
            </View>

            <View style={styles.sectionHeadingRow}>
              <Text style={styles.sectionTitle}>Recent Complaints</Text>
              <Text style={styles.liveLabel}>● LIVE UPDATES</Text>
            </View>

            {loadingComplaints && complaints.length === 0 ? (
              <ActivityIndicator
                size="large"
                color={COLORS.green}
                style={styles.loader}
              />
            ) : complaints.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>No complaints yet</Text>
                <Text style={styles.emptyText}>
                  Abhi koi complaint available nahi hai. Pehli report submit karo.
                </Text>
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() => setActiveTab('report')}
                >
                  <Text style={styles.smallButtonText}>Report an issue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              complaints.map((item) => {
                const expanded = expandedId === item._id;

                return (
                  <TouchableOpacity
                    key={item._id}
                    activeOpacity={0.9}
                    style={styles.complaintCard}
                    onPress={() =>
                      setExpandedId(expanded ? '' : item._id)
                    }
                  >
                    <View style={styles.complaintTop}>
                      <View style={styles.complaintCategory}>
                        <Text style={styles.categoryText}>{item.category}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status) + '18' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(item.status) },
                          ]}
                        >
                          {item.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.complaintTitle}>{item.title}</Text>

                    <Text style={styles.complaintDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    <View style={styles.complaintMeta}>
                      <Text style={styles.metaText}>📍 {item.location}</Text>
                      <Text style={styles.metaText}>
                        {formatDate(item.createdAt)}
                      </Text>
                    </View>

                    {expanded && (
                      <View style={styles.expandedContent}>
                        {!!item.image && (
                          <Image
                            source={{ uri: getImageUrl(item.image) }}
                            style={styles.complaintImage}
                            resizeMode="cover"
                          />
                        )}

                        <Text style={styles.detailLabel}>Full description</Text>
                        <Text style={styles.detailText}>
                          {item.description}
                        </Text>

                        <Text style={styles.detailLabel}>Priority</Text>
                        <Text style={styles.detailText}>
                          {item.priority || 'Medium'}
                        </Text>

                        <Text style={styles.detailLabel}>Reported by</Text>
                        <Text style={styles.detailText}>
                          {item.user?.name || 'Resident'}
                        </Text>

                        <Text style={styles.detailHint}>
                          Tap the card again to close.
                        </Text>
                      </View>
                    )}

                    <Text style={styles.expandText}>
                      {expanded ? 'Show less ↑' : 'View details ↓'}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* REPORT */}

        {activeTab === 'report' && (
          <View>
            <Text style={styles.pageTitle}>Report an Issue</Text>
            <Text style={styles.pageSubtitle}>
              Tell us about a problem in your neighbourhood.
            </Text>

            <View style={styles.formCard}>
              <Text style={styles.formHeading}>Complaint Details</Text>

              <Text style={styles.fieldLabel}>Complaint title</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Street light not working"
                placeholderTextColor={COLORS.muted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowCategories(!showCategories)}
              >
                <Text style={styles.dropdownText}>{category}</Text>
                <Text style={styles.dropdownArrow}>
                  {showCategories ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>

              {showCategories && (
                <View style={styles.dropdownOptions}>
                  {CATEGORIES.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setCategory(item);
                        setShowCategories(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter area, street or landmark"
                placeholderTextColor={COLORS.muted}
                value={location}
                onChangeText={setLocation}
              />

              <Text style={styles.fieldLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Explain the issue in detail..."
                placeholderTextColor={COLORS.muted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.fieldLabel}>Complaint image</Text>

              <TouchableOpacity
                style={styles.imagePicker}
                onPress={pickImage}
              >
                <Text style={styles.imagePickerIcon}>＋</Text>
                <Text style={styles.imagePickerTitle}>
                  {selectedImage ? 'Change selected image' : 'Select an image'}
                </Text>
                <Text style={styles.imagePickerSubtitle}>
                  Attach a photo of the reported issue
                </Text>
              </TouchableOpacity>

              {selectedImage && (
                <View style={styles.selectedImageContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.selectedImage}
                  />
                  <TouchableOpacity
                    onPress={() => setSelectedImage(null)}
                    style={styles.removeImage}
                  >
                    <Text style={styles.removeImageText}>Remove image</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.disabled]}
                onPress={submitComplaint}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Submit Complaint
                  </Text>
                )}
              </TouchableOpacity>

              <Text style={styles.formNote}>
                Your complaint will be sent to the MohallaFix database.
              </Text>
            </View>
          </View>
        )}

        {/* ZONE */}

        {activeTab === 'zone' && (
          <View>
            <Text style={styles.pageTitle}>My Neighbourhood</Text>
            <Text style={styles.pageSubtitle}>
              Community and service area information.
            </Text>

            <View style={styles.zoneCard}>
              <View style={styles.zoneIcon}>
                <Text style={styles.zoneIconText}>⌖</Text>
              </View>

              <Text style={styles.zoneTitle}>Neighbourhood Zone</Text>
              <Text style={styles.zoneDescription}>
                MohallaFix helps residents report local problems and follow
                their progress.
              </Text>

              <View style={styles.zoneInfo}>
                <Text style={styles.zoneInfoLabel}>Account email</Text>
                <Text style={styles.zoneInfoValue}>{user.email}</Text>
              </View>

              <View style={styles.zoneInfo}>
                <Text style={styles.zoneInfoLabel}>Location tracking</Text>
                <Text style={styles.zoneInfoValue}>
                  Not enabled
                </Text>
              </View>

              <Text style={styles.zoneNote}>
                GPS-based zone detection is not active yet. Enter your
                neighbourhood location manually when submitting a complaint.
              </Text>
            </View>
          </View>
        )}

        {/* PROFILE */}

        {activeTab === 'profile' && (
          <View>
            <Text style={styles.pageTitle}>My Profile</Text>
            <Text style={styles.pageSubtitle}>
              Your account and complaint activity.
            </Text>

            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </Text>
              </View>

              <Text style={styles.profileName}>{user.name || 'Resident'}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>

              <View style={styles.residentBadge}>
                <Text style={styles.residentBadgeText}>Resident Account</Text>
              </View>

              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>
                    {myComplaints.length}
                  </Text>
                  <Text style={styles.profileStatLabel}>My Reports</Text>
                </View>

                <View style={styles.profileStat}>
                  <Text style={styles.profileStatNumber}>{resolvedCount}</Text>
                  <Text style={styles.profileStatLabel}>Resolved</Text>
                </View>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileInfoLabel}>Email address</Text>
                <Text style={styles.profileInfoValue}>{user.email}</Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileInfoLabel}>Account role</Text>
                <Text style={styles.profileInfoValue}>{user.role}</Text>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MohallaFix · Making communities better
          </Text>
          <Text style={styles.connectionText}>
            ● {dbStatus}
          </Text>
        </View>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}

      <View style={styles.bottomNav}>
        {[
          { id: 'feed', label: 'Feed', icon: '⌂' },
          { id: 'report', label: 'Report', icon: '+' },
          { id: 'zone', label: 'Zone', icon: '◎' },
          { id: 'profile', label: 'Profile', icon: '◉' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text
              style={[
                styles.navIcon,
                activeTab === tab.id && styles.navActive,
              ]}
            >
              {tab.icon}
            </Text>

            <Text
              style={[
                styles.navLabel,
                activeTab === tab.id && styles.navActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loginScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loginKeyboard: {
    flex: 1,
  },
  loginScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.navy,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandLetter: {
    fontSize: 34,
    fontWeight: '900',
    color: COLORS.white,
  },
  brandName: {
    textAlign: 'center',
    fontSize: 29,
    fontWeight: '900',
    color: COLORS.navy,
  },
  brandSubtitle: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 6,
    marginBottom: 30,
  },
  loginCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  loginHeading: {
  fontSize: 23,
  fontWeight: '800',
  color: COLORS.text,
  textAlign: 'center',
},

loginDescription: {
  fontSize: 13,
  color: COLORS.muted,
  lineHeight: 20,
  marginTop: 7,
  marginBottom: 22,
  textAlign: 'center',
},
  // loginHeading: {
  //   fontSize: 23,
  //   fontWeight: '800',
  //   color: COLORS.text,
  // },
  // loginDescription: {
  //   fontSize: 13,
  //   color: COLORS.muted,
  //   lineHeight: 20,
  //   marginTop: 7,
  //   marginBottom: 22,
  // },
  loginFooter: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 25,
  },

  header: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 20,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#D3E2EB',
    fontSize: 11,
    marginTop: 3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF18',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    backgroundColor: '#5DE3A1',
    borderRadius: 10,
    marginRight: 6,
  },
  headerOnline: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 17,
    paddingBottom: 25,
  },
  pageTitle: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 20,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statNumber: {
    fontSize: 23,
    fontWeight: '900',
    color: COLORS.navy,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 5,
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  liveLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.green,
  },

  complaintCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  complaintTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  complaintCategory: {
    backgroundColor: '#EDF3F7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
  },
  categoryText: {
    fontSize: 10,
    color: COLORS.navy,
    fontWeight: '800',
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  complaintDescription: {
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 19,
    marginTop: 7,
  },
  complaintMeta: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 7,
  },
  metaText: {
    fontSize: 10,
    color: COLORS.muted,
  },
  expandedContent: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  complaintImage: {
    width: '100%',
    height: 190,
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: COLORS.background,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.navy,
    fontWeight: '800',
    marginTop: 9,
  },
  detailText: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 19,
  },
  detailHint: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 13,
  },
  expandText: {
    textAlign: 'right',
    color: COLORS.green,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
  },

  emptyCard: {
    backgroundColor: COLORS.white,
    padding: 25,
    borderRadius: 17,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 17,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  smallButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 16,
  },
  smallButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  loader: {
    marginTop: 35,
  },

  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formHeading: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: '900',
    marginBottom: 19,
  },
  fieldLabel: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 13,
    backgroundColor: '#FCFDFE',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FCFDFE',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 13,
    color: COLORS.text,
  },
  showPassword: {
    fontSize: 11,
    color: COLORS.green,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 110,
    paddingTop: 13,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FCFDFE',
  },
  dropdownText: {
    fontSize: 13,
    color: COLORS.text,
  },
  dropdownArrow: {
    color: COLORS.muted,
    fontSize: 11,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    marginTop: 5,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownOptionText: {
    fontSize: 12,
    color: COLORS.text,
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.green,
    borderRadius: 12,
    backgroundColor: COLORS.greenLight,
  },
  imagePickerIcon: {
    color: COLORS.green,
    fontSize: 28,
    fontWeight: '700',
  },
  imagePickerTitle: {
    color: COLORS.navy,
    fontWeight: '800',
    fontSize: 13,
    marginTop: 5,
  },
  imagePickerSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5,
  },
  selectedImageContainer: {
    marginTop: 12,
  },
  selectedImage: {
    height: 180,
    width: '100%',
    borderRadius: 12,
  },
  removeImage: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  removeImageText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: COLORS.green,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 22,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  disabled: {
    opacity: 0.6,
  },
  formNote: {
    color: COLORS.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },

  zoneCard: {
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  zoneIcon: {
    height: 65,
    width: 65,
    borderRadius: 20,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneIconText: {
    fontSize: 36,
    color: COLORS.green,
  },
  zoneTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: '900',
    marginTop: 17,
  },
  zoneDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.muted,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  zoneInfo: {
    width: '100%',
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  zoneInfoLabel: {
    color: COLORS.muted,
    fontSize: 10,
  },
  zoneInfoValue: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  zoneNote: {
    backgroundColor: '#FFF6E9',
    padding: 13,
    borderRadius: 10,
    color: '#9A6B2D',
    fontSize: 11,
    lineHeight: 18,
    marginTop: 12,
  },

  profileCard: {
    backgroundColor: COLORS.white,
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: '900',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 13,
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
  },
  residentBadge: {
    backgroundColor: COLORS.greenLight,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 13,
  },
  residentBadgeText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
  },
  profileStats: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 23,
    paddingVertical: 17,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  profileStat: {
    flex: 1,
    alignItems: 'center',
  },
  profileStatNumber: {
    color: COLORS.navy,
    fontSize: 23,
    fontWeight: '900',
  },
  profileStatLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },
  profileInfo: {
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileInfoLabel: {
    fontSize: 10,
    color: COLORS.muted,
  },
  profileInfoValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '800',
    marginTop: 5,
  },
  logoutButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#F0DADA',
    backgroundColor: '#FFF7F7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 22,
  },
  logoutButtonText: {
    color: COLORS.red,
    fontWeight: '900',
    fontSize: 13,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 10,
  },
  connectionText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 7,
  },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 15 : 9,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    color: COLORS.muted,
    fontSize: 22,
    fontWeight: '800',
  },
  navLabel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '700',
  },
  navActive: {
    color: COLORS.green,
  },
});
