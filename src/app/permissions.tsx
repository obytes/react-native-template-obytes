/**
 * Permissions Screen
 * Requests Bluetooth + Location before entering the app.
 * Ported from zivaone_app/src/app/permissions.tsx
 */

import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { usePermissions } from '@/lib/bluetooth/hooks/use-permissions';
import { useAuth } from '@/lib/auth';

// ─── Sub-components ───────────────────────────────────────────────────────────

function PermissionItem({
  title,
  description,
  status,
  isOff,
  onPress,
  icon,
}: {
  title: string;
  description: string;
  status: 'granted' | 'denied' | 'undetermined' | 'blocked';
  isOff?: boolean;
  onPress: () => void;
  icon: string;
}) {
  const isGranted = status === 'granted';
  const isBlocked = status === 'blocked';

  const handlePress = () => {
    if (isBlocked) {
      Linking.openSettings();
    } else {
      onPress();
    }
  };

  return (
    <View style={styles.permissionItem}>
      <View style={styles.permissionHeader}>
        <View style={[styles.iconContainer, isGranted && styles.iconGranted]}>
          <Text style={styles.permissionIcon}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemDescription}>{description}</Text>
          <Text
            style={[
              styles.statusText,
              isGranted && !isOff ? styles.textSuccess : styles.textWarning,
            ]}
          >
            {'Status: '}
            {isGranted
              ? isOff
                ? 'Bluetooth Off'
                : 'Allowed'
              : status === 'denied'
                ? 'Denied'
                : status === 'blocked'
                  ? 'Blocked'
                  : 'Not Allowed'}
          </Text>
        </View>
      </View>

      {!isGranted && (
        <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
          <Text style={styles.actionButtonText}>
            {isBlocked ? 'Open Settings' : `Allow ${title}`}
          </Text>
        </TouchableOpacity>
      )}

      {isGranted && isOff && (
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>To connect your ring:</Text>
          {['Open Settings', 'Tap Bluetooth', 'Turn Bluetooth ON', 'Return to App'].map(
            (step, i) => (
              <View key={step} style={styles.instructionStep}>
                <Text style={styles.stepNumber}>{i + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ),
          )}
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PermissionsScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { signOut } = useAuth();
  const {
    bleStatus,
    locationStatus,
    isBluetoothEnabled,
    requestBle,
    requestLocation,
    isAllGranted,
  } = usePermissions({ autoRequest: true });

  const canContinue = isAllGranted && isBluetoothEnabled;

  // Auto-redirect when all requirements met
  React.useEffect(() => {
    if (canContinue) {
      if (returnTo) {
        router.replace(`/(app)/${returnTo}` as never);
      } else {
        router.replace('/(app)');
      }
    }
  }, [canContinue, router, returnTo]);

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Permissions Required</Text>
            <TouchableOpacity
              onPress={() => {
                signOut();
                router.replace('/login');
              }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            To connect to your ring device, we need the following permissions:
          </Text>
        </View>

        {/* Permission items */}
        <View style={styles.list}>
          <PermissionItem
            icon="📶"
            title="Bluetooth"
            description="Allow the app to find Bluetooth devices? Your ring uses Bluetooth to connect and sync health data."
            status={bleStatus}
            isOff={bleStatus === 'granted' && !isBluetoothEnabled}
            onPress={requestBle}
          />
          <PermissionItem
            icon="📍"
            title="Location"
            description="Allow the app to use your location? Bluetooth scanning on iOS requires location access."
            status={locationStatus}
            onPress={requestLocation}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.buttonDisabled]}
            disabled={!canContinue}
            onPress={() => {
              if (returnTo) {
                router.replace(`/(app)/${returnTo}` as never);
              } else {
                router.replace('/(app)');
              }
            }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpLink} onPress={() => Linking.openSettings()}>
            <Text style={styles.helpText}>Having trouble? Open Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  list: {
    gap: 24,
    marginBottom: 32,
  },
  permissionItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  permissionHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGranted: {
    backgroundColor: '#059669',
  },
  permissionIcon: {
    fontSize: 22,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textSuccess: {
    color: '#10B981',
  },
  textWarning: {
    color: '#F59E0B',
  },
  actionButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 'auto',
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpLink: {
    alignItems: 'center',
    padding: 8,
  },
  helpText: {
    color: '#888888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  instructionsTitle: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepNumber: {
    color: '#7C3AED',
    fontWeight: 'bold',
    width: 20,
    fontSize: 14,
  },
  stepText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});
