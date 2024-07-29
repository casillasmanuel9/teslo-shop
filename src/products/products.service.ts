import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities';
import { validate as isUUID } from 'uuid';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private readonly productRespository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRespository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const producto = this.productRespository.create({
        ...productDetails,
        user,
        images: images.map((image) =>
          this.productImageRespository.create({ url: image }),
        ),
      });
      await this.productRespository.save(producto);

      return {
        ...producto,
        images: images,
      };
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async builkCreate(createProductsDto: CreateProductDto[], user: User) {
    try {
      const products: Product[] = [];
      for (const createProductDto of createProductsDto) {
        const { images = [], ...productDetails } = createProductDto;

        const producto = this.productRespository.create({
          ...productDetails,
          images: images.map((image) =>
            this.productImageRespository.create({ url: image }),
          ),
          user,
        });
        products.push(producto);
      }
      await this.productRespository.save(products);

      return products;
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const [data, total] = await this.productRespository.findAndCount({
      skip: offset,
      take: limit,
      relations: {
        images: true,
      },
    });

    return {
      data: data.map(({ images, ...rest }) => ({
        ...rest,
        images: images.map(({ url }) => url),
      })),
      total,
    };
  }

  async findOne(term: string) {
    let product: Product;
    if (isUUID(term)) {
      product = await this.productRespository.findOneBy({ id: term });
    } else {
      const queryBuilder = this.productRespository.createQueryBuilder('prod');
      product = await queryBuilder
        .where(`title = :title`, {
          title: term,
        })
        .orWhere(`slug =:slug`, {
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }
    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);
    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate } = updateProductDto;

    const product = await this.productRespository.preload({
      id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Product with id ${id} not found`);

    // Create query runner;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRespository.create({
            url: image,
          }),
        );
      }
      product.user = user;
      await queryRunner.manager.save(product);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleExeptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRespository.remove(product);
  }

  async removeAll() {
    const query = this.productRespository.createQueryBuilder();
    try {
      await query.delete().execute();
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  private handleExeptions(error: any): never {
    if (error.code === '23505') {
      // unique constraint error
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
