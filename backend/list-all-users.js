import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function listUsers() {
    await mongoose.connect(process.env.MONGODB_URI)
    const users = await User.find({})
    console.log(JSON.stringify(users.map(u => ({ id: u._id, name: u.name, email: u.email, provider: u.provider })), null, 2))
    process.exit(0)
}

listUsers().catch(console.error)
