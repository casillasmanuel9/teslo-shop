import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductImage } from './';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({
  name: 'products',
})
export class Product {
  @ApiProperty({
    example: '0c25478f-e27a-48b9-9087-74ccd03f4ec8',
    description: 'Product ID',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'T-Shirt Teslo',
    description: 'Product Title',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 0,
    description: 'Product price',
  })
  @Column({
    type: 'float',
    default: 0,
  })
  price: number;

  @ApiProperty({
    example:
      'Ad incididunt exercitation eu qui adipisicing in qui nostrud et ex ut officia esse commodo.',
    description: 'Product Description',
    default: null,
  })
  @Column({
    type: 'text',
    nullable: true,
  })
  description?: string;

  @ApiProperty({
    example: 't_shirt_teslo',
    description: 'Product Slug',
    uniqueItems: true,
  })
  @Column({
    type: 'text',
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 0,
    description: 'Product Stock',
    default: 0,
  })
  @Column({
    type: 'int',
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['S', 'M'],
    description: 'Product Sizes',
    default: [],
  })
  @Column({
    type: 'text',
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'women',
    description: 'Product Gender',
  })
  @Column({
    type: 'text',
  })
  gender: string;

  @ApiProperty({
    example: [],
    description: 'Product Tags',
    default: [],
  })
  @Column({
    type: 'text',
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: [],
    description: 'Product Images',
    default: [],
  })
  @OneToMany(() => ProductImage, (pi) => pi.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(() => User, (user) => user.product, { eager: true })
  user: User;

  @BeforeInsert()
  checkSlugInsert() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll(`'`, '');
  }

  @BeforeUpdate()
  checkSlugUpdate() {
    this.slug = this.slug
      .toLocaleLowerCase()
      .replaceAll(' ', '_')
      .replaceAll(`'`, '');
  }
}
