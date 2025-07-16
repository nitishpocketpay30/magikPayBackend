function validateBody(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: false
    });
    if (error) {
      return res.status(400).json({ message:"something is missing !",status:400,error:error.message });
    }
    req.body = value;
    next();
  };
}
module.exports={
    validateBody
}

// usage validateBody(User)