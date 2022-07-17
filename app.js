const Works = require("./models/works");
const Companies = require("./models/companies");

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const path = require("path");

const nodemailer = require("nodemailer");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const upload = require("express-fileupload");
app.use(upload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "static")));

app.get("/", async (req, res) => {
  const works = await Works.find({});
  let companies = await Companies.find({});
  companies = companies.slice(-6);

  res.render("home", { works: works, companies: companies });
});
app.get("/services", async (req, res) => {
  res.render("services");
});
app.get("/about", async (req, res) => {
  res.render("about");
});
app.get("/contact", async (req, res) => {
  res.render("contact");
});

app.post("/contact-mail", async (req, res) => {
  console.log(req.body);
  try {
    let transporter = nodemailer.createTransport({
      host: "mail.digitalhoppin.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SERVEREMAILID, // generated ethereal user
        pass: process.env.SERVEREMAILPASSWORD, // generated ethereal password
      },
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "support@digitalhoppin.com", // sender address
      to: "support@digitalhoppin.com", // list of receivers
      subject: req.body.subject, // Subject line
      text:
        "By: " +
        req.body.name +
        "\nfrom: " +
        req.body.email +
        "\n" +
        req.body.message +
        " ", // plain text body
    });
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});
// -----------------------------authentication----------------

app.get("/login", async (req, res) => {
  bcrypt.hash("amricakadalalbc", 10, function (err, hash) {
    // Store hash in your password DB.
    console.log(hash);
  });
  res.render("login");
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  bcrypt.compare(
    req.body.password,
    process.env.PASSWORD,
    function (err, result) {
      if (result) {
        res.cookie("user", process.env.PASSWORD);
        sendMail();
        res.redirect("/admin-dashboard");
      } else {
        res.send("incorrect password");
      }
    }
  );
});

app.get("/logout", async (req, res) => {
  res.clearCookie("user");
  res.redirect("/login");
});
// -------------------------------------Dashboard--------------------------------

app.get("/admin-dashboard", async (req, res) => {
  try {
    if (req.cookies.user == process.env.PASSWORD) {
      console.log("entered");
      res.render("dashboard/home");
    } else {
      console.log("wrong");
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/admin-dashboard/add-works", async (req, res) => {
  try {
    if (req.cookies.user == process.env.PASSWORD) {
      if (req.files) {
        let file = req.files.file;
        let filename = file.name;
        file.mv(
          path.join(__dirname, "/static", "works/" + filename),
          function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send(err);
            } else res.send("File uploaded!");
          }
        );
        req.body.imageName = filename;
        delete req.body.file;
        console.log(req.body);
        const newWork = await Works.create(req.body);
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "invalid data",
    });
  }
});

app.post("/admin-dashboard/add-company", async (req, res) => {
  try {
    if (req.cookies.user == process.env.PASSWORD) {
      if (req.files) {
        let file = req.files.file;
        let filename = file.name;
        file.mv(
          path.join(__dirname, "/static", "companies/" + filename),
          function (err) {
            if (err) {
              console.log(err);
              return res.status(500).send(err);
            } else res.send("File uploaded!");
          }
        );
        req.body.imageName = filename;
        delete req.body.file;
        console.log(req.body);
        const newCompany = await Companies.create(req.body);
      }
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "invalid data",
    });
  }
});

const sendMail = async () => {
  let transporter = nodemailer.createTransport({
    host: "mail.digitalhoppin.com",
    // port: 587,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SERVEREMAILID, // generated ethereal user
      pass: process.env.SERVEREMAILPASSWORD, // generated ethereal password
    },
  });
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: process.env.SERVEREMAILID, // sender address
    to: process.env.SERVEREMAILID, // list of receivers
    subject: "Logged in", // Subject line
    text: "Someone has logged in", // plain text body
  });
  console.log("mailed");
};

module.exports = app;
