import { type Request, type Response } from "express";
import * as sesionService from "../services/sesion.services.js";

export async function createSesion(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        await sesionService.createSesion(data);
        res.status(201).json({"message" : "Se ha creado correctamente la sesión"});
    }catch(error)
    {
        console.error("Error al crear la sesion", error);

        if (error instanceof Error && error.message === "Examen no encontrado") {
            res.status(404).json({ error: "Examen no encontrado" });
            return;
        }

        if (error instanceof Error && error.message === "Usuario no encontrado") {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al crear la sesion" });
    }
}

export async function getSesionbyExamen(req: Request, res: Response){
    try{
        const idExamen = req.params.idExamen;
        const sesion = await sesionService.getSesionbyExamen(idExamen);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al obtener la sesion por examen", error);

        if (error instanceof Error && error.message === "Examen no encontrado") {
            res.status(404).json({ error: "Examen no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al obtener la sesion por examen" });
    }
}

export async function getSesionbyUser(req: Request, res: Response){
    try{
        const idUser = req.params.idUser;
        const sesion = await sesionService.getSesionbyUser(idUser);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al obtener la sesion por usuario", error);

        if (error instanceof Error && error.message === "Usuario no encontrado") {
            res.status(404).json({ error: "Usuario no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al obtener la sesion por usuario" });
    }
}

export async function getSesionbyId(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await sesionService.getSesionbyId(id);
        res.json(sesion);
    }catch(error)
    {
        console.error("Error al obtener la sesion por id", error);

        if (error instanceof Error && error.message === "Sesion no encontrada") {
            res.status(404).json({ error: "Sesion no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al obtener la sesion por id" });
    }
}

export async function updateSesion(req: Request, res: Response){
    try{
        const id = req.params.id;
        const sesion = await sesionService.updateSesion(id, req.body);
        res.status(200).json({"message" : "Se ha actualizado correctamente la sesión"});
    }catch(error)
    {
        console.error("Error al actualizar la sesion", error);

        if (error instanceof Error && error.message === "Sesion no encontrada") {
            res.status(404).json({ error: "Sesion no encontrada" });
            return;
        }

        if (error instanceof Error && error.message === "No hay campos para actualizar") {
            res.status(400).json({ error: "No hay campos para actualizar" });
            return;
        }

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

        if (error instanceof Error && error.message === "Sesion no encontrada") {
            res.status(404).json({ error: "Sesion no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al eliminar la sesion" });
    }
}