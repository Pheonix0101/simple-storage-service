import { Request, Response, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

// Define storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = req.params.bucketname as string;
    const uploadDir = path.join("storage", bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Function to create multer middleware with the configured storage
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000 * 1024 * 1024 }, // limit file size to 5GB
}).any(); // Accept any type of file

// Route handler for uploading files
export const uploadFiles: RequestHandler = (req: Request, res: Response) => {
  const bucket = req.params.bucketname as string;
  if (!bucket) {
    res.status(400).send("Bucket name is required.");
    return;
  }

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      console.error("Error uploading file:", err);
      res.status(500).send("An error occurred during the file upload.");
      return;
    }
    res.send("Files uploaded successfully.");
  });
};

// Other route handlers for file operations (getAllFiles, deleteFile, etc.)
// Implement as needed, using similar RequestHandler definitions

export const getAllFiles: RequestHandler = (req: Request, res: Response) => {
  // Implement logic to retrieve all files in a bucket
  const bucketName = req.params.bucketname as string;
  const uploadDir = `storage/${bucketName}`;
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      res.status(500).send("An error occurred while retrieving files.");
      return;
    }
    res.json(files);
  });
};

export const deleteFile: RequestHandler = (req: Request, res: Response) => {
  // Implement logic to delete a file from a bucket
  const bucket = req.params.bucketname as string;
  const fileName = req.params.filename as string;
  const filePath = path.join(`storage/${bucket}`, fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      res.status(500).send("An error occurred while deleting the file.");
      return;
    }
    console.log(fileName, " deleted successfully");
    res.send("File deleted successfully.");
  });
};

export const deleteMultipleFiles: RequestHandler = (req: Request, res: Response) => {
  // Implement logic to delete multiple files from a bucket
  const bucket = req.body.bucketname as string;
  const filenames = req.body.filenames as string[];
  if (!Array.isArray(filenames)) {
    res.status(400).send("Filenames should be an array.");
    return;
  }

  let errors: string[] = [];

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
    res.status(500).json({
      message: "Some files could not be deleted",
      errors: errors,
    });
    return;
  }

  res.send("Files deleted successfully.");
};

export const downloadFile: RequestHandler = (req: Request, res: Response) => {
  // Implement logic to download a file from a bucket
  const bucket = req.params.bucketname as string;
  const fileName = req.params.filename as string;
  const filePath = path.join(`storage/${bucket}`, fileName);

  // Check if the file exists
  if (!fs.existsSync(filePath)) {
    res.status(404).send("File not found.");
    return;
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

function getContentType(fileName: string): string {
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
};

export const listBucket: RequestHandler = (req: Request, res: Response) => {
  // Implement logic to list all buckets
  const uploadsDir = "storage";
  fs.readdir(uploadsDir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      res.status(500).send("An error occurred while retrieving folders.");
      return;
    }
    const folders = files
      .filter((file) => file.isDirectory())
      .map((file) => file.name);
    res.json(folders);
  });
};
