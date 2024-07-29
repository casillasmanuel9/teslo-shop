import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files - Get and Upload')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      storage: diskStorage({
        destination: './static/uploads',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder().build({
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    const secureUrl = `${this.configService.get('HOST_API')}/files/products/${file.filename}`;
    return { secureUrl };
  }

  @Get('product/:imageName')
  findOne(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.filesService.getStaticImage(imageName);
    return res.sendFile(path);
  }
}
