import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { 
  Package, 
  Play, 
  AlertCircle, 
  CheckCircle, 
  Cpu, 
  Send,
  RefreshCw
} from 'lucide-react-native';
import axios from 'axios';

const API_BASE = 'http://192.168.1.5:3000/api/admin';

export default function App() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: '👋 Привет! Я твой ИИ-клон. Что сегодня делаем?', type: 'ai' }
  ]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data.data);
    } catch (error) {
      console.error('Fetch Stats Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Автообновление каждые 5 сек
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), text: input, type: 'user' };
    setMessages([...messages, userMsg]);
    setInput('');

    // Имитация ответа ИИ (позже подключим настоящий бекенд)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: `Понял тебя! Даю команду: "${input}". Выполняю...`, 
        type: 'ai' 
      }]);
    }, 1000);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Accurate Admin AI</Text>
          <Cpu color="#fff" size={24} />
        </View>

        <ScrollView 
          style={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        >
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Package color="#60a5fa" size={24} />
              <Text style={styles.statLabel}>Всего товаров</Text>
              <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <CheckCircle color="#4ade80" size={24} />
              <Text style={styles.statLabel}>Успешно</Text>
              <Text style={styles.statValue}>{stats?.importStatus?.success || 0}</Text>
            </View>
            <View style={styles.statCard}>
              <AlertCircle color="#f87171" size={24} />
              <Text style={styles.statLabel}>Ошибки</Text>
              <Text style={styles.statValue}>{stats?.importStatus?.errors || 0}</Text>
            </View>
          </View>

          {/* AI Chat Area */}
          <View style={styles.chatSection}>
            <Text style={styles.sectionTitle}>Чат с ИИ-ассистентом</Text>
            <View style={styles.chatBox}>
              {messages.map((m) => (
                <View key={m.id} style={[styles.message, m.type === 'user' ? styles.userMsg : styles.aiMsg]}>
                  <Text style={styles.messageText}>{m.text}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Play color="#fff" size={20} />
              <Text style={styles.actionText}>Запустить импорт 500</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput 
            style={styles.input}
            placeholder="Спроси меня о чем-нибудь..."
            placeholderTextColor="#94a3b8"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#1e293b',
    width: '31%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  chatSection: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  chatBox: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 15,
    minHeight: 200,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '85%',
  },
  aiMsg: {
    backgroundColor: '#334155',
    alignSelf: 'flex-start',
  },
  userMsg: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
  actions: {
    padding: 20,
  },
  actionBtn: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: '#fff',
    marginRight: 10,
  },
  sendBtn: {
    backgroundColor: '#2563eb',
    padding: 10,
    borderRadius: 10,
  }
});
