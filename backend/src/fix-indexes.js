// One-time script to drop stale MongoDB indexes
// Run with: node src/fix-indexes.js
import 'dotenv/config'
import mongoose from 'mongoose'

async function fixIndexes() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    const collection = mongoose.connection.collection('users')

    // List current indexes
    const indexes = await collection.indexes()
    console.log('Current indexes:', JSON.stringify(indexes, null, 2))

    // Drop the old googleId index (non-sparse unique)
    try {
        await collection.dropIndex('googleId_1')
        console.log('Dropped old googleId_1 index')
    } catch (e) {
        console.log('googleId_1 index not found or already dropped:', e.message)
    }

    // The new sparse unique index will be auto-created by Mongoose when the app starts
    console.log('Done! Restart the app to recreate indexes with sparse:true.')
    process.exit(0)
}

fixIndexes().catch(err => {
    console.error(err)
    process.exit(1)
})
