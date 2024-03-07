import React from 'react';
import socketio from 'socket.io-client';

export const socket = socketio.connect('https://silver-umbrella-jjggxjrvv5q3rw6-4000.app.github.dev');
export const SocketContext = React.createContext();
  
