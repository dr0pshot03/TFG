import { clerkClient } from "@clerk/express";
import prisma from "./prisma.ts";

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
  return await prisma.usuario.findUnique({
    where: { clerkId: id }
  });
}

export async function updateUser(id: string, data: Partial<usuario>) {
  try {
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
    await clerkClient.users.deleteUser(id);

    return await prisma.usuario.delete({
      where: { clerkId: id },
    });
  } catch (error) {
    console.error("Error eliminando usuario:", error);
    throw new Error("Error al eliminar usuario");
  }
}