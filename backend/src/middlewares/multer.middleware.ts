import multer from "multer";

const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
        cb(null, "./public/temp");
    },
    filename: function(req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

export const upload = multer({ storage: storage });