import express from "express";
import bodyParser from "body-parser";
import uploadRoutes from "./route";
import { swaggerServe, swaggerSetup } from "./config"; // Adjust import based on your actual config file structure

const port = process.env.PORT || 9000;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", uploadRoutes);

app.use("/api-docs", swaggerServe, swaggerSetup);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
