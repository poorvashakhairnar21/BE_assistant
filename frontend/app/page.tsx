"use client"

import { useEffect } from "react"
import Main from "@/components/Main"
import { initDB } from "@/utils/indexedDB"

export default function Home() {
  useEffect(() => {
    initDB()
  }, [])

  return <Main />
}