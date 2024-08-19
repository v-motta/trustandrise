import { hash } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function createAccount(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['auth'],
        summary: 'Create a new user',
        body: z.object({
          name: z.string().min(1).max(255),
          email: z.string().email(),
          username: z.string().min(3).max(30),
          telephone: z.string().min(1),
          birthdate: z.coerce.date(),
          password: z.string().min(8).max(255),
        }),
        response: {
          201: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { name, email, username, telephone, birthdate, password } = req.body

      const userExists = await prisma.user.findMany({
        where: { OR: [{ email }, { username }] },
      })

      if (userExists.length > 0) {
        throw new BadRequestError(
          'Usuário já existe com esse email ou nome de usuário',
        )
      }

      const passwordHash = await hash(password, 10)

      await prisma.user.create({
        data: {
          name,
          username,
          telephone,
          birthdate,
          email,
          password: passwordHash,
        },
      })

      res.send({ message: 'User created successfully' })
    },
  )
}
