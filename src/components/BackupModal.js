import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { exportBackup, importBackup } from '../utils/backup';

export default function BackupModal({ visible, onClose, onImported }) {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    setBusy(true);
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert('Export failed', e.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    let file;
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', '*/*'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      file = result.assets ? result.assets[0] : result;
      if (!file?.uri) return;
    } catch (e) {
      Alert.alert('Could not open file picker', e.message || '');
      return;
    }

    Alert.alert(
      'Import backup?',
      "This will replace all current data in the app with the contents of this file. This can't be undone.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Import & Replace',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await importBackup(file.uri);
              onClose();
              onImported?.();
              Alert.alert('Import complete', 'Your data has been restored.');
            } catch (e) {
              Alert.alert('Import failed', e.message || 'That file could not be read as a Logbook backup.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Backup & Restore</Text>
          <Text style={styles.hint}>
            Export saves everything — to-dos, phone usage, trackers, and trips — into one file you can save
            to Drive, email to yourself, or store anywhere. Import restores from a file like that.
          </Text>

          {busy ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#818CF8" />
          ) : (
            <>
              <TouchableOpacity style={styles.actionBtn} onPress={handleExport}>
                <Text style={styles.actionBtnText}>⬆️ Export backup</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.importBtn]} onPress={handleImport}>
                <Text style={styles.actionBtnText}>⬇️ Import backup</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700' },
  hint: { color: '#9CA3AF', fontSize: 13, marginTop: 8, marginBottom: 16, lineHeight: 18 },
  actionBtn: { backgroundColor: '#374151', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10 },
  importBtn: { backgroundColor: '#312E81' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  closeBtn: { marginTop: 8, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  closeText: { color: '#9CA3AF', fontWeight: '600', fontSize: 14 },
});
