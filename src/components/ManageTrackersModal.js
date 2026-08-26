import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTrackers } from '../context/TrackerContext';

export default function ManageTrackersModal({ visible, onClose }) {
  const { trackers, unarchiveTracker } = useTrackers();
  const archived = trackers.filter((t) => t.archived);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Archived trackers</Text>
          <Text style={styles.hint}>Archiving hides a tracker from your dashboard but keeps all its data. Restore it here anytime.</Text>

          <ScrollView style={{ marginTop: 12 }}>
            {archived.length === 0 ? (
              <Text style={styles.empty}>Nothing archived.</Text>
            ) : (
              archived.map((t) => (
                <View key={t.id} style={styles.row}>
                  <Text style={styles.name}>{t.icon} {t.name}</Text>
                  <TouchableOpacity onPress={() => unarchiveTracker(t.id)}>
                    <Text style={styles.restoreLink}>Restore</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

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
  sheet: { backgroundColor: '#1F2937', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  heading: { color: '#fff', fontSize: 18, fontWeight: '700' },
  hint: { color: '#6B7280', fontSize: 12, marginTop: 6 },
  empty: { color: '#6B7280', fontSize: 13, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomColor: '#374151', borderBottomWidth: 1 },
  name: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  restoreLink: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  closeBtn: { marginTop: 16, alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 24 },
  closeText: { color: '#818CF8', fontWeight: '700', fontSize: 15 },
});
