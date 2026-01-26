import { type Request, type Response } from "express";
import * as partesExamenService from "../services/examen.services.ts";

export async function createExamen(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const parte = await partesExamenService.createExamen(data);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear el examen", error);
        res.status(500).json({ error: "Error al crear el examen" });
    }
}

export async function getAllExamenes(req: Request, res: Response){
    try{
        const id = req.body.idAsign;
        const examenes = await partesExamenService.getAllExamenes(id);
        res.json(examenes);
    }catch(error)
    {
        console.error("Error al obtener todos los examenes", error);
        res.status(500).json({ error: "Error al obtener todos los examenes" });
    }
}

export async function getExamen(req: Request, res: Response){
    try{
        const id = req.body.id;
        const examen = await partesExamenService.getExamen(id);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al obtener el examen", error);
        res.status(500).json({ error: "Error al obtener el examen" });
    }
}

export async function updateExamen(req: Request, res: Response){
    try{
        const id = req.body.id;
        const examen = await partesExamenService.updateExamen(id, req.body);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el examen", error);
        res.status(500).json({ error: "Error al actualizar el examen" });
    }
}

export async function deleteExamen(req: Request, res: Response){
    try{
        const id = req.body.id;
        await partesExamenService.deleteExamen(id);
        res.status(200);
    }catch(error)
    {
        console.error("Error al eliminar el examen", error);
        res.status(500).json({ error: "Error al eliminar el examen" });
    }
}