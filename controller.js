const path = require("path");
const multer = require("multer");
const fs = require("fs");

const createStorage = (bucket) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join("storage", bucket);
      // Ensure the directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir); // Save files to the specified bucket directory
    },
    filename: (req, file, cb) => {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      ); // Rename the file to include the timestamp
    },
  });
};

// Function to create a new multer instance with the given storage configuration
const createMulter = (storage) => {
  return multer({
    storage: storage,
    limits: { fileSize: 5000 * 1024 * 1024 },
  }).any(); // Accept any type of file
};

const uploadFiles = (req, res) => {
  const bucket = req.params.bucketname;
  if (!bucket) {
    return res.status(400).send("Bucket name is required.");
  }

  const storage = createStorage(bucket);
  const upload = createMulter(storage);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      console.error("Error uploading file:", err);
      return res.status(500).send("An error occurred during the file upload.");
    }
    res.send("Files uploaded successfully.");
  });
};

const getAllFiles = (req, res) => {
  const bucketName = req.params.bucketname;
  const uploadDir = `storage/${bucketName}`;
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("An error occurred while retrieving files.");
    }
    res.json(files);
    console.log(files);
  });
};

const deleteFile = (req, res) => {
  const bucket = req.params.bucketname;
  const fileName = req.params.filename;
  const filePath = path.join(`storage/${bucket}`, fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).send("An error occurred while deleting the file.");
    }
    console.log(fileName, " deleted successfully");
    res.send("File deleted successfully.");
  });
};

const deleteMultipleFiles = (req, res) => {
  const bucket = req.body.bucketname;
  const filenames = req.body.filenames;
  console.log(filenames);
  if (!Array.isArray(filenames)) {
    return res.status(400).send("Filenames should be an array.");
  }

  let errors = [];

  filenames.forEach((filename) => {
    const filePath = path.join(`storage/${bucket}`, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", filename, err);
        errors.push(filename);
      }
    });
  });
  if (errors.length > 0) {
    return res.status(500).json({
      message: "Some files could not be deleted",
      errors: errors,
    });
  }

  res.send("Files deleted successfully.");
};

const downloadFile = (req, res) => {
  const bucket = req.params.bucketname;
  const fileName = req.params.filename;
  const filePath = path.join(`storage/${bucket}`, fileName);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found.");
  }

  // Determine the file's content type based on its extension
  const contentType = getContentType(fileName);

  // Set the appropriate content type for the response
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  // Create a read stream from the file path and pipe it to the response
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
      return "image/jpg";
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg";
    default:
      return "application/octet-stream"; // fallback to binary data if type is unknown
  }
}

const listBucket = (req, res) => {
  const uploadsDir = "storage";
  fs.readdir(uploadsDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res
        .status(500)
        .send("An error occurred while retrieving folders.");
    }
    const folders = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);
    res.json(folders);
    //   console.log(...folders);
  });
};

module.exports = {
  uploadFiles,
  getAllFiles,
  deleteFile,
  deleteMultipleFiles,
  downloadFile,
  listBucket,
};
