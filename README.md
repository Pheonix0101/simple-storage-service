# Pre-requisites
Install Node.js version 20.11.0

# Run the node project
## 1. Clone the repository
```git clone <https://github.com/Pheonix0101/simple-storage-service.git>```

## 2. Install dependencies
```npm install```

## 3. run the project
`npm start`


# EndPoints followed with route name
http://localhost:9000/

1> for Adduploading files to the bucket:- upload/:bucketname  
2> for fetching all files from bucket:- getfiles/:bucketname  
3> for deleting single files at a time:- files/:bucketname/:filename  
4> for deleting multiple files :- files     
5> for downloading a file :- file/:bucketname/:filename
6> for listing all buckets present in s3 :- /buckets




#  for view swagger page :- http://localhost:9000/api-docs


# preview of swagger page
3> API docs of this project.
   ![](<swagger API docs.png>)






## Teck-stack and library used in this project.
`Node.js, Express.js, Typescript, Swagger, and Multer,`   
