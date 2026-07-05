import jwt from 'jsonwebtoken';
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { TOKEN } from '../../configs/callToken';

const prisma = new PrismaClient();

export async function getListClasses(req: Request, res: Response) {
    try {
        const cookies = req.cookies;
        const token = cookies['ac_tk'] as string;
        console.log("Access Token", token);
        // const userData = jwt.verify(spiltToken, TOKEN.JWT as string)
        const params = req.query;
        // console.log(userData, params)
        return res.status(200).json({ message: "OK" })
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error", error: err })
    }
}