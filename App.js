import React from 'react';
import { TodoProvider } from './src/context/TodoContext';
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <TodoProvider>
      <HomeScreen />
    </TodoProvider>
  );
}
