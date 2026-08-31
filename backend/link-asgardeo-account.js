import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function mergeAsgardeoAccount() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB.')

    // Find the main user with thisari email
    let mainUser = await User.findOne({ email: 'thisaridewmini428@gmail.com' })

    // Find any duplicate Asgardeo placeholder accounts
    const asgardeoPlaceholderUsers = await User.find({
        $or: [
            { provider: 'asgardeo' },
            { email: /@asgardeo\.user|devcanvas\.io/ }
        ]
    })

    console.log(`Found ${asgardeoPlaceholderUsers.length} Asgardeo placeholder user(s).`)

    let asgardeoIdToLink = null
    for (const pUser of asgardeoPlaceholderUsers) {
        if (pUser.email !== 'thisaridewmini428@gmail.com') {
            if (pUser.asgardeoId) {
                asgardeoIdToLink = pUser.asgardeoId
            }
            await User.deleteOne({ _id: pUser._id })
            console.log(`Deleted duplicate placeholder account: ${pUser._id}`)
        }
    }

    if (mainUser) {
        mainUser.name = 'Thisari Hewage'
        if (asgardeoIdToLink) {
            mainUser.asgardeoId = asgardeoIdToLink
        }
        mainUser.provider = 'asgardeo'
        await mainUser.save()
        console.log(`Successfully merged and updated main user record:`, {
            id: mainUser._id,
            name: mainUser.name,
            email: mainUser.email,
            asgardeoId: mainUser.asgardeoId,
            provider: mainUser.provider
        })
    } else {
        console.log('Main user not found, creating new one...')
        mainUser = await User.create({
            name: 'Thisari Hewage',
            email: 'thisaridewmini428@gmail.com',
            asgardeoId: asgardeoIdToLink || 'linked_asgardeo_id',
            provider: 'asgardeo',
            role: 'STUDENT'
        })
        console.log('Created main user:', mainUser)
    }

    process.exit(0)
}

mergeAsgardeoAccount().catch(err => {
    console.error(err)
    process.exit(1)
})
