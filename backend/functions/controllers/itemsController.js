const admin = require("firebase-admin");
const db = admin.firestore();

exports.createItem = async (req, res) => {
    const { name, price, category, anonymous, image } = req.body;

    try {
        const itemRef = await db.collection("items").add({
            name,
            price,
            category,
            anonymous,
            image,
            createdAt: admin.firestore.Timestamp.now(),
        });

        res.status(201).json({ success: true, id: itemRef.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const snapshot = await db.collection("items").orderBy("createdAt", "desc").get();
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

