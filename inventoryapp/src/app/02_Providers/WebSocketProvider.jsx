import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const WebSocketContext = createContext();

const WebSocketProvider = ({ url, children }) => {
  const websocketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const websocket = new WebSocket(url);
    websocketRef.current = websocket;

    websocket.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      websocket.close();
    };
  }, [url]);

  const sendMessage = (message) => {
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(message);
    } else {
      console.error('WebSocket is not open');
    }
  };

  return (
    <WebSocketContext.Provider value={{ websocketRef, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

WebSocketProvider.propTypes = {
  url: PropTypes.string,
  children: PropTypes.node,
};

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export default WebSocketProvider;
