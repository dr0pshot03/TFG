import { type Request, type Response } from "express";
import * as userService from "../services/user.service.ts";

export async function createUser(req: Request, res: Response){
    try{
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    }catch(error)
    {
        console.error("Error al crear el usuario", error);
        res.status(500).json({ error: "Error al crear el usuario" });
    }
}

export async function getUser(req: Request, res: Response){
    try{
        const id = req.params.idClerk;
        const user = await userService.getUser(id);
        res.json(user);
    }catch(error)
    {
        console.error("Error al obtener el usuario", error);
        res.status(500).json({ error: "Error al obtener el usuario" });
    }
}

export async function updateUser(req: Request, res: Response){
    try{
        const id = req.params.idClerk;
        const user = await userService.updateUser(id, req.body);
        res.json(user);
    }catch(error)
    {
        console.error("Error al actualizar el usuario", error);
        res.status(500).json({ error: "Error al actualizar el usuario" });
    }
}

export async function deleteUser(req: Request, res: Response){
    try{
        const id = req.params.idClerk;
        const user = await userService.deleteUser(id);
        res.json(user).json({ message: "Usuario eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el usuario", error);
        res.status(500).json({ error: "Error al eliminar el usuario" });
    }
}