"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const generateRoom = () => {
    const name = generateRoomId(); // ← Only called after button click
    router.push(`/room/${name}`);
  };

  const generateRoomId = () => {
    const animals = ["fox", "lion", "tiger", "zebra", "cat"];
    const moods = ["happy", "lazy", "cool", "angry", "kind"];
    const number = Math.floor(Math.random() * 100);
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const mood = moods[Math.floor(Math.random() * moods.length)];
    return `${mood}-${animal}-${number}`;
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🚪 Zero-Identity Chat</h1>
      <button
        onClick={generateRoom}
        className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
      >
        Create a Room
      </button>
    </main>
  );
}
