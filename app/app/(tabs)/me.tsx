import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <ThemedView style={styles.headerSection}>
        <ThemedView style={styles.avatarContainer}>
          <ThemedText style={styles.avatarText}>JD</ThemedText>
        </ThemedView>
        <ThemedText type="title" style={styles.headerTitle}>John Doe</ThemedText>
        <ThemedText style={styles.userRole}>Software Developer</ThemedText>
        <ThemedView style={styles.statusBadge}>
          <ThemedView style={styles.statusDot} />
          <ThemedText style={styles.statusText}>Active</ThemedText>
        </ThemedView>
      </ThemedView>

      {/* Profile Info Section */}
      <ThemedView style={styles.infoContainer}>
        <ThemedView style={styles.infoCard}>
          <ThemedView style={styles.infoHeader}>
            <ThemedText style={styles.infoIcon}>🆔</ThemedText>
            <ThemedText type="subtitle" style={styles.infoTitle}>User Information</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>User ID</ThemedText>
            <ThemedText style={styles.infoValue}>USR_2024_001</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Member Since</ThemedText>
            <ThemedText style={styles.infoValue}>January 2024</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Location</ThemedText>
            <ThemedText style={styles.infoValue}>San Francisco, CA</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Social Media Section */}
        <ThemedView style={styles.infoCard}>
          <ThemedView style={styles.infoHeader}>
            <ThemedText style={styles.infoIcon}>🌐</ThemedText>
            <ThemedText type="subtitle" style={styles.infoTitle}>Social Links</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.socialGrid}>
            <ExternalLink href="https://x.com/johndoe">
              <ThemedView style={[styles.socialCard, styles.twitterCard]}>
                <ThemedText style={styles.socialIcon}>𝕏</ThemedText>
                <ThemedText style={styles.socialLabel}>Twitter</ThemedText>
                <ThemedText style={styles.socialHandle}>@johndoe</ThemedText>
              </ThemedView>
            </ExternalLink>
            
            <ExternalLink href="https://linkedin.com/in/johndoe">
              <ThemedView style={[styles.socialCard, styles.linkedinCard]}>
                <ThemedText style={styles.socialIcon}>💼</ThemedText>
                <ThemedText style={styles.socialLabel}>LinkedIn</ThemedText>
                <ThemedText style={styles.socialHandle}>johndoe</ThemedText>
              </ThemedView>
            </ExternalLink>
            
            <ExternalLink href="https://github.com/johndoe">
              <ThemedView style={[styles.socialCard, styles.githubCard]}>
                <ThemedText style={styles.socialIcon}>🐱</ThemedText>
                <ThemedText style={styles.socialLabel}>GitHub</ThemedText>
                <ThemedText style={styles.socialHandle}>johndoe</ThemedText>
              </ThemedView>
            </ExternalLink>

            <TouchableOpacity>
              <ThemedView style={[styles.socialCard, styles.instagramCard]}>
                <ThemedText style={styles.socialIcon}>📷</ThemedText>
                <ThemedText style={styles.socialLabel}>Instagram</ThemedText>
                <ThemedText style={styles.socialHandle}>@john_doe</ThemedText>
              </ThemedView>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#1e1e1e',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0a84ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#333',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  headerTitle: {
    color: 'white',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#888',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d5a2d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  statusText: {
    color: '#4caf50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
    gap: 20,
  },
  infoCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoIcon: {
    fontSize: 24,
  },
  infoTitle: {
    color: 'white',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a84ff',
  },
  socialGrid: {
    gap: 12,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
  },
  twitterCard: {
    backgroundColor: '#0f1419',
    borderColor: '#1d9bf0',
  },
  linkedinCard: {
    backgroundColor: '#0a1929',
    borderColor: '#0077b5',
  },
  githubCard: {
    backgroundColor: '#0d1117',
    borderColor: '#333',
  },
  instagramCard: {
    backgroundColor: '#1a0d1a',
    borderColor: '#e4405f',
  },
  socialIcon: {
    fontSize: 24,
  },
  socialLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  socialHandle: {
    fontSize: 14,
    color: '#888',
  },
})