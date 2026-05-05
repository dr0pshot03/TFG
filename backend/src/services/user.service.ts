import { clerkClient } from "@clerk/express";
import prisma from "./prisma.js";

export interface usuario{
    clerkId: string;
    nombre: string;
    apellidos: string;
    email: string;
}

export async function createUser(data: usuario) {
  try {
    return await prisma.usuario.create({
      data: {
        clerkId: data.clerkId,
        email: data.email,
        nombre: data.nombre,
        apellidos: data.apellidos,
      },
    });
  } catch (error) {
    console.error("Error creando el usuario", error);
    throw new Error("No se pudo crear el usuario");
  }
}

export async function getUser(id: string) {
  const user = await prisma.usuario.findUnique({
    where: { clerkId: id }
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return user;
}

export async function updateUser(id: string, data: Partial<usuario>) {
  try {
    const existing = await prisma.usuario.findUnique({ where: { clerkId: id } });

    if (!existing) {
      throw new Error("Usuario no encontrado");
    }

    const clerkUser = await clerkClient.users.getUser(id).catch(() => null);

    const clerkEmail = clerkUser
      ? clerkUser.emailAddresses.find(
          (emailAddress) => emailAddress.id === clerkUser.primaryEmailAddressId
        )?.emailAddress
      : undefined;

    return await prisma.usuario.update({
      where: { clerkId: id },
      data: {
        nombre: clerkUser?.firstName ?? data.nombre,
        apellidos: clerkUser?.lastName ?? data.apellidos,
        email: clerkEmail ?? data.email,
      },
    });
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw new Error("Error al actualizar usuario (Sync fallido)");
  }
}

export async function deleteUser(id: string) {
  try {
    const existing = await prisma.usuario.findUnique({ where: { clerkId: id } });

    if (!existing) {
      throw new Error("Usuario no encontrado");
    }

    await clerkClient.users.deleteUser(id);

    return await prisma.usuario.delete({
      where: { clerkId: id },
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw new Error("Error al eliminar usuario");
  }
}

export async function upsertUserFromClerkWebhook(payload: {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: Array<{ id?: string; email_address?: string }>;
}) {
  try {
    const email = payload.email_addresses?.find(e => e.id === payload.primary_email_address_id)?.email_address ?? undefined;

    return await prisma.usuario.upsert({
      where: { clerkId: payload.id },
      create: {
        clerkId: payload.id,
        nombre: payload.first_name ?? undefined,
        apellidos: payload.last_name ?? undefined,
        email: email,
      },
      update: {
        nombre: payload.first_name ?? undefined,
        apellidos: payload.last_name ?? undefined,
        email: email,
      },
    });
  } catch (error) {
    console.error("Error upsertando usuario desde webhook:", error);
    throw new Error("Error al sincronizar usuario desde webhook");
  }
}

export async function deleteUserByClerkId(id: string) {
  try {
    return await prisma.usuario.delete({ where: { clerkId: id } });
  } catch (error) {
    console.error("Error eliminando usuario por clerkId:", error);
    throw new Error("Error al eliminar usuario por clerkId");
  }
}