import { clerkClient } from "@clerk/express";
import prisma from "./prisma.ts";

export interface usuario{
    idClerk: string;
    nombre: string;
    apellidos: string;
    email: string;
}

interface ClerkEmailAddress {
  id?: string;
  email_address?: string;
}

interface ClerkUserWebhookData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
}

function getPrimaryEmail(data: ClerkUserWebhookData): string | null {
  if (!data.email_addresses?.length) {
    return null;
  }

  if (data.primary_email_address_id) {
    const primary = data.email_addresses.find(
      (item) => item.id === data.primary_email_address_id,
    );
    if (primary?.email_address) {
      return primary.email_address;
    }
  }

  return data.email_addresses[0]?.email_address ?? null;
}

export async function upsertUserFromClerkWebhook(data: ClerkUserWebhookData) {
  const email = getPrimaryEmail(data);

  return await prisma.usuario.upsert({
    where: { clerkId: data.id },
    create: {
      clerkId: data.id,
      nombre: data.first_name ?? null,
      apellidos: data.last_name ?? null,
      email,
    },
    update: {
      nombre: data.first_name ?? null,
      apellidos: data.last_name ?? null,
      email,
    },
  });
}

export async function deleteUserByClerkId(id: string) {
  const existingUser = await prisma.usuario.findUnique({
    where: { clerkId: id },
  });

  if (!existingUser) {
    return null;
  }

  return await prisma.usuario.delete({
    where: { clerkId: id },
  });
}

export async function createUser(data: usuario) {
  try {
    return await prisma.usuario.create({
      data: {
        clerkId: data.idClerk, // El ID de Clerk (user_2N...)
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
  return await prisma.usuario.findUnique({
    where: { clerkId: id }
  });
}

// UPDATE: Sincronización Doble (BD Local + Clerk)
export async function updateUser(id: string, data: usuario) {
  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { clerkId: id },
      data: {
        nombre: data.nombre,
        apellidos: data.apellidos,
      },
    });

    // Actualizamos en clerk
    await clerkClient.users.updateUser(id, {
      firstName: data.nombre,
      lastName: data.apellidos,
      primaryEmailAddressID: data.email,
    });

    return usuarioActualizado;
  } catch (error) {
    console.error("Error actualizando usuario:", error);
    throw new Error("Error al actualizar usuario (Sync fallido)");
  }
}

export async function deleteUser(id: string) {
  try {
    await clerkClient.users.deleteUser(id);

    return await prisma.usuario.delete({
      where: { clerkId: id },
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw new Error("Error al eliminar usuario");
  }
}