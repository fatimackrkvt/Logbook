import React, { useState } from 'react';
import { TodoProvider } from './src/context/TodoContext';
import { PhoneUsageProvider } from './src/context/PhoneUsageContext';
import { TrackerProvider } from './src/context/TrackerContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen';
import PhoneUsageScreen from './src/screens/PhoneUsageScreen';
import TrackerListScreen from './src/screens/TrackerListScreen';
import TrackerDetailScreen from './src/screens/TrackerDetailScreen';

export default function App() {
  // { name: 'dashboard' | 'todos' | 'phoneUsage' | 'trackerList' | 'trackerDetail', trackerId?: string }
  const [screen, setScreen] = useState({ name: 'dashboard' });

  const goToDashboard = () => setScreen({ name: 'dashboard' });
  const goToTrackerList = () => setScreen({ name: 'trackerList' });

  return (
    <TodoProvider>
      <PhoneUsageProvider>
        <TrackerProvider>
          {screen.name === 'dashboard' && (
            <DashboardScreen
              onSelectFeature={(key) => setScreen({ name: key })}
              onOpenTrackers={goToTrackerList}
            />
          )}
          {screen.name === 'todos' && <HomeScreen onBack={goToDashboard} />}
          {screen.name === 'phoneUsage' && <PhoneUsageScreen onBack={goToDashboard} />}
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
      </PhoneUsageProvider>
    </TodoProvider>
  );
}
