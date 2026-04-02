import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../../shared/components/Button";
import { getAccessToken } from "../../../app/storage";
import { getErrorMessage } from "../../../shared/utils/errors";
import {
  getChatRoomMessages,
  getChatRooms,
  sendRoomMessage,
  uploadChatAttachment,
} from "../api/student.api";
import type { ChatMessage, ChatRoom } from "../types/student";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function StudentChatPage() {
  const [searchParams] = useSearchParams();
  const initialContractId = searchParams.get("roomContract") || "";

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const hasShownConnectionErrorRef = useRef(false);

  const selectedRoom = useMemo(
    () => rooms.find((room) => room._id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const loadRooms = async () => {
    try {
      const response = await getChatRooms();
      setRooms(response);

      if (response.length === 0) {
        setSelectedRoomId("");
        setMessages([]);
        return;
      }

      const byContract = initialContractId
        ? response.find((room) => room.contractId?._id === initialContractId)
        : null;
      const target = byContract || response[0];
      setSelectedRoomId(target._id);
    } catch {
      toast.error("Unable to load chat rooms");
    }
  };

  const loadMessages = async (roomId: string) => {
    if (!roomId) return;
    try {
      const response = await getChatRoomMessages(roomId, 1, 50);
      setMessages(response.items.slice().reverse());
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load messages"));
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    loadMessages(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect_error", (error) => {
      if (hasShownConnectionErrorRef.current) return;
      hasShownConnectionErrorRef.current = true;
      toast.error(getErrorMessage(error, "Unable to connect to live chat"));
    });

    socket.on("receive_message", (message: ChatMessage) => {
      if (message.chatRoomId !== selectedRoomId) return;
      setMessages((prev) => {
        if (prev.some((item) => item._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on("user_typing", ({ roomId }: { roomId: string }) => {
      if (roomId === selectedRoomId) setTyping(true);
    });

    socket.on("user_stopped", ({ roomId }: { roomId: string }) => {
      if (roomId === selectedRoomId) setTyping(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedRoomId]);

  useEffect(() => {
    if (!socketRef.current || !selectedRoomId) return;

    socketRef.current.emit("join_room", { roomId: selectedRoomId });
  }, [selectedRoomId]);

  const emitTyping = () => {
    if (socketRef.current && selectedRoomId) {
      socketRef.current.emit("typing", { roomId: selectedRoomId });
    }
  };

  const emitStopTyping = () => {
    if (socketRef.current && selectedRoomId) {
      socketRef.current.emit("stop_typing", { roomId: selectedRoomId });
    }
  };

  const onSend = async () => {
    if (!selectedRoomId || !text.trim()) return;

    setSending(true);
    try {
      const created = await sendRoomMessage(selectedRoomId, { text: text.trim() });
      setMessages((prev) => {
        if (prev.some((item) => item._id === created._id)) return prev;
        return [...prev, created];
      });
      setText("");
      emitStopTyping();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send message"));
    } finally {
      setSending(false);
    }
  };

  const onUpload = async (file: File | null) => {
    if (!file || !selectedRoomId) return;

    setUploading(true);
    try {
      const { attachmentUrl } = await uploadChatAttachment(selectedRoomId, file);
      const created = await sendRoomMessage(selectedRoomId, { attachmentUrl });
      setMessages((prev) => {
        if (prev.some((item) => item._id === created._id)) return prev;
        return [...prev, created];
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to upload attachment"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid min-h-[75vh] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-secondary/70 bg-secondary/20 p-3">
        <h1 className="mb-3 font-heading text-xl font-semibold">Contract Chats</h1>
        <div className="grid gap-2">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => setSelectedRoomId(room._id)}
              className={`rounded-xl border px-3 py-2 text-left transition ${
                room._id === selectedRoomId
                  ? "border-accent bg-accent/15"
                  : "border-secondary/70 bg-black/10 hover:bg-white/10"
              }`}
            >
              <p className="text-sm font-semibold text-white">
                {room.contractId?.jobId?.title || "Contract Room"}
              </p>
              <p className="mt-1 text-xs text-text/60">Updated {new Date(room.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="flex flex-col rounded-2xl border border-secondary/70 bg-secondary/20">
        <header className="border-b border-secondary/70 px-4 py-3">
          <h2 className="font-heading text-lg font-semibold">
            {selectedRoom?.contractId?.jobId?.title || "Select a room"}
          </h2>
          {typing ? <p className="text-xs text-accent">Other user is typing...</p> : null}
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {messages.map((message) => (
            <article key={message._id} className="rounded-xl border border-secondary/60 bg-black/10 p-3">
              <p className="text-xs text-text/60">
                {message.senderId?.name || "User"} • {new Date(message.createdAt).toLocaleTimeString()}
              </p>
              {message.text ? <p className="mt-1 text-sm text-white">{message.text}</p> : null}
              {message.attachmentUrl ? (
                <a
                  className="mt-2 inline-block text-sm font-semibold text-accent"
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open attachment
                </a>
              ) : null}
            </article>
          ))}
        </div>

        <footer className="border-t border-secondary/70 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="h-11 flex-1 rounded-xl border border-secondary/80 bg-white/5 px-3 text-sm outline-none focus:border-accent"
              placeholder="Type your message..."
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                emitTyping();
              }}
              onBlur={emitStopTyping}
            />
            <div className="flex gap-2">
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-secondary/80 px-3 text-sm font-semibold hover:bg-white/10">
                Upload
                <input
                  type="file"
                  aria-label="Upload chat attachment"
                  className="hidden"
                  onChange={(e) => onUpload(e.target.files?.[0] || null)}
                />
              </label>
              <Button onClick={onSend} disabled={!selectedRoomId || !text.trim() || sending || uploading}>
                {sending ? "Sending..." : uploading ? "Uploading..." : "Send"}
              </Button>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
