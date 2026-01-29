import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { 
  Box, Container, Flex, HStack, Icon, Text, Spacer, Heading, Button, VStack, SimpleGrid, useDisclosure, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Image,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Td,
  InputGroup,
  InputLeftElement,
  InputRightElement,

} from "@chakra-ui/react";
import { InlineIcon } from "@iconify/react";
import { FiBarChart2, FiSettings, FiLogOut } from "react-icons/fi";
import { IRootState, IDispatch } from "../../store/store"; 

export default function Dashboard() {
  const dispatch = useDispatch<IDispatch>();
  const userId = "user_id_ejemplo"; 
  
  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure();
  const { isOpen: isOpenAccess, onOpen: onOpenAccess, onClose: onCloseAccess } = useDisclosure();
  //const asignaturas = [];
  const asignaturas =  useSelector((state: IRootState) => state.asignaturaModel.asignaturas);
  const user= useSelector((state: IRootState) => state.userModel.user);
  const loading = useSelector((state: IRootState) => state.asignaturaModel.loading);
  const NombreUsuario = user?.nombre || "Cargando...";
  const [ value, setValue ] = useState("");

  console.log(user);

  useEffect(() => {
    if (userId) {
      dispatch.userModel.getUser(userId);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch.asignaturaModel.getAsignaturas(userId);
  }, [dispatch]);

  const initialValues = {
    nombre: "", 
    descripcion: ""
  };

  const handleSubmit = async (values: any, { resetForm }: { resetForm: () => void }) => {
    /*const payload = {
      user_id: selectedUser!,
      nombre: values.nombre,
      descripcion: values.desc ? values.desc || null
    }*/

    try{

    } catch (e) {
      console.error("Error al guardar cambios", e);
    }

  };


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  }
  const filteredAsignaturas = asignaturas.filter((asignatura) => 
    asignatura.nombre.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Box bg="white" w="100%" minH="100vh"> 
      
      {/* --- 1. NAVBAR SUPERIOR --- */}
      <Box borderBottom="1px" borderColor="gray.200" py={4}>
        <Container maxW="full"> 
          <Flex alignItems="center">
            <HStack spacing={2}>
              <Image src="Logo.png" alt="Logo" w={"20%"}/>
            </HStack>

            <Spacer />
            <HStack spacing={6}>
              <Icon as={FiSettings} w={5} h={5} cursor="pointer" />
              <Icon as={FiLogOut} w={5} h={5} color="red.400" cursor="pointer" />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <Container maxW="full" py={10}>
        
        {/* Encabezado: Saludo y Botón Principal */}
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "start", md: "center" }}
          mb={10}
        >
          <Heading as="h1" size="lg" mb={{ base: 4, md: 0 }}>
            Bienvenido {NombreUsuario}
          </Heading>
          {asignaturas.length != 0 ? 
            (<Button 
              colorScheme="blue" 
              borderRadius="full" 
              px={8}
              bg="#0055D4"
              _hover={{ bg: "#0041a3" }}
              onClick={onOpenAdd}
            >
              Añadir asignatura
            </Button>) : (<></>)}
        </Flex>

        {/* Sección: Tus Asignaturas */}
        <Flex mb={20} justify="space-between" >
          <Box>
            <Heading as="h3" size="md" mb={2}>
              Tus Asignaturas
            </Heading>
            <Text color="gray.500">
              Aquí encontrarás todas las asignaturas que hayas añadido
            </Text>
          </Box>
          <Button 
            colorScheme="blue" 
            borderRadius="full" 
            px={8}
            bg="#0055D4"
            _hover={{ bg: "#0041a3" }}
            onClick={onOpenAdd}
          >
            Ver Gráfica de las Asignaturas
          </Button>
        </Flex>
        {asignaturas.length == 0 ? (<></>) : (
          <Flex w="90%" justify="flex-start" mt={"-3%"} mb={"1%"}>
                  {/* Campo de búsqueda */}
                    <InputGroup width="250px" >
                      <InputRightElement pointerEvents="none">
                        <InlineIcon icon="ic:outline-search" style={{ color: "#1a202c", fontSize: "20px" }} />
                      </InputRightElement>
                      <Input
                        placeholder="Búsqueda"
                        size="md"
                        borderRadius="18px"
                        bgColor={"#d9d9d9"}
                        value={value}
                        onChange={handleChange}
                        borderColor="white"
                        fontSize="14px"
                        _placeholder={{ color: "gray.500" }}
                        _focus={{ borderColor: "#0055D4", boxShadow: "none" }}
                      />
                    </InputGroup>
              </Flex>
        )}

        {asignaturas.length == 0 ?
          (<VStack spacing={4} py={10}>
            <Heading size="md" textAlign="center">
              Ups, parece que tu lista de asignaturas está vacía.
            </Heading>
            <Text color="gray.500" fontSize="sm">
              ¡Prueba a añadir una!
            </Text>
            
            <Box pt={4}>
              <Button 
                colorScheme="blue" 
                size="lg" 
                borderRadius="full" 
                px={10}
                bg="#0055D4"
                onClick={onOpenAdd}
                _hover={{ bg: "#0041a3" }}
              >
                Añadir asignatura
              </Button>
            </Box>
          </VStack>
          ) : 
          (
            <VStack>
              <TableContainer w={"100%"}>
                <Table>
                  <Thead>
                    <Tr bg="shade.2" w="100%">
                      <Td borderTopLeftRadius="12px" color="shade.1" textAlign="center" w={"85%"} fontWeight={"bold"}> Nombre</Td>
                      <Td borderTopRightRadius="12px" color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"}> Acciones</Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAsignaturas.map((asignatura, index) => (
                      <Tr key={asignatura.id || index} bgColor={"#d9d9d9"} _hover={{ bg: "gray.100" }}>
                        <Td
                          w="70%"
                          p={2}
                          borderRight="1px solid #edf2f7"
                          textAlign="center"
                        >
                          <Text fontSize="sm">{asignatura.nombre}</Text>
                        </Td>

                        <Td minW="200px" textAlign="center" p={2} borderRight="1px solid #edf2f7">
                          <Button 
                            colorScheme="blue" 
                            size="sm"
                            w={"50%"} 
                            borderRadius="full" 
                            bg="#aaaaaa"
                            onClick={onOpenAccess}
                            _hover={{ bg: "#0041a3" }}
                          >
                            Acceder
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          )
        }

        <Modal isOpen={isOpenAdd} onClose={onCloseAdd}>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"}>Añadir nueva asignatura</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={5} py={4}>
        
                  {/* Campo: Nombre */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Nombre de la asignatura</FormLabel>
                    <Input
                      id="nombre" 
                      name="nombre" 
                      placeholder="Introduce el nombre de la asignatura" 
                      size="lg"
                      borderRadius="xl"    
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                </VStack>
                <VStack py={4}>
                  <FormControl>
                    <FormLabel fontWeight="semibold">Descripción</FormLabel>
                    <Textarea
                      id="descripcion" 
                      name="descripcion" 
                      placeholder="Introduce la descripción de la asignatura" 
                      size="lg"
                      h={200}        
                      borderRadius="xl"    
                      focusBorderColor="blue.500"
                    />
                  </FormControl>

                </VStack>
              </ModalBody>

              <ModalFooter justifyContent={"center"}>
                <Button colorScheme='blue' mr={3}>
                  Añadir Asignatura
                </Button>
              </ModalFooter>
            </ModalContent>

        </Modal>

      </Container>
    </Box>
  );
}