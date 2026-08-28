import React, { useState } from 'react';
import { View } from 'react-native';
import { TodoProvider } from './src/context/TodoContext';
import { PhoneUsageProvider } from './src/context/PhoneUsageContext';
import { TrackerProvider } from './src/context/TrackerContext';
import { TripProvider } from './src/context/TripContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import PhoneUsageScreen from './src/screens/PhoneUsageScreen';
import TrackerListScreen from './src/screens/TrackerListScreen';
import TrackerDetailScreen from './src/screens/TrackerDetailScreen';
import TripsScreen from './src/screens/TripsScreen';

export default function App() {
  // { name: 'dashboard' | 'todos' | 'phoneUsage' | 'trips' | 'trackerList' | 'trackerDetail', trackerId?: string }
  const [screen, setScreen] = useState({ name: 'dashboard' });
  // Bumping this remounts every provider below, so after a backup import they
  // all reload fresh data from storage instead of keeping stale in-memory state.
  const [dataVersion, setDataVersion] = useState(0);

  const goToDashboard = () => setScreen({ name: 'dashboard' });
  const goToTrackerList = () => setScreen({ name: 'trackerList' });

  return (
    <View key={dataVersion} style={{ flex: 1 }}>
      <TodoProvider>
        <PhoneUsageProvider>
          <TripProvider>
            <TrackerProvider>
              {screen.name === 'dashboard' && (
                <DashboardScreen
                  onSelectFeature={(key) => setScreen({ name: key })}
                  onOpenTrackers={goToTrackerList}
                  onImported={() => setDataVersion((v) => v + 1)}
                />
              )}
              {screen.name === 'todos' && <HomeScreen onBack={goToDashboard} />}
              {screen.name === 'habits' && <HabitsScreen onBack={goToDashboard} />}
              {screen.name === 'phoneUsage' && <PhoneUsageScreen onBack={goToDashboard} />}
              {screen.name === 'trips' && <TripsScreen onBack={goToDashboard} />}
              {screen.name === 'trackerList' && (
                <TrackerListScreen
                  onBack={goToDashboard}
                  onSelectTracker={(trackerId) => setScreen({ name: 'trackerDetail', trackerId })}
                />
              )}
              {screen.name === 'trackerDetail' && (
                <TrackerDetailScreen trackerId={screen.trackerId} onBack={goToTrackerList} />
              )}
            </TrackerProvider>
          </TripProvider>
        </PhoneUsageProvider>
      </TodoProvider>
    </View>
  );
}
