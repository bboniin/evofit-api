import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken'
import authConfig from "./../utils/auth"
import prismaClient from '../prisma';

interface Payload {
  sub: string;
}

export async function isAuthenticated(req: Request, res: Response, next: NextFunction) {

  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ message: 'Token não enviado' });
  }

  const [, token] = authToken.split(' ');

  try {

    const { sub } = verify(
      token,
      authConfig.jwt.secret,
    ) as Payload

    req.userId = sub;

    const user = await prismaClient.user.findUnique({
      where: {
        id: req.userId
      }
    })

    if (!user) {
      return res.status(401).json({ message: 'Usuário não existe' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Internal server Error' });
  }

}
