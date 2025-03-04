"use client"

import 'regenerator-runtime/runtime';
import { useState, useEffect, useRef, useCallback } from "react"
import { Moon, Sun, Plus, MessageSquare, Trash2, Settings, Send, Edit2, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import useDarkMode from "@/components/ui/useDarkMode"
import { login, getChats, updateChats, validateToken } from "@/utils/api"
import { getAiResponse } from "@/utils/client_api"
import { Login } from "@/components/auth/Login"
import { Signup } from "@/components/auth/Signup"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import { useSpeechSynthesis } from "react-speech-kit"

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
}

interface Chat {
  id: number
  title: string
  messages: Message[]
}

export default function Main() {
  const [user, setUser] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChat, setCurrentChat] = useState<Chat | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showLogin, setShowLogin] = useState(true)
  const [loading, setLoading] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const forceStopRecognitionRef = useRef(false)
  const currentChatRef = useRef<Chat | null>(null)
  const [theme, setTheme] = useDarkMode()
  const stopTimeoutIdRef = useRef<NodeJS.Timeout | null>(null)

  // Speech recognition setup with react-speech-recognition
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  // Speech synthesis setup with react-speech-kit
  const { voices, cancel, speaking } = useSpeechSynthesis()

  // login , signup , and logout handles......................................................................

  const handleLogin = async (email: string, password: string) => {
    try {
      localStorage.clear()
      const token = await login(email, password)
      localStorage.setItem("token", token)
      localStorage.setItem("userEmail", email)
      setUser(email)
      loadUserChats()
    } catch (error) {
      throw error
    }
  }

  const handleSignup = async (email: string, token: string) => {
    try {
      // const token = await signup(email, password);
      localStorage.clear()
      localStorage.setItem("token", token)
      localStorage.setItem("userEmail", email)
      setUser(email)
    } catch (error) {
      throw error
    }
  }

  const handleLogout = useCallback(() => {
    localStorage.clear()
    localStorage.removeItem("token")
    localStorage.removeItem("userEmail")
    setUser(null)
    setChats([])
    setCurrentChat(null)
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      const storedUser = localStorage.getItem("userEmail")

      if (token && storedUser) {
        try {
          const isValid = await validateToken()
          if (isValid) {
            setUser(storedUser)

            // Load chats from localStorage if they exist
            const savedChats = localStorage.getItem("chats")
            if (savedChats) {
              setChats(JSON.parse(savedChats))
            } else {
              loadUserChats()
            }
          } else {
            handleLogout()
          }
        } catch (error) {
          console.error("Token validation failed:", error)
          handleLogout()
        }
      } else {
        handleLogout()
      }
      setLoading(false)
    }

    checkAuth()
  }, [handleLogout])

  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("currentChatId", currentChat.id.toString())
    }
  }, [currentChat])

  useEffect(() => {
    const lastChatId = localStorage.getItem("currentChatId")
    if (lastChatId) {
      const chat = chats.find((chat) => chat.id === Number.parseInt(lastChatId, 10))
      if (chat) {
        setCurrentChat(chat)
      }
    }
  }, [chats])

  // chats handling section..........................................................................

  const loadUserChats = async () => {
    try {
      const userChats = await getChats()
      setChats(userChats)
    } catch (error) {
      console.error("Failed to load chats:", error)
    }
  }

  const createNewChat = () => {
    forceStopRecognition()
    const newChat: Chat = {
      id: Date.now(),
      title: `New Chat ${chats.length + 1}`,
      messages: [],
    }
    setCurrentChat(newChat)
    setChats([newChat, ...chats])
  }

  const handleRenameChat = (chatId: number) => {
    setIsEditing(chatId)
    const chatToEdit = chats.find((chat) => chat.id === chatId)
    if (chatToEdit) {
      setEditTitle(chatToEdit.title)
    }
  }

  const saveRenamedChat = () => {
    if (isEditing) {
      setChats(chats.map((chat) => (chat.id === isEditing ? { ...chat, title: editTitle } : chat)))
      setIsEditing(null)
    }
  }

  const deleteChat = (chatId: number) => {
    setChats(chats.filter((chat) => chat.id !== chatId))
    if (currentChat && currentChat.id === chatId) {
      setCurrentChat(null)
      forceStopRecognition()
    }
  }

  useEffect(() => {
    if (user) {
      updateChats(chats)
      localStorage.setItem("chats", JSON.stringify(chats))
    }
  }, [chats, user])

  useEffect(() => {
    currentChatRef.current = currentChat
  }, [currentChat])

  // speech synthesis, text to speech section.............................................................

  const handleSpeechEnd = () => {
    console.log("Speech ended.");
    setIsSpeaking(false);
  
    setTimeout(() => {
      if (forceStopRecognitionRef.current) {
        forceStopRecognitionRef.current = false;
        console.log("Stop speaking forcefully...");
      } else {
        console.log("Stop speaking...");
        startListening(); // Ensure this function exists
      }
    }, 500);
  };
  
  const speakText = (text: string) => {
    if (!text.trim()) return;

    console.log("Start speaking...");
    setIsSpeaking(true);

    // Create a SpeechSynthesisUtterance instance for better event handling
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voices[0]; // Select voice dynamically if needed
    utterance.rate = 1; // Adjust speed
    utterance.pitch = 1; // Adjust pitch
    utterance.onend = handleSpeechEnd;
    utterance.onerror = (e) => console.error("Speech Error:", e);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeakingText = () => {
    cancel()
    setIsSpeaking(false)
    if (forceStopRecognitionRef.current) {
      forceStopRecognitionRef.current = false
      console.log("stop speaking force.........")
    }
  }

  // send massage section .......................................................................................

  const sendMessage = async (finalMessage = inputMessage, isToSpeak = false) => {
    if (!finalMessage || finalMessage.trim() === "") return

    let targetChat = currentChatRef.current

    // Create a new chat if none exists
    if (!targetChat) {
      const newChat: Chat = {
        id: Date.now(),
        title: `New Chat ${chats.length + 1}`,
        messages: [],
      }
      setChats((prevChats) => [newChat, ...prevChats])
      setCurrentChat(newChat)
      currentChatRef.current = newChat // update the ref as well
      targetChat = newChat
    }

    const userMessage: Message = {
      id: Date.now(),
      content: finalMessage,
      sender: "user",
    }

    // Update the chat with the user's message
    const updatedChat = {
      ...targetChat,
      messages: [...targetChat.messages, userMessage],
    }

    setChats((prevChats) => {
      const chatExists = prevChats.some((chat) => chat.id === targetChat.id)
      if (chatExists) {
        return prevChats.map((chat) => (chat.id === targetChat.id ? updatedChat : chat))
      } else {
        return [updatedChat, ...prevChats]
      }
    })
    setCurrentChat(updatedChat)

    try {
      const reply = await getAiResponse(finalMessage)

      const aiMessage: Message = {
        id: Date.now(),
        content: reply,
        sender: "ai",
      }

      // Add AI response to the chat
      const chatWithAiResponse = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiMessage],
      }

      setChats((prevChats) => prevChats.map((chat) => (chat.id === targetChat.id ? chatWithAiResponse : chat)))
      setCurrentChat(chatWithAiResponse)

      if (isToSpeak) {
        speakText(reply)
      }
    } catch (error) {
      console.error("Error fetching AI response:", error)
      // Rollback the user message on error
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === targetChat.id
            ? {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== userMessage.id),
              }
            : chat,
        ),
      )
      setCurrentChat((prevChat) =>
        prevChat && prevChat.id === targetChat.id
          ? {
              ...prevChat,
              messages: prevChat.messages.filter((msg) => msg.id !== userMessage.id),
            }
          : prevChat,
      )
    } finally {
      setInputMessage("")
      resetTranscript()
    }
  }

  //speech recognition section..............................................................................

  const startListening = () => {
    console.log(listening, isSpeaking)
    // if (!listening && !isSpeaking && browserSupportsSpeechRecognition) 
    if (!isSpeaking && browserSupportsSpeechRecognition) {
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true })
      console.log("start listening...........")
    } else if (!browserSupportsSpeechRecognition) {
      console.error("Speech recognition not supported in this browser")
    }
  }

  const stopListening = () => {
    if (listening) {
      SpeechRecognition.stopListening()
      console.log("stop listening...........")
    }
  }

  // Update input message when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript)
    }
  }, [transcript])

  // Auto-send message after a pause in speech
  useEffect(() => {
    let pauseTimeoutId: NodeJS.Timeout
  
    if (listening && transcript) {
      pauseTimeoutId = setTimeout(() => {
        if (transcript.trim()) {
          stopListening()
          sendMessage(transcript, true)
        }
      }, 2000) // 2 second pause triggers send
  
      if (!stopTimeoutIdRef.current) {
        stopTimeoutIdRef.current = setTimeout(() => {
          stopListening()
          stopTimeoutIdRef.current = null
        }, 30000) // 30 second max listening time
      }
    }
  
    return () => {
      clearTimeout(pauseTimeoutId)
    }
  }, [transcript, listening])


  // other updates...................................................................
  const forceStopRecognition = () => {
    forceStopRecognitionRef.current = true
    stopListening()
    stopSpeakingText()
  }

  const forceStartRecognition = () => {
    if (!listening && !isSpeaking) startListening()
  }

  // Check for browser support
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      console.error("Your browser does not support Speech Recognition")
    }
  }, [browserSupportsSpeechRecognition])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (currentChat?.messages.length) {
      scrollToBottom()
    }
  }, [currentChat, currentChat?.messages.length]) // Added currentChat as a dependency

  if (loading) {
    return <div></div>
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-lg">
          {showLogin ? (
            <Login onLogin={handleLogin} onSwitchToSignup={() => setShowLogin(false)} />
          ) : (
            <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-70 border-r bg-card flex flex-col">
        {/* New Chat Button */}
        <div className="p-4">
          <Button className="w-full justify-start gap-2" variant="outline" onClick={createNewChat}>
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
                  className={`w-full justify-start gap-2 h-auto py-3 px-3 font-normal hover:bg-muted ${
                    currentChat?.id === chat.id ? "bg-muted" : ""
                  }`}
                  onClick={() => setCurrentChat(chat)}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  {isEditing === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={saveRenamedChat}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") saveRenamedChat()
                      }}
                      className="w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-start gap-1 overflow-hidden">
                      <div className="w-full truncate text-sm">{chat.title}</div>
                      <div className="w-full truncate text-xs text-muted-foreground">
                        {chat.messages[chat.messages.length - 1]?.content.substring(0, 30) || "No messages yet"}
                      </div>
                    </div>
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRenameChat(chat.id)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteChat(chat.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="p-4 border-t space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{currentChat ? currentChat.title : "New Chat"}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg">
              {theme === "dark" ? (
                <Sun className="w-6 h-6 text-yellow-500" />
              ) : (
                <Moon className="w-6 h-6 text-gray-700" />
              )}
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
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md p-3 rounded-lg ${
                        message.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-800"
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
              <div ref={messagesEndRef} />
            </div>
          </main>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 border-t transition-all duration-500 ease-in-out">
          <div className="flex space-x-2 max-w-3xl mx-auto transition-all duration-500 ease-in-out">
            <Input
              placeholder={
                listening
                  ? "Listening......."
                  : isSpeaking || speaking
                  ? "responding........."
                  : "Type your message here......"
              }
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage()
                }
              }}
              className={`flex-1 ${listening || isSpeaking || speaking ? "cursor-not-allowed" : ""}`}
              readOnly={listening || isSpeaking || speaking}
            />
            {!listening && !isSpeaking && !speaking && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => sendMessage()}>
                <Send className="h-4 w-4" />
              </Button>
            )}
            {(listening || isSpeaking || speaking) && (
              <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={() => forceStopRecognition()}>
                <X className="h-4 w-4" />
              </Button>
            )}
            {(listening || isSpeaking || speaking) && (
              <div>
                <img className="h-10 w-20" src="/voice-line.gif" alt="voice line GIF" />
              </div>
            )}
            {!listening && !isSpeaking && !speaking && (
              <div className="h-10 w-20">
                <button
                  onClick={() => forceStartRecognition()}
                  disabled={!browserSupportsSpeechRecognition}
                  className={!browserSupportsSpeechRecognition ? "opacity-50 cursor-not-allowed" : ""}
                >
                  <img src="./voice-ai.png" className="h-10 w-10 bg-transparent" alt="voice ai" />
                </button>
              </div>
            )}
          </div>
          {!browserSupportsSpeechRecognition && (
            <p className="text-xs text-center mt-2 text-red-500">Speech recognition is not supported in your browser</p>
          )}
        </div>
      </div>
    </div>
  )
}
