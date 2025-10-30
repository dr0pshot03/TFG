import { type Request, type Response } from "express";
import * as asignaturaService from "../services/asignaturas.services.js";

export async function createAsignatura(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const asignatura = await asignaturaService.createAsignatura(data);
        res.status(201).json(asignatura);
    }catch(error)
    {
        console.error("Error al crear la asignatura", error);
        res.status(500).json({ error: "Error al crear la asignatura" });
    }
}

export async function getAllAsignaturas(req: Request, res: Response){
    try{
        const id = req.body.userId;
        const asignaturas = await asignaturaService.getAllAsignaturas(id);
        res.json(asignaturas);
    }catch(error)
    {
        console.error("Error al obtener las asignaturas", error);
        res.status(500).json({ error: "Error al obtener las asignaturas" });
    }
}

export async function getAsignatura(req: Request, res: Response){
    try{
        const id = req.body.id;
        const asignatura = await asignaturaService.getAsignatura(id);
        res.json(asignatura);
    }catch(error)
    {
        console.error("Error al obtener la asignatura", error);
        res.status(500).json({ error: "Error al obtener la asignatura" });
    }
}

export async function updateAsignatura(req: Request, res: Response){
    try{
        const asignatura = await asignaturaService.updateAsignatura(req.params.id, res);
        res.json(asignatura);
    }catch(error)
    {
        console.error("Error al actualizar la asignatura", error);
        res.status(500).json({ error: "Error al actualizar la asignatura" });
    }
}

export async function deleteAsignatura(req: Request, res: Response){
    try{
        const id = req.body.id;
        await asignaturaService.deleteAsignatura(id);
        res.status(200);
    }catch(error)
    {
        console.error("Error al eliminar la asignatura", error);
        res.status(500).json({ error: "Error al eliminar la asignatura" });
    }
}