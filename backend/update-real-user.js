import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function updateRealAsgardeoUser() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB.')

    const result = await User.updateMany(
        {},
        {
            $set: {
                contactNumber: '+94 77 123 4567'
            }
        }
    )
    console.log(`Updated ${result.modifiedCount} user(s) with contactNumber '+94 77 123 4567'.`)
    process.exit(0)
}

updateRealAsgardeoUser().catch(err => {
    console.error(err)
    process.exit(1)
})
