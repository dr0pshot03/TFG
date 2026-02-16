import { type Request, type Response } from "express";
import * as userService from "../services/user.service.ts";

interface ClerkWebhookEvent {
    type: string;
    data: {
        id?: string;
        first_name?: string | null;
        last_name?: string | null;
        primary_email_address_id?: string | null;
        email_addresses?: Array<{
            id?: string;
            email_address?: string;
        }>;
    };
}

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

export async function handleClerkWebhook(req: Request, res: Response) {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return res.status(500).json({ error: "CLERK_WEBHOOK_SECRET no configurado" });
    }

    const svixId = req.headers["svix-id"];
    const svixTimestamp = req.headers["svix-timestamp"];
    const svixSignature = req.headers["svix-signature"];

    if (!svixId || !svixTimestamp || !svixSignature) {
        return res.status(400).json({ error: "Cabeceras de webhook inválidas" });
    }

    try {
        const { Webhook } = await import("svix");
        const payload = req.body instanceof Buffer ? req.body.toString("utf8") : JSON.stringify(req.body);

        const event = new Webhook(webhookSecret).verify(payload, {
            "svix-id": String(svixId),
            "svix-timestamp": String(svixTimestamp),
            "svix-signature": String(svixSignature),
        }) as ClerkWebhookEvent;

        if (event.type === "user.created" || event.type === "user.updated") {
            if (!event.data?.id) {
                return res.status(400).json({ error: "Evento sin id de usuario" });
            }

            await userService.upsertUserFromClerkWebhook({
                id: event.data.id,
                first_name: event.data.first_name,
                last_name: event.data.last_name,
                primary_email_address_id: event.data.primary_email_address_id,
                email_addresses: event.data.email_addresses,
            });
        }

        if (event.type === "user.deleted" && event.data?.id) {
            await userService.deleteUserByClerkId(event.data.id);
        }

        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error procesando webhook de Clerk", error);
        return res.status(400).json({ error: "Webhook inválido" });
    }
}