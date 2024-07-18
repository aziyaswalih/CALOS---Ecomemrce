const bcrypt = require('bcrypt')
const securePassword = async(password) => {
    try {
        const passwordHash = await bcrypt.hash(password,10)
        return passwordHash
    } catch (error) {
        console.log(error.message+"user securePassword Error");
    }
}

module.exports = {
    securePassword
}