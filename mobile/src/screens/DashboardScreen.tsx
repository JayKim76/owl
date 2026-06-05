import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity 
} from 'react-native';
import { useTheme, Colors } from '../context/ThemeContext';
import api from '../api';
import { Wrench, PhoneCall, Calendar as CalendarIcon, ChevronRight } from 'lucide-react-native';

export const DashboardScreen = () => {
  const [stats, setStats] = useState({ inProgress: 0, urgent: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];

  const fetchStats = async () => {
    try {
      // 대시보드 데이터를 가져오는 API가 없으므로 고객 목록 등으로 추론하거나 전용 API 필요
      // 여기서는 임시로 고객 목록의 수를 가져와 표시
      const response = await api.get('/api/customers');
      const customers = response.data;
      
      // 실제로는 서버에서 계산된 값을 가져오는 것이 좋음
      setStats({
        inProgress: customers.filter((c: any) => c.phase !== 'phase5').length,
        urgent: customers.filter((c: any) => c.isUrgent).length
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.content}>
        {/* Summary Section */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>업무 요약</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E3A8A' : '#EFF6FF', borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <Wrench size={20} color={isDark ? '#BFDBFE' : '#2563EB'} />
              <Text style={[styles.statLabel, { color: isDark ? '#BFDBFE' : '#1E40AF' }]}>진행 중 공사</Text>
            </View>
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#1E3A8A' }]}>{stats.inProgress}건</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderColor: colors.border }]}>
            <View style={styles.statHeader}>
              <PhoneCall size={20} color={isDark ? '#FECACA' : '#DC2626'} />
              <Text style={[styles.statLabel, { color: isDark ? '#FECACA' : '#991B1B' }]}>긴급 출동 대기</Text>
            </View>
            <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#7F1D1D' }]}>{stats.urgent}건</Text>
          </View>
        </View>

        {/* Calendar Section Mockup */}
        <View style={styles.headerRow}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>이번 주 일정</Text>
          <TouchableOpacity>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>전체보기</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.calendarRow}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <View key={day} style={[styles.dayItem, idx === 2 && styles.todayItem]}>
                <Text style={[styles.dayLabel, { color: idx === 2 ? '#FFF' : colors.textSecondary }]}>{day}</Text>
                <Text style={[styles.dateLabel, { color: idx === 2 ? '#FFF' : colors.text }]}>{15 + idx}</Text>
                {idx === 2 && <View style={styles.dot} />}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: 24 }]}>최근 등록 고객</Text>
        {[1, 2].map((i) => (
          <View key={i} style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.activityIcon}>
              <CalendarIcon size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>홍길동 고객님</Text>
              <Text style={[styles.activityTime, { color: colors.textSecondary }]}>인천 미추홀구 · 누수탐지</Text>
            </View>
            <ChevronRight size={16} color={colors.border} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayItem: {
    alignItems: 'center',
    width: 38,
    paddingVertical: 8,
    borderRadius: 12,
  },
  todayItem: {
    backgroundColor: '#1E3A8A',
  },
  dayLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FACC15',
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 13,
    marginTop: 2,
  }
});
