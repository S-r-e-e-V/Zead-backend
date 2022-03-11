const { uploadFile } = require("../utils/s3");

const fileUpload = async (req, res, next) => {
  const profile_image = req.file;
  try {
    const s3_result = await uploadFile(
      profile_image,
      "application-images/" + Date.now() + "_" + profile_image.originalname,
      true
    );
    if (s3_result)
      res.status(200).json({
        message: "File uploaded successfully",
        location: s3_result.Location,
      });
    else res.status(400).json({ error: { message: "Failed to upload" } });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};
module.exports = { fileUpload };
