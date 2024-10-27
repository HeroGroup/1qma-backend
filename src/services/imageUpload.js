const multer = require("multer");
const { validateImageFileType } = require("../helpers/utils");

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "public/uploads/");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const fileExtension = file.originalname.split(".").pop();
		const fileFinalName = `${file.fieldname}-${uniqueSuffix}.${fileExtension}`;
		cb(null, fileFinalName);
	},
});
const imageUpload = multer({
	fileFilter: function (req, file, cb) {
		const fileExtension = file.originalname.split(".").pop();
		const validateFileResult = validateImageFileType(fileExtension);
		cb(null, validateFileResult);
	},
	storage,
	limits: { fileSize: 2e6 },
});

module.exports = imageUpload;
