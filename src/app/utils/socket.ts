import { io } from 'socket.io-client';
import { BASE_URL } from '../../config/api';

const SOCKET_URL = BASE_URL;


export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'] // Added transports for better compatibility
});

