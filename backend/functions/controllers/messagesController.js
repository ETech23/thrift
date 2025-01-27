const admin = require("firebase-admin");
const db = admin.firestore();

exports.sendMessage = async (req, res) => {
    const { sender, content } = req.body;

    try {
        const messageRef = await db.collection("messages").add({
            sender,
            content,
            timestamp: admin.firestore.Timestamp.now(),
        });

        res.status(201).json({ success: true, id: messageRef.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const snapshot = await db.collection("messages").orderBy("timestamp", "asc").get();
        const messages = snapshot.docs.map(doc => doc.data());
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

