import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import contactRoutes from "./routes/contact.js"
import newsletterRoutes from "./routes/newsletter.js"
import bookingRoutes from "./routes/booking.js"
import { securityMiddleware } from "./middleware/security.js"
import testRoutes from "./routes/test.js"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS configuration
const corsOptions = {
  origin: [
    "https://commercialcoding.com",
    "https://www.commercialcoding.com",
    // Include development URLs if needed
    "http://localhost:3000",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 hours
}

// Apply CORS with specific options
app.use(cors(corsOptions))

// Apply security middleware
app.use(securityMiddleware)

// Other middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api", contactRoutes)
app.use("/api", newsletterRoutes)
app.use("/api", bookingRoutes)
app.use("/api", testRoutes)

// Root route
app.get("/", (req, res) => {
  res.send("Commercial Coding API is running")
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

