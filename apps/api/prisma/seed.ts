import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  await prisma.user.deleteMany()
  await prisma.token.deleteMany()
  await prisma.account.deleteMany()

  await prisma.user.createMany({
    data: Array.from({ length: 5 }, () => ({
      name: faker.person.fullName(),
      username: faker.internet.userName(),
      telephone: faker.phone.number(),
      birthdate: faker.date.birthdate({ min: 11, max: 23, mode: 'age' }),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })),
  })
}

seed().then(() => {
  console.log('Seeding completed successfully')
})
