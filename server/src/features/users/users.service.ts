import { Injectable } from '@nestjs/common'
import { UsersRepository } from './users.repository'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByEmail(email: string) {
    return this.usersRepository.findByEmail(email)
  }

  findOne(id: string) {
    return this.usersRepository.findOne(id)
  }

  create(data: CreateUserDto) {
    return this.usersRepository.create(data)
  }
}
