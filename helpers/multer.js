// module.exports=uploadFields
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'public/uploads/');
    },
    filename: function(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        callback(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = function(req, file, cb) {
    const fileTypes = /jpeg|jpg|png|heic/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype || true) {
        cb(null, true);
    } else {
        cb(new Error('Only .png, .jpg, .heic and .jpeg format allowed!'));
        
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
    fileFilter: fileFilter
});

const uploads=upload.array('images', 5); // Adjust field name and limit as needed
module.exports = uploads