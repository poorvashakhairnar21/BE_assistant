"use client"

import { useEffect } from "react"
import ChatUI from "@/components/chat-ui"
import { initDB } from "@/utils/indexedDB"

export default function Home() {
  useEffect(() => {
    initDB()
  }, [])

  return <ChatUI />
}