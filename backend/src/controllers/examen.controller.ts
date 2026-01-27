import { type Request, type Response } from "express";
import * as examenService from "../services/examen.services.ts";

export async function createExamen(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const parte = await examenService.createExamen(data);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear el examen", error);
        res.status(500).json({ error: "Error al crear el examen" });
    }
}

export async function getAllExamenes(req: Request, res: Response){
    try{
        const id = req.params.idAsign;
        const examenes = await examenService.getAllExamenes(id);
        res.json(examenes);
    }catch(error)
    {
        console.error("Error al obtener todos los examenes", error);
        res.status(500).json({ error: "Error al obtener todos los examenes" });
    }
}

export async function getExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        // console.log("Este es el id del examen"+id);
        const examen = await examenService.getExamen(id);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al obtener el examen", error);
        res.status(500).json({ error: "Error al obtener el examen" });
    }
}

export async function updateExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.updateExamen(id, req.body);
        res.json(examen);
    }catch(error)
    {
        console.error("Error al actualizar el examen", error);
        res.status(500).json({ error: "Error al actualizar el examen" });
    }
}

export async function deleteExamen(req: Request, res: Response){
    try{
        const id = req.params.id;
        const examen = await examenService.deleteExamen(id);
        res.json(examen).json({ message: "Examen eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el examen", error);
        res.status(500).json({ error: "Error al eliminar el examen" });
    }
}