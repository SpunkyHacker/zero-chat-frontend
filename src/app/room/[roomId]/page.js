"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "@/lib/socket";

export default function RoomPage() {
  const { roomId } = useParams();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userCount, setUserCount] = useState(1);
  const [expired, setExpired] = useState(false);
  const [timer, setTimer] = useState(null);
  const [lastSent, setLastSent] = useState(0);

  const timerRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    socket.connect();
    socket.emit("join-room", roomId);

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("user-count", (count) => {
      setUserCount(count);

      if (count === 0 && !timerRef.current) {
        setTimer(300);
        timerRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              timerRef.current = null;
              setExpired(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else if (count > 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        setExpired(false);
        setTimer(null);
      }
    });

    return () => {
      socket.disconnect();
      clearInterval(timerRef.current);
    };
  }, [roomId, isClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const now = Date.now();
    if (now - lastSent < 333) return; // rate limit: 3 messages/sec
    if (text.trim()) {
      socket.emit("message", { roomId, text });
      setText("");
      setLastSent(now);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString();
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isClient) return null;

  if (expired) {
    return (
      <div className="h-screen bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl mb-4">💨 Room vanished.</h1>
        <button
          onClick={() => router.push("/")}
          className="bg-white text-black px-4 py-2 rounded"
        >
          Create new one?
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="bg-[#1a1a1a] px-4 py-2 text-sm flex justify-between">
        <span>🧑 {userCount} anon{userCount !== 1 ? "s" : ""} here</span>
        {timer !== null && <span>⏳ Expires in {formatTime(timer)}</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className="bg-[#2c2c2c] text-white px-3 py-2 rounded max-w-sm"
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#1a1a1a] border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 rounded-xl bg-[#2c2c2c] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
