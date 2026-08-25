import React, { useState } from 'react';
import { TodoProvider } from './src/context/TodoContext';
import { PhoneUsageProvider } from './src/context/PhoneUsageContext';
import DashboardScreen from './src/screens/DashboardScreen';
import HomeScreen from './src/screens/HomeScreen';
import PhoneUsageScreen from './src/screens/PhoneUsageScreen';

export default function App() {
  const [screen, setScreen] = useState('dashboard'); // 'dashboard' | 'todos' | 'phoneUsage'

  return (
    <TodoProvider>
      <PhoneUsageProvider>
        {screen === 'dashboard' && <DashboardScreen onSelect={setScreen} />}
        {screen === 'todos' && <HomeScreen onBack={() => setScreen('dashboard')} />}
        {screen === 'phoneUsage' && <PhoneUsageScreen onBack={() => setScreen('dashboard')} />}
      </PhoneUsageProvider>
    </TodoProvider>
  );
}
