import { v4 as uuid } from 'uuid';
export const fileNamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile?: string) => void,
) => {
  if (!file) {
    return callback(new Error('File is empty'));
  }

  const [, fileExtension] = file.mimetype.split('/');

  const fileName = `${uuid()}.${fileExtension}`;
  callback(null, fileName);
};
