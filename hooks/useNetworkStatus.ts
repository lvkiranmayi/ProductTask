import { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    let wasOffline = false;

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected ?? true;
      setIsOnline(online);

      if (!online) {
        wasOffline = true;
      } else if (wasOffline) {
        // just came back online — flash the "back online" banner briefly
        setJustReconnected(true);
        wasOffline = false;
        setTimeout(() => setJustReconnected(false), 3000);
      }
    });

    return unsubscribe;
  }, []);

  return { isOnline, justReconnected };
}
