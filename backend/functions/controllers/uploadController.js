const admin = require("firebase-admin");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

exports.uploadImage = async (req, res) => {
    try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(`items/${Date.now()}_${req.file.originalname}`);

        await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        res.status(200).json({ success: true, imageUrl: publicUrl });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

