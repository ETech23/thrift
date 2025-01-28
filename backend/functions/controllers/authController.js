const admin = require("firebase-admin");
const auth = admin.auth();

exports.register = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await auth.createUser({ email, password });
        res.status(201).json({ success: true, uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

