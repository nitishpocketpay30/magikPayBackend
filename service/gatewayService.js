// services/gatewayService.js
const mongoose = require("mongoose");
const paymentSchema = require("../model/paymentSchema");
const appSchema = require("../model/appSchema");
const adminSchema = require("../model/adminSchema");

async function deleteGatewayAndCascade(gatewayId) {
  if (!mongoose.Types.ObjectId.isValid(gatewayId)) {
    throw new Error("Invalid Gateway ID");
  }

  // Soft-delete gateway
  const gatewayRes = await paymentSchema.updateOne(
    { _id: gatewayId },
    { 
      $set: { isDeleted: true, deletedAt: new Date() }
    }
  );

  // Find related apps
  const apps = await appSchema.find({ gateway_id: gatewayId });
  const appIds = apps.map(a => a._id);

  // Soft-delete apps + unset gateway fields
  const appsRes = await appSchema.updateMany(
    { gateway_id: gatewayId },
    {
      $set: { isDeleted: true, deletedAt: new Date(), gateway_id: "", payment_method: "" },
    }
  );

  // Remove apps from admins
  const adminRes = await adminSchema.updateMany(
    { apps: { $in: appIds } },
    { $pull: { apps: { $in: appIds } } }
  );

  console.log("Gateway deleted:", gatewayRes.modifiedCount);
  console.log("Apps updated:", appsRes.modifiedCount);
  console.log("Admins updated:", adminRes.modifiedCount);
}

module.exports = { deleteGatewayAndCascade };
