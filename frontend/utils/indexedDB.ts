import { openDB, type IDBPDatabase } from "idb"

interface Chat {
  id: number
  title: string
  messages: Message[]
}

interface Message {
  id: number
  content: string
  sender: "user" | "ai"
}

interface User {
  email: string
  chats: Chat[]
}

let db: IDBPDatabase | null = null

export async function initDB() {
  db = await openDB("ChatApp", 1, {
    upgrade(db) {
      db.createObjectStore("users", { keyPath: "email" })
    },
  })
}

export async function getUser(email: string): Promise<User | undefined> {
  if (!db) await initDB()
  return db?.get("users", email)
}

export async function saveUser(user: User) {
  if (!db) await initDB()
  await db?.put("users", user)
}

export async function updateUserChats(email: string, chats: Chat[]) {
  if (!db) await initDB()
  const user = await getUser(email)
  if (user) {
    user.chats = chats
    await saveUser(user)
  }
}

