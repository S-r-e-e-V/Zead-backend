const User = require("../modals/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = (req, res, next) => {
  bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
    if (err) {
      res.status(403).json({
        error: err,
      });
    }
    let user = new User({
      name: req.body.name,
      username: req.body.username,
      phone: req.body.phone,
      password: hashedPass,
    });

    user
      .save()
      .then((user) => {
        res.json({ message: "User added successfully" });
      })
      .catch((err) => {
        if (err.code === 11000) {
          res.status(403).json({
            error: { message: "Username already exist" },
          });
        } else {
          res.status(403).json({
            error: err,
          });
        }
      });
  });
};
const login = (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  User.findOne({ $or: [{ username: username }, { password: password }] }).then(
    (user) => {
      if (user) {
        bcrypt.compare(password, user.password, function (err, data) {
          if (err) {
            res.status(403).json({
              error: err,
            });
          }
          if (data) {
            let token = jwt.sign(
              { id: user._id, username: user.username },
              "PleaseDonotCrackThis",
              { expiresIn: "7d" }
            );
            res.json({
              message: "Login successfull",
              token,
            });
          } else {
            res.status(403).json({
              error: { message: "Password does not match" },
            });
          }
        });
      } else {
        res.status(403).json({
          error: { message: "User not found" },
        });
      }
    }
  );
};

const updatePassowrd = (req, res, next) => {
  bcrypt.hash(req.body.password, 10, function (err, hashedPass) {
    if (err) {
      res.status(403).json({
        error: err,
      });
    }
    User.updateOne(
      {
        username: req.body.username,
      },
      {
        $set: {
          password: hashedPass,
        },
      }
    )
      .then((user) => {
        if (user.matchedCount > 0) {
          res.json({
            message: "Password changed successfully",
          });
        } else {
          res.status(403).json({
            error: { message: "User not found" },
          });
        }
      })
      .catch((err) => {
        res.status(403).json({ error: err });
      });
  });
};

const updateProfile = (req, res, next) => {
  User.updateOne(
    {
      username: req.user.username,
    },
    {
      $set: { name: req.body.name, phone: req.body.phone },
    }
  )
    .then((user) => {
      if (user) {
        res.json({
          message: "Profile updated successfully",
        });
      }
    })
    .catch((err) => {
      res.status(403).json({ error: err });
    });
};
module.exports = { register, login, updatePassowrd, updateProfile };
