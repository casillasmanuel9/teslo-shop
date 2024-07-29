import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/data';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductsService,
    @InjectRepository(User) readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();
    const firstUser = await this.insertUsers();
    await this.insertNewProducts(firstUser);
    return 'SEED EXECUTED';
  }

  private async deleteTables() {
    await this.productService.removeAll();
    await this.userRepository.delete({});
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = seedUsers.map((user) =>
      this.userRepository.create({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      }),
    );

    const dbUsers = await this.userRepository.save(users);
    const [firstUser] = dbUsers;
    return firstUser;
  }

  private async insertNewProducts(user: User) {
    const products = initialData.products;
    await this.productService.builkCreate(products, user);
  }
}
