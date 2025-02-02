"use client"

import { useEffect } from "react"
import Main from "@/components/main"
import { initDB } from "@/utils/indexedDB"

export default function Home() {
  useEffect(() => {
    initDB()
  }, [])

  return <Main />
}