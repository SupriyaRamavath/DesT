import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

let sharedSocket = null;

function getSocket(url) {
  if (!sharedSocket) {
    const token = localStorage.getItem("decisiontrace_token");
    sharedSocket = io(url, {
      autoConnect: true,
      auth: token ? { token } : {},
    });
  }
  return sharedSocket;
}

function useSocket(url = SOCKET_URL) {
  const [connected, setConnected] = useState(Boolean(sharedSocket?.connected));

  useEffect(() => {
    const socket = getSocket(url);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [url]);

  const emit = (event, data) => sharedSocket?.emit(event, data);
  const subscribe = (event, callback) => {
    if (!sharedSocket) return () => {};
    sharedSocket.on(event, callback);
    return () => sharedSocket?.off(event, callback);
  };

  return { socket: sharedSocket, connected, emit, subscribe };
}

export default useSocket;
