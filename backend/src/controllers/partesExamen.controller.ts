import { type Request, type Response } from "express";
import * as partesExamenService from "../services/partesExamen.services.js";

export async function createParte(req: Request, res: Response){
    try{
        const parte = await partesExamenService.createParte(req.body);
        res.status(201).json(parte);
    }catch(error)
    {
        console.error("Error al crear la parte del examen", error);

        if (error instanceof Error && error.message === "Examen no encontrado") {
            res.status(404).json({ error: "Examen no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al crear la parte del examen" });
    }
}

export async function getAllPartes(req: Request, res: Response){
    try{
        const {idExamen} = req.params;
        const partes = await partesExamenService.getAllPartes(idExamen);
        res.json(partes);
    }catch(error)
    {
        console.error("Error al obtener todas las partes", error);

        if (error instanceof Error && error.message === "Examen no encontrado") {
            res.status(404).json({ error: "Examen no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al obtener todas las partes" });
    }
}

export async function getParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        const parte = await partesExamenService.getParte(idParte);
        res.json(parte);
    }catch(error)
    {
        console.error("Error al obtener la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al obtener la parte del examen" });
    }
}

export async function updateParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        await partesExamenService.updateParte(idParte, req.body);
        res.status(200).json({"message" : "Se ha actualizado correctamente la parte del examen"});
    }catch(error)
    {
        console.error("Error al actualizar la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        if (error instanceof Error && error.message === "No hay campos para actualizar") {
            res.status(400).json({ error: "No hay campos para actualizar" });
            return;
        }

        res.status(500).json({ error: "Error al actualizar la parte del examen" });
    }
}

export async function updateTiempoParte(req: Request, res: Response){
    try{
        const { idParte } = req.params;
        const tiempoExtra = Number(req.body?.tiempoExtra ?? 0);
        await partesExamenService.updateTiempoParte(idParte, tiempoExtra);
        res.status(200).json({"message" : "Se ha actualizado correctamente la duración de la parte del examen"});
    }catch(error)
    {
        console.error("Error al actualizar la duración de la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        if (error instanceof Error && error.message === "La duración no puede ser negativa") {
            res.status(400).json({ error: "La duración no puede ser negativa" });
            return;
        }

        res.status(500).json({ error: "Error al actualizar la duración de la parte del examen" });
    }
}

export async function moveUpParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        const parte = await partesExamenService.moveUpParte(idParte);
        res.status(200).json({"message" : "Se ha movido hacia arriba correctamente la parte"});
    }catch(error)
    {
        console.error("Error al mover hacia arriba la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al mover hacia arriba la parte del examen" });
    }
}

export async function moveDownParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        const parte = await partesExamenService.moveDownParte(idParte);
        res.status(200).json({"message" : "Se ha movido hacia abajo correctamente la parte"});
    }catch(error)
    {
        console.error("Error al mover hacia abajo la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al mover hacia abajo la parte del examen" });
    }
}

export async function deleteParte(req: Request, res: Response){
    try{
        const {idParte} = req.params;
        await partesExamenService.deleteParte(idParte);
        res.status(200).json({ message: "Parte de examen eliminada correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar la parte del examen", error);

        if (error instanceof Error && error.message === "Parte de examen no encontrada") {
            res.status(404).json({ error: "Parte de examen no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al eliminar la parte del examen" });
    }
}