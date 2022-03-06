const express = require("express");
const router = express.Router();
const NftController = require("../controllers/NftController");
const Authenticate = require("../middlewire/authenticate");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const directUpload = multer({ storage: multer.memoryStorage() });

router.post("/new_user", NftController.addUser);
router.put("/update_profile", Authenticate, NftController.editUser);
router.post(
  "/update_profile_pic",
  Authenticate,
  directUpload.single("profile_image"),
  NftController.uploadProfilePic
);
router.post(
  "/update_profile_banner",
  Authenticate,
  directUpload.single("profile_banner"),
  NftController.uploadProfileBanner
);
router.post("/follow", Authenticate, NftController.addFollowers);
router.post("/add_to_favorites", Authenticate, NftController.favoriteContent);

router.post("/new_content", Authenticate, NftController.addContent);
router.post("/add_ipfs", upload.single("content"), NftController.addIPFS);
router.post("/sale", Authenticate, NftController.addSales);
router.post("/new_bid", Authenticate, NftController.addNewBid);

router.get("/users", Authenticate, NftController.getAllUsers);
router.get("/user/:id", Authenticate, NftController.getUser);
// router.get("/content", NftController.getAllContent);
router.get("/content/:id", Authenticate, NftController.getContent);
router.get("/notifications/:id", Authenticate, NftController.getNotification);

module.exports = router;
