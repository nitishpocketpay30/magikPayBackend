const multer = require('multer');

// Store files temporarily in the 'temp_uploads/' folder
const upload = multer({ dest: 'temp_uploads/' });

module.exports = upload; // ✅ EXPORT THE FUNCTION DIRECTLY
