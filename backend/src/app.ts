import express from "express"
import authRoutes from "./routes/authRoutes"
import chatRoutes from "./routes/chatRoutes"
import messageRoutes from "./routes/messageRoutes"
import userRoutes from "./routes/userRoutes"
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express"
import { errorHandler } from "./middleware/errorHandler"
import path  from "path"
import cors from "cors";

const app = express()
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));
const PORT = process.env.PORT || 3000
app.use(express.json())



app.use(clerkMiddleware())
app.get("/health", (req,res)=>{
    res.json({status:"ok", message:"Server is running "})
})




app.get('/protected', async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { isAuthenticated, userId } = getAuth(req)

  if (!isAuthenticated) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // Use the `getUser()` method to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  res.json({ user })
})


app.use("/api/auth", authRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/messages", messageRoutes)
app.use("/api/users", userRoutes)


app.use(errorHandler)


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../web/dist")));

  app.get("/{*any}", (_, res) => {
    res.sendFile(path.join(__dirname, "../../web/dist/index.html"));
  });
}

export default app