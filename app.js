const express = require("express");
const cors = require('cors');
const app = express();
const port = process.env.APP_PORT || 3000;

const db = require("./models");
const kainRoutes = require("./routes/fabric.routes");
const orderRoutes = require("./routes/order.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

const { verifyToken } = require("./middlewares/auth");

app.use(cors());

db.sequelize
  .authenticate()
  .then(() => {
    console.log("model ORM Terhubung");
  })
  .catch((err) => {
    console.error(err.message);
  });
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/kain", kainRoutes);

app.use("/orders", verifyToken, orderRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Batiknesia app listening on port ${port}`);
});
