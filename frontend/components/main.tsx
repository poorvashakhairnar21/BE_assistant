"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Lock,
  HelpCircle,
  Moon,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  FolderPlus,
  Send,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { login, signup, getChats, updateChats, validateToken } from "@/utils/api"; 
import { Login } from "@/components/auth/Login";
import { Signup } from "@/components/auth/Signup";
import { OceanWaves } from "@/components/OceanWaves.tsx";

interface Message {
  id: number;
  content: string;
  sender: "user" | "ai";
}

interface Chat {
  id: number;
  title: string;
  messages: Message[];
}

export default function Main() {
  const [user, setUser] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(true); // Add loading state
  const [voiceAi,setVoiceAi]=useState(true);
  
  const handleLogin = async (email: string, password: string) => {
    try {
      const token = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      setUser(email);
      loadUserChats();
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (email: string, password: string) => {
    try {
      const token = await signup(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      setUser(email);
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
    setChats([]);
    setCurrentChat(null);
  };
  
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("userEmail");

      if (token && storedUser) {
        try {
          const isValid = await validateToken(token);
          if (isValid) {
            setUser(storedUser);
            loadUserChats();
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
      setLoading(false); // Stop loading once the auth check is complete
    };
    checkAuth();
  }, []);

  const loadUserChats = async () => {
    try {
      const userChats = await getChats();
      setChats(userChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  useEffect(() => {
    if (user) {
      updateChats(chats);
    }
  }, [user, chats]);

  if (loading) {
    // Show a loading indicator or nothing until auth check is complete
    return <div></div>;
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now(),
      title: `New Chat ${chats.length + 1}`,
      messages: [],
    };
    setChats([newChat, ...chats]);
    setCurrentChat(newChat);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentChat) return;
  
    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      sender: "user",
    };
  
    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, userMessage],
    };
  
    setChats(chats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat)));
    setCurrentChat(updatedChat);
    setInputMessage("");
  
    try {
      const response = await fetch("http://localhost:3002/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      });
  
      if (!response.ok) throw new Error("Failed to fetch AI response");
  
      const data = await response.json();
  
      const aiMessage: Message = {
        id: Date.now(),
        content: data.reply,
        sender: "ai",
      };
  
      const chatWithAiResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      };
  
      setChats(chats.map((chat) => (chat.id === currentChat.id ? chatWithAiResponse : chat)));
      setCurrentChat(chatWithAiResponse);
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };  

  const handleRenameChat = (chatId: number) => {
    setIsEditing(chatId);
    const chatToEdit = chats.find((chat) => chat.id === chatId);
    if (chatToEdit) {
      setEditTitle(chatToEdit.title);
    }
  };

  const saveRenamedChat = () => {
    if (isEditing) {
      setChats(chats.map((chat) => (chat.id === isEditing ? { ...chat, title: editTitle } : chat)));
      setIsEditing(null);
    }
  };

  const deleteChat = (chatId: number) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null);
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
          {showLogin ? (
            <Login
              onLogin={handleLogin}
              onSwitchToSignup={() => setShowLogin(false)}
            />
          ) : (
            <Signup
              onSignup={handleSignup}
              onSwitchToLogin={() => setShowLogin(true)}
            />
          )}
        </div>
      </div>
    );
  }

  if(voiceAi){
    return (
      <OceanWaves />
  )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            className="w-full justify-start gap-2"
            variant="outline"
            onClick={createNewChat}
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>
        </div>

        {/* Chat History */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-2 p-2">
            {chats.map((chat) => (
              <div key={chat.id} className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-auto py-3 px-3 font-normal hover:bg-muted"
                  onClick={() => setCurrentChat(chat)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {isEditing === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={saveRenamedChat}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") saveRenamedChat();
                      }}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-start gap-1 overflow-hidden">
                      <div className="w-full truncate text-sm">
                        {chat.title}
                      </div>
                      <div className="w-full truncate text-xs text-muted-foreground">
                        {chat.messages[
                          chat.messages.length - 1
                        ]?.content.substring(0, 30) || "No messages yet"}
                      </div>
                    </div>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRenameChat(chat.id)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteChat(chat.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <FolderPlus className="w-4 h-4" />
            Create folder
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => {
              setChats([]);
              setCurrentChat(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Clear conversations
          </Button>
          <Separator />
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">
              {currentChat ? currentChat.title : "New Chat"}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search messages"
                className="pl-8 w-64"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Lock className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Moon className="h-4 w-4" />
            </Button>
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
              {user.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {currentChat ? (
              currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${message.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"}`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a chat or start a new one
              </div>
            )}
          </div>
        </main>

        {/* Chat Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2 max-w-3xl mx-auto">
            <Input
              placeholder="Type your message here..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={sendMessage}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
