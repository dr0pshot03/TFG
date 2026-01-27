import { clerkClient } from "@clerk/express";
import prisma from "./prisma.ts";

export interface usuario{
    idClerk: string;
    nombre: string;
    apellidos: string;
    email: string;
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

export async function deleteUsuario(id: string) {
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