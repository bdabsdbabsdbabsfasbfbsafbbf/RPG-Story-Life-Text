import { useState, useRef, useEffect } from "react";
import { useGameStore } from "../../store/gameStore";
import { useAuthStore } from "../../store/authStore";
import { getSocket } from "../../services/socket";
import type { Socket } from "socket.io-client";
import { Send } from "lucide-react";

const channels = [
  { id: "global", label: "Global", color: "text-purple-400" },
  { id: "local", label: "Local", color: "text-green-400" },
  { id: "guild", label: "Guild", color: "text-cyan-400" },
  { id: "party", label: "Party", color: "text-yellow-400" },
  { id: "trade", label: "Trade", color: "text-orange-400" },
];

export function ChatPanel() {
  const { chatMessages, chatChannel, addChatMessage, setChatChannel } = useGameStore();
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const [showChannels, setShowChannels] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(getSocket());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const tryGetSocket = () => {
      const s = getSocket();
      if (s) {
        setSocket(s);
        return;
      }
      if (!cancelled) setTimeout(tryGetSocket, 300);
    };
    tryGetSocket();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: any) => addChatMessage(msg);
    socket.on("chat:message", handler);
    return () => { socket.off("chat:message", handler); };
  }, [socket, addChatMessage]);

  useEffect(() => {
    if (!socket) return;
    socket.emit("chat:join", chatChannel);
  }, [socket, chatChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = () => {
    if (!message.trim() || !socket) return;
    socket.emit("chat:message", { channel: chatChannel, message: message.trim() });
    setMessage("");
  };

  const activeChannel = channels.find((c) => c.id === chatChannel);

  return (
    <div className="w-80 bg-dark-900/90 backdrop-blur-md border-l border-dark-700 flex flex-col">
      <div className="h-10 border-b border-dark-700 flex items-center px-3 gap-2">
        <button
          onClick={() => setShowChannels(!showChannels)}
          className={`text-xs font-medium px-2 py-1 rounded ${activeChannel?.color} bg-dark-800/50`}
        >
          {activeChannel?.label}
        </button>
        {showChannels && (
          <div className="absolute bottom-12 right-2 bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => { setChatChannel(ch.id); setShowChannels(false); }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-dark-700 ${ch.color} ${chatChannel === ch.id ? "bg-dark-700" : ""}`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500">({chatMessages.length})</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {chatMessages.map((msg, i) => (
          <div key={i} className="text-xs leading-relaxed">
            <span className={`font-medium ${msg.userId === user?.id ? "text-purple-400" : "text-blue-400"}`}>
              {msg.username}
            </span>
            <span className="text-gray-400">: </span>
            <span className="text-gray-300">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-2 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
          />
          <button onClick={sendMessage} className="p-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
