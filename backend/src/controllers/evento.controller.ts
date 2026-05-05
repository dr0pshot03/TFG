import { type Request, type Response } from "express";
import * as eventoService from "../services/evento.services.js";

export async function createEvento(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        await eventoService.createEvento(data);
        res.status(201).json({ message: "Se ha creado correctamente el evento" });
    }catch(error)
    {
        console.error("Error al crear el evento", error);

        if (error instanceof Error && error.message === "Sesión no encontrada") {
            res.status(404).json({ error: "Sesión no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al crear el evento" });
    }
}

export async function getAllEventos(req: Request, res: Response){
    try{
        const idSesion = req.params.idSesion;
        const evento = await eventoService.getAllEvento(idSesion);
        res.json(evento);
    }catch(error)
    {
        console.error("Error al obtener los evento", error);

        if (error instanceof Error && error.message === "Sesión no encontrada") {
            res.status(404).json({ error: "Sesión no encontrada" });
            return;
        }

        res.status(500).json({ error: "Error al obtener los eventos" });
    }
}

export async function getEvento(req: Request, res: Response){
    try{
        const id = req.params.id;
        const evento = await eventoService.getEvento(id);
        res.json(evento);
    }catch(error)
    {
        console.error("Error al obtener el evento", error);

        if (error instanceof Error && error.message === "Evento no encontrado") {
            res.status(404).json({ error: "Evento no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al obtener el evento" });
    }
}

export async function deleteEvento(req: Request, res: Response){
    try{
        const id = req.params.id;
        const evento= await eventoService.deleteEvento(id);
        res.json({ evento, message: "Se ha eliminado correctamente el evento" });
    }catch(error)
    {
        console.error("Error al eliminar el evento", error);

        if (error instanceof Error && error.message === "Evento no encontrado") {
            res.status(404).json({ error: "Evento no encontrado" });
            return;
        }

        res.status(500).json({ error: "Error al eliminar el evento" });
    }
}