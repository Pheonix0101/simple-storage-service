import express, { Router } from "express";
import * as controller from "./controller";
import * as uploadController from "./controller";

const router: Router = express.Router();

router.post('/upload/:bucketname', uploadController.uploadFiles);
router.get('/getfiles/:bucketname', controller.getAllFiles);
router.delete('/files/:bucketname/:filename', controller.deleteFile);
router.delete('/files', controller.deleteMultipleFiles);
router.get('/file/:bucketname/:filename', controller.downloadFile);
router.get('/buckets', controller.listBucket);

export default router;
