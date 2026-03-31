import { type Request, type Response } from "express";
import * as sesionService from "../services/sesion.services";

export async function createSesion(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const parte = await sesionService.createSesion(data);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear la sesion", error);
        res.status(500).json({ error: "Error al crear la sesion" });
    }
}

export async function getAllSesiones(req: Request, res: Response){
    try{
        const id = req.params.idAsign;
        const sesiones = await sesionService.getAllSesiones(id);
        res.json(sesiones);
    }catch(error)
    {
        console.error("Error al obtener todos las sesiones", error);
        res.status(500).json({ error: "Error al obtener todos las sesiones" });
    }
}

export async function getSesion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await sesionService.getSesion(id);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al obtener la sesion", error);
        res.status(500).json({ error: "Error al obtener la sesion" });
    }
}

export async function updateSesion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await sesionService.updateSesion(id, req.body);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al actualizar la sesion", error);
        res.status(500).json({ error: "Error al actualizar la sesion" });
    }
}

export async function deleteSesion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await sesionService.deleteSesion(id);
        res.json({ sesion, message: "Sesion eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar la sesion", error);
        res.status(500).json({ error: "Error al eliminar la sesion" });
    }
}