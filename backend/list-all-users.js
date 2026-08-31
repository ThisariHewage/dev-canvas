import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function listUsers() {
    await mongoose.connect(process.env.MONGODB_URI)
    const users = await User.find({ provider: 'asgardeo' })
    console.log(JSON.stringify(users.map(u => ({
        id: u._id.toString(),
        asgardeoId: u.asgardeoId,
        name: u.name,
        email: u.email,
        username: u.email ? u.email.split('@')[0] : 'N/A',
        role: u.role,
        contactNumber: u.contactNumber || 'Not provided in Asgardeo'
    })), null, 2))
    process.exit(0)
}

listUsers().catch(console.error)
