import { type Request, type Response } from "express";
import * as eventoService from "../services/evento.services.ts";

export async function createEvento(req: Request, res: Response){
    try{
        const data = {
            ...req.body,
        };
        const evento = await eventoService.createEvento(data);
        res.status(201).json(evento);
    }catch(error)
    {
        console.error("Error al crear el evento", error);
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
        res.status(500).json({ error: "Error al obtener los evento" });
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
        res.status(500).json({ error: "Error al obtener el evento" });
    }
}

export async function deleteEvento(req: Request, res: Response){
    try{
        const id = req.params.id;
        const evento= await eventoService.deleteEvento(id);
        res.json({ evento, message: "Evento eliminado correctamente" });
    }catch(error)
    {
        console.error("Error al eliminar el historico", error);
        res.status(500).json({ error: "Error al eliminar el evento" });
    }
}