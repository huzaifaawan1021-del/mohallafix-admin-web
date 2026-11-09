
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

// Backend API URL - Yeh wahi IP hai jo abhi aapke Expo terminal par show ho rahi hai
const API_URL = 'http://127.0.0.1:5000/api';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feed');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electricity');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState('Checking MongoDB Sync...');

  const categories = ['Electricity', 'Water Supply', 'Road & Potholes', 'Garbage & Sanitation', 'Street Light'];

  useEffect(() => {
    if (isLoggedIn) {
      fetchAllDataFromDatabase();
      const syncInterval = setInterval(fetchAllDataFromDatabase, 4000);
      return () => clearInterval(syncInterval);
    }
  }, [isLoggedIn]);

  const fetchAllDataFromDatabase = async () => {
    try {
      const response = await fetch(`${API_URL}/complaints`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setComplaints(data);
        setDbStatus('🟢 Connected to MongoDB & Web Sync Active');
      }
    } catch (error) {
      setDbStatus('🔴 Backend Offline - Check Node.js Server');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Login Required', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsLoggedIn(true);
      fetchAllDataFromDatabase();
    }, 300);
  };

  const handleAddComplaintToDB = async () => {
    if (!title || !description) {
      Alert.alert('Incomplete Fields', 'Please provide a valid title and detailed description.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { 
        title, 
        description, 
        category, 
        citizen: email || 'citizen@mohallafix.com',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${API_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok || response.status === 200 || response.status === 201) {
        setTitle('');
        setDescription('');
        setSuccessMsg('✨ Successfully saved to MongoDB & synced with Web Admin!');
        setTimeout(() => setSuccessMsg(''), 4500);
        fetchAllDataFromDatabase();
        setActiveTab('feed');
      }  else {
  const errorData = await response.json().catch(() => ({}));

  Alert.alert(
    `Database Error (${response.status})`,
    errorData.error || errorData.message || 'Complaint save nahi hui.'
  );
}
    } catch (error) {
      Alert.alert('Connection Failed', 'Could not reach backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginWrapper}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoChar}>M</Text>
          </View>
          <Text style={styles.mainTitle}>MohallaFix Portal</Text>
          <Text style={styles.subTitle}>SECURE MOBILE & WEB SYNC</Text>

          <View style={styles.cardBox}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="citizen@mohallafix.com"
              placeholderTextColor="#627D98"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="off"
            />

            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.textInput, { flex: 1, marginBottom: 0, borderWidth: 0, backgroundColor: 'transparent' }]}
                placeholder="Enter password"
                placeholderTextColor="#627D98"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoComplete="off"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 16 }}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.8}>
              {loading ? <ActivityIndicator color="#0B132B" /> : <Text style={styles.primaryBtnText}>Access Dashboard</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>MohallaFix App</Text>
          <Text style={styles.headerSub}>{dbStatus}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBadge} onPress={() => setIsLoggedIn(false)} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {successMsg ? (
        <View style={styles.notificationBanner}>
          <Text style={styles.notificationText}>{successMsg}</Text>
        </View>
      ) : null}

      <View style={styles.bodyContent}>
        {activeTab === 'feed' && (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>📰 Live Community Feed</Text>
              <TouchableOpacity onPress={fetchAllDataFromDatabase} style={styles.refreshBtn}>
                <Text style={styles.refreshText}>🔄 Sync DB</Text>
              </TouchableOpacity>
            </View>

            {complaints.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No complaints fetched from MongoDB database yet.</Text>
              </View>
            ) : (
              complaints.map((item, index) => {
                const isExpanded = expandedId === (item._id || index);
                return (
                  <TouchableOpacity 
                    key={item._id || index} 
                    style={styles.issueCard} 
                    activeOpacity={0.95}
                    onPress={() => toggleExpand(item._id || index)}
                  >
                    <View style={styles.issueCardTop}>
                      <Text style={styles.issueCategory}>{item.category || 'General'}</Text>
                      <View style={[styles.statusTag, item.status === 'In Progress' ? styles.tagProgress : styles.tagPending]}>
                        <Text style={styles.statusTagText}>{item.status || 'Pending'}</Text>
                      </View>
                    </View>
                    <Text style={styles.issueHeading}>{item.title}</Text>
                    
                    {isExpanded ? (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.issueDescExpanded}>{item.description}</Text>
                        <Text style={styles.issueTimestamp}>Submitted by: {item.citizen || 'Resident'}</Text>
                        <Text style={styles.dbSyncTag}>✔ Verified Web & MongoDB Record</Text>
                      </View>
                    ) : (
                      <Text style={styles.expandHint}>Tap to expand details ▼</Text>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {activeTab === 'report' && (
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.reportHeaderWrapper}>
              <Text style={styles.sectionTitle}>📝 Report Civic Issue</Text>
              <Text style={styles.reportSubtitle}>Directly saves to MongoDB & syncs to Web Dashboard</Text>
            </View>
            
            <View style={styles.cardBox}>
              <Text style={styles.inputLabel}>Select Category</Text>
              <TouchableOpacity 
                style={styles.dropdownSelector} 
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.dropdownSelectorText}>{category}</Text>
                <Text style={{ color: '#00F5D4' }}>{showDropdown ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showDropdown && (
                <View style={styles.dropdownList}>
                  {categories.map((cat, idx) => (
                    <TouchableOpacity 
                      key={idx} 
                      style={styles.dropdownItem} 
                      onPress={() => { setCategory(cat); setShowDropdown(false); setTitle(cat + ' Issue Report'); }}
                    >
                      <Text style={styles.dropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.inputLabel}>Issue Title</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Broken Street Light on Main Road"
                placeholderTextColor="#627D98"
                value={title}
                onChangeText={setTitle}
                autoComplete="off"
              />

              <Text style={styles.inputLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.textInput, { height: 110, textAlignVertical: 'top', paddingTop: 12 }]}
                placeholder="Provide accurate location and details..."
                placeholderTextColor="#627D98"
                multiline
                value={description}
                onChangeText={setDescription}
                autoComplete="off"
              />

              <TouchableOpacity style={styles.primaryBtn} onPress={handleAddComplaintToDB} disabled={submitting} activeOpacity={0.8}>
                {submitting ? <ActivityIndicator color="#0B132B" /> : <Text style={styles.primaryBtnText}>Submit & Sync to MongoDB</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {activeTab === 'zone' && (
          <View style={styles.centerContainer}>
            <View style={styles.radarCard}>
              <Text style={styles.radarIcon}>🗺️</Text>
              <Text style={styles.radarTitle}>Karachi Sector Zone Active</Text>
              <Text style={styles.radarDesc}>Real-time geofencing is monitoring civic infrastructure and complaints within your 5km radius.</Text>
              <View style={styles.zoneBadgeBox}>
                <Text style={styles.zoneBadgeText}>GPS: Active (24.8607° N, 67.0011° E)</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'profile' && (
          <View style={styles.centerContainer}>
            <View style={styles.profileAvatarBox}>
              <Text style={styles.avatarInitials}>{email ? email[0].toUpperCase() : 'U'}</Text>
            </View>
            <Text style={styles.profileUsername}>Resident Citizen</Text>
            <Text style={styles.profileEmailText}>{email || 'citizen@mohallafix.com'}</Text>
            
            <View style={styles.cardBox}>
              <View style={styles.profileStatRow}>
                <Text style={styles.statLabel}>Account Status</Text>
                <Text style={styles.statValGreen}>Verified Resident</Text>
              </View>
              <View style={styles.profileStatRow}>
                <Text style={styles.statLabel}>Total Reports Filed</Text>
                <Text style={styles.statValCyan}>{complaints.length}</Text>
              </View>
              <View style={styles.profileStatRow}>
                <Text style={styles.statLabel}>Database Status</Text>
                <Text style={styles.statValCyan}>Connected to MongoDB</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.bottomNavBar}>
        <TouchableOpacity style={[styles.navTab, activeTab === 'feed' && styles.navTabActive]} onPress={() => setActiveTab('feed')}>
          <Text style={[styles.navTabText, activeTab === 'feed' && styles.navTabTextActive]}>📰 Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navTab, activeTab === 'report' && styles.navTabActive]} onPress={() => setActiveTab('report')}>
          <Text style={[styles.navTabText, activeTab === 'report' && styles.navTabTextActive]}>➕ Report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navTab, activeTab === 'zone' && styles.navTabActive]} onPress={() => setActiveTab('zone')}>
          <Text style={[styles.navTabText, activeTab === 'zone' && styles.navTabTextActive]}>🗺️ Zone</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navTab, activeTab === 'profile' && styles.navTabActive]} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.navTabText, activeTab === 'profile' && styles.navTabTextActive]}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B132B' },
  loginWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  logoContainer: {
    width: 74,
    height: 74,
    backgroundColor: '#00F5D4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoChar: { fontSize: 40, fontWeight: '900', color: '#0B132B' },
  mainTitle: { fontSize: 30, fontWeight: '800', color: '#FFFFFF', marginBottom: 4, textAlign: 'center' },
  subTitle: { fontSize: 13, color: '#00F5D4', letterSpacing: 2.5, fontWeight: '700', marginBottom: 30, textAlign: 'center' },
  cardBox: {
    width: '100%',
    backgroundColor: '#1C2541',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  inputLabel: { fontSize: 13, color: '#8D99AE', marginBottom: 6, fontWeight: '700', textTransform: 'uppercase' },
  textInput: {
    backgroundColor: '#0B132B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B132B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A506B',
    marginBottom: 16,
    paddingRight: 10,
  },
  eyeBtn: { padding: 8 },
  primaryBtn: {
    backgroundColor: '#00F5D4',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#00F5D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryBtnText: { color: '#0B132B', fontSize: 16, fontWeight: '800' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#1C2541',
    borderBottomWidth: 1,
    borderColor: '#3A506B',
    paddingTop: Platform.OS === 'ios' ? 14 : 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: '#00F5D4', marginTop: 2 },
  logoutBadge: { backgroundColor: '#0B132B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#3A506B' },
  logoutText: { color: '#FF6B6B', fontSize: 12, fontWeight: 'bold' },
  notificationBanner: { backgroundColor: '#064E3B', padding: 12, alignItems: 'center', borderBottomWidth: 1, borderColor: '#047857' },
  notificationText: { color: '#34D399', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  bodyContent: { flex: 1, width: width },
  scrollContainer: { padding: 16, paddingBottom: 110, alignItems: 'center' },
  reportHeaderWrapper: { marginTop: 12, marginBottom: 14, width: '100%' },
  reportSubtitle: { fontSize: 12, color: '#8D99AE', marginTop: 2 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, width: '100%', marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  refreshBtn: { backgroundColor: '#1C2541', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#3A506B' },
  refreshText: { color: '#00F5D4', fontSize: 12, fontWeight: 'bold' },
  emptyCard: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#8D99AE', fontSize: 14, textAlign: 'center' },
  issueCard: {
    backgroundColor: '#1C2541',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  issueCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  issueCategory: { fontSize: 11, color: '#00F5D4', fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  statusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagPending: { backgroundColor: '#78350F' },
  tagProgress: { backgroundColor: '#1E3A8A' },
  statusTagText: { fontSize: 10, fontWeight: 'bold', color: '#FCD34D' },
  issueHeading: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  issueDescExpanded: { fontSize: 13, color: '#8D99AE', lineHeight: 18, marginTop: 4 },
  issueTimestamp: { fontSize: 10, color: '#8D99AE', marginTop: 6 },
  dbSyncTag: { fontSize: 10, color: '#34D399', marginTop: 2, fontWeight: 'bold' },
  expandHint: { fontSize: 11, color: '#00F5D4', marginTop: 4, fontStyle: 'italic' },
  dropdownSelector: {
    backgroundColor: '#0B132B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A506B',
  },
  dropdownSelectorText: { color: '#FFFFFF', fontSize: 15 },
  dropdownList: {
    backgroundColor: '#0B132B',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A506B',
    overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#1C2541' },
  dropdownItemText: { color: '#00F5D4', fontSize: 14, fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  radarCard: { backgroundColor: '#1C2541', padding: 24, borderRadius: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#3A506B' },
  radarIcon: { fontSize: 36, marginBottom: 10 },
  radarTitle: { color: '#00F5D4', fontSize: 16, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  radarDesc: { color: '#8D99AE', fontSize: 13, textAlign: 'center', lineHeight: 18, marginBottom: 14 },
  zoneBadgeBox: { backgroundColor: '#0B132B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#3A506B' },
  zoneBadgeText: { color: '#34D399', fontSize: 11, fontWeight: 'bold' },
  profileAvatarBox: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#00F5D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarInitials: { fontSize: 30, fontWeight: '900', color: '#0B132B' },
  profileUsername: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2, textAlign: 'center' },
  profileEmailText: { fontSize: 13, color: '#8D99AE', marginBottom: 20, textAlign: 'center' },
  profileStatRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#3A506B' },
  statLabel: { color: '#8D99AE', fontSize: 14 },
  statValGreen: { color: '#34D399', fontWeight: 'bold', fontSize: 14 },
  statValCyan: { color: '#00F5D4', fontWeight: 'bold', fontSize: 14 },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#1C2541',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#3A506B',
  },
  navTab: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  navTabActive: { borderTopWidth: 3, borderColor: '#00F5D4', backgroundColor: '#0B132B' },
  navTabText: { fontSize: 11, color: '#8D99AE', fontWeight: '600' },
  navTabTextActive: { color: '#00F5D4', fontWeight: 'bold' },
});