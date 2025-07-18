const express = require('express');
const { verifyAdmin } = require('../middleware/auth.middleware');
const provider = express.Router();
const providerController=require("../controller/adminController/paymentProviderController");
const { validateBody } = require('../middleware/schemaMiddleware/userMiddleware');
const { addProviderSchema, assignProviderSchema } = require('../validators/schemaValidator/providerSchemaValidation');
provider.post('/add-provider-by-admin',verifyAdmin,validateBody(addProviderSchema),providerController.addProvider)
provider.post('/update-provider-by-admin/:id',verifyAdmin,validateBody(addProviderSchema),providerController.updateProvider)
provider.post('/assign-provider-to-user-by-admin',verifyAdmin,validateBody(assignProviderSchema),providerController.assignProviderToUser)
provider.post('/delete-provider-by-admin/:id',verifyAdmin,providerController.deleteProvider)
provider.get('/get-all-provider-by-admin',verifyAdmin,providerController.getProviders)
// payout api started 
provider.post('/create-payout-by-users',verifyAdmin,providerController.deleteProvider)

module.exports = provider;
// ✅ This code defines the user rou