"use client";

import { useState, useEffect, useRef } from "react";
import {
  Moon,
  Sun,
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Send,
  Edit2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import  useDarkMode  from "@/components/ui/useDarkMode";
import {
  login,
  signup,
  getChats,
  updateChats,
  validateToken,
} from "@/utils/api";
import {
 getAiResponse
} from "@/utils/client_api"
import { Login } from "@/components/auth/Login";
import { Signup } from "@/components/auth/Signup";

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
  const [loading, setLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<window.speechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const transcriptRef = useRef("");
  const forceStopRecognitionRef = useRef(false)
  const currentChatRef = useRef<Chat | null>(null);
  const [theme, setTheme] = useDarkMode();


  // login , signup , and logout handles......................................................................

  const handleLogin = async (email: string, password: string) => {
    try {
      localStorage.clear();
      const token = await login(email, password);
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      setUser(email);
      loadUserChats();
    } catch (error) {
      throw error;
    }
  };

  const handleSignup = async (email: string,token: string) => {
    try {
      // const token = await signup(email, password);
      localStorage.clear();
      localStorage.setItem("token", token);
      localStorage.setItem("userEmail", email);
      setUser(email);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
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
  
            // Load chats from localStorage if they exist
            const savedChats = localStorage.getItem("chats");
            if (savedChats) {
              setChats(JSON.parse(savedChats));
            } else {
              loadUserChats();
            }
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
      setLoading(false);
    };
  
    checkAuth();
  }, []);
  
  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("currentChatId", currentChat.id.toString());
    }
  }, [currentChat]);
  
  useEffect(() => {
    const lastChatId = localStorage.getItem("currentChatId");
    if (lastChatId) {
      const chat = chats.find((chat) => chat.id === parseInt(lastChatId, 10));
      if (chat) {
        setCurrentChat(chat);
      }
    }
  }, [chats]);
  

  // chats handling section..........................................................................

  const loadUserChats = async () => {
    try {
      const userChats = await getChats();
      setChats(userChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
  };

  const createNewChat = () => {
    forceStopRecognition()
    const newChat: Chat = {
      id: Date.now(),
      title: `New Chat ${chats.length + 1}`,
      messages: [],
    };
    setCurrentChat(newChat);
    setChats([newChat, ...chats]);
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
      setChats(
        chats.map((chat) =>
          chat.id === isEditing ? { ...chat, title: editTitle } : chat
        )
      );
      setIsEditing(null);
    }
  };

  const deleteChat = (chatId: number) => {
    setChats(chats.filter((chat) => chat.id !== chatId));
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null);
      forceStopRecognition()
    }
  };

  useEffect(() => {
    if (user) {
      updateChats(chats);
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);
  

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);
  
  // speech synthesis, text to speech section.............................................................

  const speakText = (text) => {
    if (!text.trim()) return;
    
    utteranceRef.current.text = text;
    utteranceRef.current.rate = 1;
    utteranceRef.current.pitch = 1;
    
    synthRef.current.speak(utteranceRef.current);
    console.log("start speaking.........")
  };

  const stopSpeakingText = () => {
      synthRef.current.cancel();
      setIsSpeaking(false)
      if (forceStopRecognitionRef.current) {
        forceStopRecognitionRef.current = false;
        console.log("stop speaking force.........")
      }
  };
  
  useEffect(()=>{
    synthRef.current = window.speechSynthesis;
    utteranceRef.current = new SpeechSynthesisUtterance();

    utteranceRef.current.onend = () => {
      setIsSpeaking(false)
      setTimeout(() => { // Add 500ms buffer
        if (forceStopRecognitionRef.current) {
          forceStopRecognitionRef.current = false;
          console.log("stop speaking force.........")
        } else {
          console.log("stop speaking.........")
          startListening();
        }
      }, 500);
      
    };
    utteranceRef.current.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };
    return () => {
      if (synthRef.current?.speaking) synthRef.current.cancel();
    };
  },[])

  // send massage section .......................................................................................

  const sendMessage = async (finalMessage = inputMessage,isToSpeak=false) => {
    if (!finalMessage || finalMessage.trim() === "") return;
  
    let targetChat = currentChatRef.current;

    // Create a new chat if none exists
    if (!targetChat) {
      const newChat: Chat = {
        id: Date.now(),
        title: `New Chat ${chats.length + 1}`,
        messages: [],
      };
      setChats((prevChats) => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      currentChatRef.current = newChat; // update the ref as well
      targetChat = newChat;
    }

    const userMessage: Message = {
      id: Date.now(),
      content: finalMessage,
      sender: "user",
    };
  
    // Update the chat with the user's message
    const updatedChat = {
      ...targetChat,
      messages: [...targetChat.messages, userMessage],
    };
  
    setChats((prevChats) => {
      const chatExists = prevChats.some((chat) => chat.id === targetChat.id);
      if (chatExists) {
        return prevChats.map((chat) =>
          chat.id === targetChat.id ? updatedChat : chat
        );
      } else {
        return [updatedChat, ...prevChats];
      }
    });
    setCurrentChat(updatedChat);

    try{
      const reply = await getAiResponse(finalMessage)

      const aiMessage: Message = {
        id: Date.now(),
        content: reply,
        sender: "ai",
      };
  
      // Add AI response to the chat
      const chatWithAiResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      };
  
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === targetChat.id ? chatWithAiResponse : chat
        )
      );
      setCurrentChat(chatWithAiResponse);
  
      if(isToSpeak){
        speakText(reply)
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      // Rollback the user message on error
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === targetChat.id
            ? {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== userMessage.id),
              }
            : chat
        )
      );
      setCurrentChat((prevChat) =>
        prevChat && prevChat.id === targetChat.id
          ? {
              ...prevChat,
              messages: prevChat.messages.filter((msg) => msg.id !== userMessage.id),
            }
          : prevChat
      );
    } finally {
      setInputMessage("");
      transcriptRef.current = "";
    }
  };

  //speech recongnition section..............................................................................

  const startListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        console.log("start startListening...........");
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    if (!("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition");
      return;
    }
  
    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = true;
    recognitionRef.current.continuous = true;
  
    let pauseTimeoutId: ReturnType<typeof setTimeout>;
    let stopTimeoutId: ReturnType<typeof setTimeout>;
  
    recognitionRef.current.onresult = (event) => {
      if (pauseTimeoutId) clearTimeout(pauseTimeoutId);
      if (stopTimeoutId) clearTimeout(stopTimeoutId);
  
      transcriptRef.current = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");

      setInputMessage(transcriptRef.current)

      pauseTimeoutId = setTimeout(() => {
        if (transcriptRef.current) {
          setIsSpeaking(true);
          stopListening();
          sendMessage(transcriptRef.current,true);
          // setInputMessage("");
        }
      }, 1000);
  
      stopTimeoutId = setTimeout(() => {
        stopListening();
      }, 30000);
    };
    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log("stop listining...");
    };
    return () => {
      if (pauseTimeoutId) clearTimeout(pauseTimeoutId);
      if (stopTimeoutId) clearTimeout(stopTimeoutId);
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);  

  // other updates...................................................................
  const forceStopRecognition = () =>{
    forceStopRecognitionRef.current = true;
    stopListening();
    stopSpeakingText();
  }

  const forceStartRecognition = () => {
    if (!isListening && !isSpeaking) startListening();
  };

  if (loading) {
    return <div></div>;
  }

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-70 border-r bg-card flex flex-col">
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
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg">
              {theme === "dark" ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-gray-700" />}
            </button>
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white">
              {user.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <ScrollArea className="flex-1 px-2">
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-4">
            {currentChat ? (
              currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      message.sender === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
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
        </ScrollArea>
        
        {/* Chat Input */}
        <div className="p-4 border-t transition-all duration-500 ease-in-out">
          <div className="flex space-x-2 max-w-3xl mx-auto transition-all duration-500 ease-in-out">
            <Input
              placeholder={
                isListening
                  ? "Listening......."
                  : isSpeaking
                  ? "responding........."
                  : "Type your message here......"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className={`flex-1 ${
                isListening || isSpeaking ? "cursor-not-allowed" : ""
                }`}
              readOnly={(isListening || isSpeaking)}
            />
            {!isListening && !isSpeaking && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => sendMessage()}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
            {(isListening || isSpeaking) && (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  forceStopRecognition();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {(isListening || isSpeaking) && (
              <div>
                <img className="h-10 w-20" src="/voice-line.gif" alt="voice line GIF" />
              </div>
            )}
            {!isListening && !isSpeaking && (
              <div className="h-10 w-20">
                <button
                  onClick={() => {
                    forceStartRecognition();
                  }}
                >
                  <img src="./voice-ai.png" className="h-10 w-10 bg-transparent" alt="voice ai" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}