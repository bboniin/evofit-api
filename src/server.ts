import express, { Request, Response, NextFunction } from "express";
import 'express-async-errors'
import cors from 'cors'
import { router } from "./routes";

const app = express()

app.use(express.json())

app.use(cors({
    origin: ['http://localhost:3333']
}))

app.use(router)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        return res.status(400).json({ message: err.message })
    }
    return res.status(500).json({
        status: 'error',
        message: 'Internal serve error'
    })
})

app.listen(3333, () => {
    console.log(`rodando v1.0.1`)
}) 