import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function updateAsgardeoUsers() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB.')

    const users = await User.find({})
    for (const u of users) {
        if (u.provider === 'asgardeo' || u.email.includes('@asgardeo.user')) {
            const shortId = u._id.toString().slice(-6).toUpperCase()
            if (u.email.includes('7df587') || u._id.toString().toLowerCase().endsWith('7df587')) {
                u.name = 'Asgardeo Member (7DF587)'
                u.email = 'asgardeo.user.7df587@devcanvas.io'
                await u.save()
                console.log(`Updated user 7DF587 -> Name: ${u.name}, Email: ${u.email}`)
            } else if (u.email.includes('feb6df') || u._id.toString().toLowerCase().endsWith('feb6df')) {
                u.name = 'Asgardeo Member (FEB6DF)'
                u.email = 'asgardeo.user.feb6df@devcanvas.io'
                await u.save()
                console.log(`Updated user FEB6DF -> Name: ${u.name}, Email: ${u.email}`)
            } else if (u.email.endsWith('@asgardeo.user')) {
                u.name = `Asgardeo Member (${shortId})`
                u.email = `asgardeo.user.${shortId.toLowerCase()}@devcanvas.io`
                await u.save()
                console.log(`Updated user ${shortId} -> Name: ${u.name}, Email: ${u.email}`)
            }
        }
    }
    process.exit(0)
}

updateAsgardeoUsers().catch(err => {
    console.error(err)
    process.exit(1)
})
