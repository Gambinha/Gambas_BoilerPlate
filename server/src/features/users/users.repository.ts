import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } })
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }

  create(data: CreateUserDto) {
    return this.prisma.user.create({ data })
  }
}
