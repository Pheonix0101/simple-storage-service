const express = require("express");
const bodyParser = require("body-parser");
const route = require("./route");
const uploadRoutes = require("./route");
const port = process.env.PORT || 9000;

const app = express();

const { swaggerServe, swaggerSetup } = require("./config");

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));

app.use("/", uploadRoutes);
app.use("/api-docs", swaggerServe, swaggerSetup);

app.listen(port, () => {
  console.log(`server is running on http://localhost: ${port}`);
});
