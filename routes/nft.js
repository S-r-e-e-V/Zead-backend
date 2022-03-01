const express = require("express");
const router = express.Router();
const NftController = require("../controllers/NftController");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const directUpload = multer({ storage: multer.memoryStorage() });

router.post("/new_user", NftController.addUser);
router.post(
  "/update_profile_pic/:id",
  directUpload.single("profile_image"),
  NftController.uploadProfilePic
);
router.post(
  "/update_profile_banner/:id",
  directUpload.single("profile_banner"),
  NftController.uploadProfileBanner
);
router.post("/new_content", NftController.addContent);
router.post("/add_ipfs", upload.single("content"), NftController.addIPFS);
router.post("/sale", NftController.addSales);
router.post("/new_bid", NftController.addNewBid);
router.post("/follow", NftController.addFollowers);
router.post("/add_to_favorites", NftController.favoriteContent);

router.get("/users", NftController.getAllUsers);
router.get("/user/:id", NftController.getUser);
// router.get("/content", NftController.getAllContent);
router.get("/content/:id", NftController.getContent);
router.get("/notifications/:id", NftController.getNotification);

module.exports = router;
