const express = require("express");
const router = express.Router();

const controller = require("./controller");
const uploadController = require("./controller");


router.post('/upload/:bucketname', uploadController.uploadFiles);
router.get('/getfiles/:bucketname', controller.getAllFiles);
router.delete('/files/:bucketname/:filename', controller.deleteFile);
router.delete('/files', controller.deleteMultipleFiles);
router.get('/file/:bucketname/:filename', controller.downloadFile);
router.get('/buckets', controller.listBucket);


module.exports = router;
