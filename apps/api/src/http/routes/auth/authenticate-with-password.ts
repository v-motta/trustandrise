import { compare } from 'bcryptjs'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { prisma } from '@/lib/prisma'

import { BadRequestError } from '../_errors/bad-request-error'

export async function authenticateWithPassword(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/password',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with email and password',
        body: z.object({
          emailOrUsername: z.string(),
          password: z.string(),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (req, res) => {
      const { emailOrUsername, password } = req.body

      const userExists = await prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
      })

      if (!userExists) {
        throw new BadRequestError('Email, nome de usuário e/ou senha inválidos')
      }

      if (userExists.password === null) {
        throw new BadRequestError(
          'Usuário não possui senha, use login com rede social',
        )
      }

      const isPasswordValid = await compare(password, userExists.password)

      if (!isPasswordValid) {
        throw new BadRequestError('Email, nome de usuário e/ou senha inválidos')
      }

      const token = await res.jwtSign(
        { sub: userExists.id },
        { sign: { expiresIn: '1d' } },
      )

      return res.status(200).send({ token })
    },
  )
}
