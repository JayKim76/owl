import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useTheme, Colors } from '../context/ThemeContext';
import api from '../api';
import { Search, Phone, MapPin, ChevronRight, User } from 'lucide-react-native';

export const CustomersScreen = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers');
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter((c: any) => 
      c.name.toLowerCase().includes(text.toLowerCase()) ||
      c.phone.includes(text) ||
      c.region.includes(text)
    );
    setFilteredCustomers(filtered);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
          <User size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            {item.isUrgent && (
              <View style={styles.urgentBadge}>
                <Text style={styles.urgentText}>긴급</Text>
              </View>
            )}
          </View>
          <Text style={[styles.jobType, { color: colors.textSecondary }]}>{item.jobType}</Text>
        </View>
        <ChevronRight size={18} color={colors.border} />
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.infoItem}>
          <Phone size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.phone}</Text>
        </View>
        <View style={styles.infoItem}>
          <MapPin size={14} color={colors.textSecondary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.region}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="이름, 연락처, 지역 검색..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ color: colors.textSecondary }}>검색 결과가 없습니다.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
  },
  urgentBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  urgentText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  jobType: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  }
});
