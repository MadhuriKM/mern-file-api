const { StatusCodes }  = require('http-status-codes')
const File = require('../model/file')
const fs = require('fs')
const mailsend = require('../config/mail')

// upload file - post
const uploadFile = async (req,res) => {
     try {
         // to read file data -> req.file
         let data = req.file

            // to validate file already exists or not
         let extFile = await File.findOne({ originalname:data.originalname})
            if(extFile){
               fs.unlinkSync(data.path)
               return res.status(StatusCodes.CONFLICT).json({ msg: `file already exists.`})
            }
            
            
               // file data upload to db 
         let newFile = await File.create(data)

         // attachments data
         let fileData = [
            {
               filename: newFile.filename,
               path: newFile.path
            }
         ]

            // sending email with attachments
         let mailRes = await mailsend("mkmakaravalli@gmail.com", "File Attachment","Welcome to file api with attachment", fileData)

        res.status(StatusCodes.CREATED).json({ status: true, msg: "file uploaded", file: newFile,mailRes })
     } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ status: false, msg: err})
     }
}

// read all files - get
const readAllFiles = async (req,res) => {
    try {
       let data = await File.find({})
       res.status(StatusCodes.ACCEPTED).json({ status: true, length: data.length, files: data })
    } catch (err) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({  status: false, msg: err})
    }
}


// read single file -get(id)
const readSingleFile = async (req,res) => {
    try {
      let id = req.params.id
      let extFile = await File.findById(id)
         if(!extFile)
            return res.status(StatusCodes.NOT_FOUND).json({ status: false, msg: 'requested id not found'})

         
       res.status(StatusCodes.ACCEPTED).json({ status: true, file: extFile })
    } catch (err) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({  status: false, msg: err})
    }
}


// delete file - delete(id)
const deleteFile = async (req,res) => {
    try {
      let id = req.params.id
      let extFile = await File.findById(id)
      if(!extFile)
         return res.status(StatusCodes.NOT_FOUND).json({ status: false, msg: 'requested id not found'})

       fs.unlinkSync(extFile.path) /* delete file from location */
      
      await File.findByIdAndDelete(id)

       res.status(StatusCodes.ACCEPTED).json({ status: true, msg: 'File deleted successfully'})
    } catch (err) {
       res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({  status: false, msg: err})
    }
}

module.exports = { uploadFile, readAllFiles, readSingleFile, deleteFile}