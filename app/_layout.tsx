import React from 'react';
import { Stack } from 'expo-router';
import { DataProvider } from '../src/context/DataContext';

/**
 * _layout.tsx — Raiz da navegação (Expo Router)
 *
 * Responsabilidades:
 * - Envolver todo o app com o DataProvider para que qualquer tela
 *   consiga acessar o contexto via useData().
 * - Declarar o Stack e esconder o header padrão em todas as rotas
 *   (cada tela cuida do próprio header, se necessário).
 */
export default function RootLayout() {
  return (
    <DataProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DataProvider>
  );
}
