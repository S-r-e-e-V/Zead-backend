const express = require("express");
const router = express.Router();
const NftController = require("../controllers/NftController");
const FileUploadController = require("../controllers/FileUpload");
const Authenticate = require("../middlewire/authenticate");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const directUpload = multer({ storage: multer.memoryStorage() });

// profile

// add new user
router.post("/new_user", NftController.addUser);
// update profile
router.put("/update_profile", Authenticate, NftController.editUser);
// get user
router.get("/user/:id", Authenticate, NftController.getUser);
// follow a user
router.post("/follow", Authenticate, NftController.addFollowers);
// add an art work to favorites
router.post("/add_to_favorites", Authenticate, NftController.favoriteContent);

// content

// create content
router.post("/create_content", Authenticate, NftController.addContent);
// edit content
router.put("/edit_content", Authenticate, NftController.editContent);
// file upload
router.post(
  "/update_file",
  Authenticate,
  directUpload.single("file"),
  FileUploadController.fileUpload
);

// collection

// create collection
router.post("/create_collection", Authenticate, NftController.addCollection);
// edit collection
router.put("/edit_collection", Authenticate, NftController.editCollection);
// get all collections of a user
router.get(
  "/all_user_collection/:id",
  Authenticate,
  NftController.getAllUserCollections
);
// get individual collection
router.get("/collection/:id", Authenticate, NftController.getCollection);

//
router.post("/add_ipfs", upload.single("content"), NftController.addIPFS);
router.post("/sale", Authenticate, NftController.addSales);
router.post("/new_bid", Authenticate, NftController.addNewBid);

router.get("/users", Authenticate, NftController.getAllUsers);
router.get("/notifications/:id", Authenticate, NftController.getNotification);

module.exports = router;
