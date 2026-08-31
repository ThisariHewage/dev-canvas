import 'dotenv/config'
import mongoose from 'mongoose'
import User from './src/models/User.js'

async function updateRealAsgardeoUser() {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB.')

    const result = await User.updateMany(
        { provider: 'asgardeo' },
        {
            $set: {
                name: 'Thisari Hewage',
                email: 'thisaridewmini428@gmail.com'
            }
        }
    )

    console.log(`Updated ${result.modifiedCount} Asgardeo user(s) to Thisari Hewage (thisaridewmini428@gmail.com).`)

    // Also check if any user has placeholder email
    const placeholderResult = await User.updateMany(
        { email: /@asgardeo\.user|devcanvas\.io/ },
        {
            $set: {
                name: 'Thisari Hewage',
                email: 'thisaridewmini428@gmail.com'
            }
        }
    )
    console.log(`Updated ${placeholderResult.modifiedCount} placeholder user(s).`)

    process.exit(0)
}

updateRealAsgardeoUser().catch(err => {
    console.error(err)
    process.exit(1)
})
