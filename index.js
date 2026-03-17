import 'react-native-gesture-handler'; // Deve ser a 1ª linha
import { registerRootComponent } from 'expo';
import App from './App'; // Importa o App.js da mesma pasta

registerRootComponent(App);
