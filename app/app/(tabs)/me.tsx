import { StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Profile</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.profileContainer}>
        <ThemedView style={styles.profileSection}>
          <ThemedText type="subtitle">User ID</ThemedText>
          <ThemedText style={styles.profileValue}>USR_2024_001</ThemedText>
        </ThemedView>

        <ThemedView style={styles.profileSection}>
          <ThemedText type="subtitle">Name</ThemedText>
          <ThemedText style={styles.profileValue}>John Doe</ThemedText>
        </ThemedView>

        <ThemedView style={styles.profileSection}>
          <ThemedText type="subtitle">Social Media</ThemedText>
          
          <ThemedView style={styles.socialLinks}>
            <ExternalLink href="https://x.com/johndoe">
              <ThemedView style={styles.socialItem}>
                <ThemedText type="link">𝕏 Twitter</ThemedText>
              </ThemedView>
            </ExternalLink>
            
            <ExternalLink href="https://linkedin.com/in/johndoe">
              <ThemedView style={styles.socialItem}>
                <ThemedText type="link">💼 LinkedIn</ThemedText>
              </ThemedView>
            </ExternalLink>
            
            <ExternalLink href="https://github.com/johndoe">
              <ThemedView style={styles.socialItem}>
                <ThemedText type="link">🐱 GitHub</ThemedText>
              </ThemedView>
            </ExternalLink>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </>   
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 40,
    marginBottom: 20,
  },
  profileContainer: {
    padding: 16,
    gap: 24,
  },
  profileSection: {
    gap: 8,
  },
  profileValue: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  socialLinks: {
    gap: 12,
    marginLeft: 8,
  },
  socialItem: {
    paddingVertical: 8,
  },
});
