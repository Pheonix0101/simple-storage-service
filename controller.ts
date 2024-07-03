import { Request, Response, RequestHandler } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  uploadfiles_helper,
  readDirectory_helper,
  removeFileFromBucket_helper,
  removeMultipleFiles_helper,
  getContentType,
  printBucketName_hepler,
} from "./fileHandler";

export const uploadFiles: RequestHandler = (req: Request, res: Response) => {
  const bucket = req.params.bucketname as string;
  if (!bucket) {
    res.status(400).send("Bucket name is required.");
    return;
  }

  uploadfiles_helper(req, res, (err) => {
    if (err instanceof multer.MulterError || err) {
      console.error("Error uploading file to the bucket:", err);
      res.status(500).send("An error occurred during the file uploading.");
      return;
    }
    res.send("Files uploaded successfully.");
  });
};

export const getAllFiles = (req: Request, res: Response): void => {
  const bucketName = req.params.bucketname as string;
  const uploadDir = path.join("storage", bucketName);

  readDirectory_helper(uploadDir, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      res.status(500).send("An error occurred while retrieving files.");
    } else {
      res.json(files);
    }
  });
};

export const deleteFile: RequestHandler = (req: Request, res: Response) => {
  const bucket = req.params.bucketname as string;
  const fileName = req.params.filename as string;
  const filePath = path.join(`storage/${bucket}`, fileName);

  removeFileFromBucket_helper(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      res.status(500).send("An error occurred while deleting the file.");
      return;
    }
    console.log(fileName, " deleted successfully");
    res.send("File deleted successfully.");
  });
};

export const deleteMultipleFiles: RequestHandler = (
  req: Request,
  res: Response
) => {
  const bucket = req.body.bucketname as string;
  const filenames = req.body.filenames as string[];
  if (!Array.isArray(filenames)) {
    res.status(400).send("Filenames should be an array.");
    return;
  }

  let errors: string[] = [];

  removeMultipleFiles_helper(filenames, bucket, errors);

  if (errors.length > 0) {
    res.status(500).json({
      message: "Some files could not be deleted.",
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

  const contentType = getContentType(fileName);

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
};

export const listBucket: RequestHandler = (req: Request, res: Response) => {
  const currDir = "storage";

  printBucketName_hepler(currDir, (err, dir) => {
    if (err) {
      res.status(500).send("An error occurred while retrieving folders.");
    } else {
      res.json(dir);
    }
  });
};
