import multer from "multer";
import path from "path";
import fs from "fs";

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bucket = req.params.bucketname as string;
    const uploadDir = path.join("storage", bucket);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

export const uploadfiles_helper = multer({
  storage: storage,
  limits: { fileSize: 5000 * 1024 * 1024 },
}).any();

export const readDirectory_helper = (
  directoryPath: string,
  callback: (err: NodeJS.ErrnoException | null, files: string[] | null) => void
): void => {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, files);
    }
  });
};

export const removeFileFromBucket_helper = (
  dirpath: string,
  callback: (err: NodeJS.ErrnoException | null) => void
): void => {
  fs.unlink(dirpath, (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};

export const removeMultipleFiles_helper = (
  filenames: string[],
  bucket: string,
  errors: string[]
) => {
  filenames.forEach((filename: string) => {
    const filePath = path.join(`storage/${bucket}`, filename);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", filename, err);
        errors.push(filename);
      }
    });
  });
};

export function getContentType(fileName: string): string {
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
      return "application/octet-stream";
  }
}

export const printBucketName_hepler = (
  dirName: string,
  callback: (err: NodeJS.ErrnoException | null, files: string[] | null) => void
): void => {
  fs.readdir(dirName, { withFileTypes: true }, (err, files) => {
    if (err) {
      callback(err, null);
    } else {
      const folders = files
        .filter((file) => file.isDirectory())
        .map((file) => file.name);
      callback(null, folders);
    }
  });
};
