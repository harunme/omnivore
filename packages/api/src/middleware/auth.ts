import express from 'express'
import * as jwt from 'jsonwebtoken'
import { env } from '../env'
import { Claims } from '../resolvers/types'

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = (req.cookies?.auth || req.headers?.authorization) as string
  const claims = jwt.decode(token) as Claims
  console.log(token)
  if (!token || !jwt.verify(token, env.server.jwtSecret)) {
    return res.status(401).send({ errorCode: 'UNAUTHORIZED' })
  }
  req.uid = claims.uid
  return next()
}

export default authMiddleware
