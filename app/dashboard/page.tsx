"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Loader2, Edit2, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import ChatInterface from "@/components/chat-interface";
import SearchDialog from "@/components/search-dialog";
import EditChatDialog from "@/components/edit-chat-dialog";
import DeleteChatDialog from "@/components/delete-chat-dialog";

interface Chat {
  id: string;
  name: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  fullName: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creatingChat, setCreatingChat] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentChatName, setCurrentChatName] = useState("");
  const router = useRouter();

  // Fetch user and chats on component mount
  useEffect(() => {
    const fetchUserAndChats = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const userResponse = await fetch("/api/auth/me");

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user profile");
        }

        const userData = await userResponse.json();
        setUser(userData);

        // Fetch chats
        const chatsResponse = await fetch("/api/chats");

        if (!chatsResponse.ok) {
          throw new Error("Failed to fetch chats");
        }

        const chatsData = await chatsResponse.json();
        setChats(chatsData);

        // Select the first chat if available
        if (chatsData.length > 0) {
          setSelectedChat(chatsData[0].id);
          setCurrentChatName(chatsData[0].name);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndChats();
  }, [router]);

  const createNewChat = async () => {
    setCreatingChat(true);
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "New Chat" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create chat");
      }

      const newChat = await response.json();
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat.id);
      setCurrentChatName(newChat.name);
    } catch (err) {
      setError("Failed to create new chat");
    } finally {
      setCreatingChat(false);
    }
  };

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setSelectedChat(chatId);
      setCurrentChatName(chat.name);
    }
  };

  const handleChatUpdated = () => {
    // Refresh chats list
    fetch("/api/chats")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch chats");
        return response.json();
      })
      .then((data) => {
        setChats(data);
        // Update current chat name if it's the selected chat
        const updatedChat = data.find((c: Chat) => c.id === selectedChat);
        if (updatedChat) {
          setCurrentChatName(updatedChat.name);
        }
      })
      .catch((err) => {
        console.error("Error refreshing chats:", err);
      });
  };

  const handleChatDeleted = () => {
    setSelectedChat(null);
    // Refresh chats list
    fetch("/api/chats")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch chats");
        return response.json();
      })
      .then((data) => {
        setChats(data);
        // Select the first chat if available
        if (data.length > 0) {
          setSelectedChat(data[0].id);
          setCurrentChatName(data[0].name);
        }
      })
      .catch((err) => {
        console.error("Error refreshing chats:", err);
      });
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size={40} className="mx-auto border-purple-600" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h1 className="text-lg font-semibold">VU Assistant</h1>
          <Button
            size="sm"
            onClick={createNewChat}
            disabled={creatingChat}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {creatingChat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setSearchDialogOpen(true)}
          >
            <div className="flex items-center">
              <Search className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-gray-500">Search chats...</span>
            </div>
          </Button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-200">
          {user && (
            <div className="text-sm">
              <p className="font-medium">{user.fullName}</p>
              <p className="text-gray-500 truncate">{user.email}</p>
            </div>
          )}
        </div>

        {/* Chat list */}
        <div className="flex-grow overflow-y-auto">
          {error && <p className="text-red-500 p-4">{error}</p>}

          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No chats yet. Create your first chat!
            </div>
          ) : (
            <ul className="p-2">
              {chats.map((chat) => (
                <li key={chat.id} className="mb-1">
                  <button
                    className={`w-full text-left py-2 px-3 rounded ${
                      selectedChat === chat.id
                        ? "bg-purple-100 text-purple-800"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={() => handleSelectChat(chat.id)}
                  >
                    <div className="truncate">{chat.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(chat.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User controls */}
        <div className="p-4 border-t border-gray-200">
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="font-medium">{currentChatName}</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Rename
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface chatId={selectedChat} />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Card className="w-96">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">
                    Welcome to Victoria University Assistant
                  </h2>
                  <p className="text-gray-500 mb-4">
                    Select a chat or create a new one to get started.
                  </p>
                  <Button
                    onClick={createNewChat}
                    disabled={creatingChat}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {creatingChat ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    New Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <SearchDialog
        open={searchDialogOpen}
        onOpenChange={setSearchDialogOpen}
        onSelectResult={(chatId) => {
          handleSelectChat(chatId);
        }}
      />

      {selectedChat && (
        <>
          <EditChatDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            chatId={selectedChat}
            initialName={currentChatName}
            onChatUpdated={handleChatUpdated}
          />

          <DeleteChatDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            chatId={selectedChat}
            chatName={currentChatName}
            onChatDeleted={handleChatDeleted}
          />
        </>
      )}
    </div>
  );
}
