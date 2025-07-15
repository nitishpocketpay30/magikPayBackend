const upload = require('../middleware/upload'); 
const upload.fields([
    { name: 'panCard', maxCount: 1 },
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'gstDocument', maxCount: 1 }
  ])