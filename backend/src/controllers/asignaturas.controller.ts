import { type Request, type Response } from "express";
import * as asignaturaService from "../services/asignaturas.services.ts";

export async function createAsignatura(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        await asignaturaService.createAsignatura(data);
        res.status(200).json({ message: "Se ha creado correctamente la asignatura" });
    }catch(error)
    {
        console.error("Error al crear la asignatura", error);
        const message = error instanceof Error ? error.message : "Error al crear la asignatura";
        if (message.includes("user_id") || message.includes("El user_id es obligatorio")) {
            res.status(400).json({ error: message });
        } else {
            res.status(500).json({ error: "Error al crear la asignatura" });
        }
    }
}

export async function getAllAsignaturas(req: Request, res: Response){
    try{
        const id = req.params.userId;
        const asignaturas = await asignaturaService.getAllAsignaturas(id);
        res.json(asignaturas);
    }catch(error)
    {
        console.error("Error al obtener las asignaturas", error);
        const message = error instanceof Error ? error.message : "Error al obtener las asignaturas por usuario";
        if (message.includes("userId") && message.includes("obligatorio")) {
            res.status(400).json({ error: message });
        } else {
            res.status(500).json({ error: "Error al obtener las asignatura por usuario" });
        }
    }
}

export async function getAsignatura(req: Request, res: Response){
    try{
        const id = req.params.id;
        const asignatura = await asignaturaService.getAsignatura(id);
        res.json(asignatura);
    }catch(error)
    {
        console.error("Error al obtener la asignatura", error);
        const message = error instanceof Error ? error.message : "Error al obtener la asignatura por id";
        if (message.includes("id") && message.includes("obligatorio")) {
            res.status(400).json({ error: message });
        } else if (message.includes("no encontrada")) {
            res.status(404).json({ error: message });
        } else {
            res.status(500).json({ error: "Error al obtener la asignatura por id" });
        }
    }
}

export async function updateAsignatura(req: Request, res: Response){
    try{
        const id = req.params.id;
        // console.log("Este es el id" + id)
        await asignaturaService.updateAsignatura(id, req.body);
        
        res.status(200).json({ message: "Se ha actualizado correctamente la asignatura"});
    }catch(error)
    {
        console.error("Error al actualizar la asignatura por id", error);
        const message = error instanceof Error ? error.message : "Error al actualizar la asignatura";
        if (message.includes("id") && message.includes("obligatorio")) {
            res.status(400).json({ error: message });
        } else if (message.includes("no encontrada")) {
            res.status(404).json({ error: message });
        } else {
            res.status(500).json({ error: "Error al actualizar la asignatura" });
        }
    }
}

export async function deleteAsignatura(req: Request, res: Response){
    try{
        const {id} = req.params;
        await asignaturaService.deleteAsignatura(id);
        res.status(200).json({ message: "Se ha eliminado correctamente la asignatura" });
    }catch(error)
    {
        console.error("Error al eliminar la asignatura", error);
        const message = error instanceof Error ? error.message : "Error al eliminar la asignatura";
        if (message.includes("id") && message.includes("obligatorio")) {
            res.status(400).json({ error: message });
        } else if (message.includes("no encontrada")) {
            res.status(404).json({ error: message });
        } else {
            res.status(500).json({ error: "Error al eliminar la asignatura" });
        }
    }
}