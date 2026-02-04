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
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch<IDispatch>();
  const userId = "user_id_ejemplo"; 
  
  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  //const asignaturas = [];
  const asignaturas =  useSelector((state: IRootState) => state.asignaturaModel.asignaturas);
  const user= useSelector((state: IRootState) => state.userModel.user);
  const loading = useSelector((state: IRootState) => state.asignaturaModel.loading);
  const NombreUsuario = user?.nombre || "Cargando...";
  const ApellidosUsuario = user?.apellidos || "";
  const [ value, setValue ] = useState("");
  const [formValues, setFormValues] = useState({
    nombre: "",
    descripcion: ""
  });
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState<string | null>(null);

  const navigate = useNavigate();

  console.log(user);

  useEffect(() => {
    if (userId) {
      dispatch.userModel.getUser(userId);
    }
  }, [dispatch, userId]);

  useEffect(() => {
    dispatch.asignaturaModel.getAsignaturas(userId);
  }, [dispatch]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formValues.nombre.trim()) {
      console.error("El nombre es obligatorio");
      return;
    }

    const payload = {
      user_id: userId,
      nombre: formValues.nombre,
      descripcion: formValues.descripcion || ""
    };

    try {
      await dispatch.asignaturaModel.createAsignatura(payload);
      await dispatch.asignaturaModel.getAsignaturas(userId);
      setFormValues({ nombre: "", descripcion: "" });
      onCloseAdd();
    } catch (e) {
      console.error("Error al crear la asignatura", e);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch.asignaturaModel.deleteAsignatura(selectedAsignaturaId!);
      await dispatch.asignaturaModel.getAsignaturas(userId);
      setFormValues({ nombre: "", descripcion: "" });
      onCloseDelete();
      onCloseEdit();
    } catch (e) {
      console.error("Error al eliminar la asignatura", e);
    }
  };

  const handleEdit = async () => {
    if (!formValues.nombre.trim() || !selectedAsignaturaId) {
      console.error("El nombre es obligatorio");
      return;
    }

    const payload = {
      id: selectedAsignaturaId,
      nombre: formValues.nombre,
      descripcion: formValues.descripcion || ""
    };

    try {
      await dispatch.asignaturaModel.updateAsignatura(payload);
      await dispatch.asignaturaModel.getAsignaturas(userId);
      setFormValues({ nombre: "", descripcion: "" });
      setSelectedAsignaturaId(null);
      onCloseEdit();
    } catch (e) {
      console.error("Error al actualizar la asignatura", e);
    }
  };

  const handleOpenEdit = (asignatura: any) => {
    setSelectedAsignaturaId(asignatura.id);
    setFormValues({
      nombre: asignatura.nombre,
      descripcion: asignatura.descripcion || ""
    });
    onOpenEdit();
  };

  const handleCloseEdit = () => {
    setFormValues({ nombre: "", descripcion: "" });
    setSelectedAsignaturaId(null);
    onCloseEdit();
  };

  const handleCloseAdd = () => {
    setFormValues({ nombre: "", descripcion: "" });
    onCloseAdd();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  };

  const filteredAsignaturas = asignaturas.filter((asignatura) => 
    asignatura.nombre.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <Box bg="white" w="100%" minH="100vh"> 
      <NavBar></NavBar>   
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
            Bienvenido {NombreUsuario} {ApellidosUsuario}
          </Heading>
          {asignaturas.length != 0 ? 
            (<Button 
              colorScheme="blue" 
              borderRadius="full" 
              size={"lg"}
              px={8}
              bg="#0055D4"
              minW={"20%"}
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
        </Flex>
        {asignaturas.length == 0 ? (<></>) : (
          <Flex w="100%" justify="space-between" mt={"-3%"} mb={"1%"}>
            {/* Campo de búsqueda */}
              <InputGroup width="250px" >
                <InputRightElement pointerEvents="none">
                  <InlineIcon icon="ic:outline-search" style={{ color: "#1a202c", fontSize: "20px" }} />
                </InputRightElement>
                <Input
                  placeholder="Búsqueda"
                  size="md"
                  borderRadius="18px"
                  bgColor={"#e9e9e9"}
                  value={value}
                  onChange={handleChange}
                  borderColor="white"
                  fontSize="14px"
                  _placeholder={{ color: "gray.500" }}
                  _focus={{ borderColor: "#0055D4", boxShadow: "none" }}
                />
              </InputGroup>

              <Button 
                colorScheme="blue" 
                borderRadius="full" 
                size={"lg"}
                minW={"20%"}
                px={8}
                bg="#0055D4"
                _hover={{ bg: "#0041a3" }}
                onClick={onOpenAdd}
              >
                Ver Gráfica de las Asignaturas
              </Button>
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
                      <Tr key={asignatura.id || index} bgColor={"#d9d9d9"} _hover={{ bg: "#e9e9e9" }}>
                        <Td
                          w="70%"
                          p={2}
                          borderRight="1px solid #edf2f7"
                          textAlign="center"
                        >
                          <Text fontSize="lg">{asignatura.nombre}</Text>
                          {asignatura.descripcion != null ? (<Text fontSize="small" whiteSpace="pre-wrap">{asignatura.descripcion}</Text>) : (<></>)}
                        </Td>

                        <Td minW="200px" textAlign="center" p={2} borderRight="1px solid #edf2f7">
                          <Flex justify={"space-between"}>
                            <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={() => handleOpenEdit(asignatura)}
                              _hover={{ bg:  "#aaaaaa"}}
                            >
                              Editar
                            </Button>

                            <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={() => navigate(`/asignatura/${asignatura.id}`)}
                              _hover={{ bg:  "#aaaaaa"}}
                            >
                              Acceder
                            </Button>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          )
        }

        <Modal isOpen={isOpenEdit} onClose={handleCloseEdit} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"}>Modifica la asignatura</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={5} py={4}>
        
                  {/* Campo: Nombre */}
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Nombre de la asignatura</FormLabel>
                    <Input
                      id="nombre" 
                      name="nombre" 
                      value={formValues.nombre}
                      onChange={handleFormChange}
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
                      value={formValues.descripcion}
                      onChange={handleFormChange}
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
                <Button 
                  colorScheme='blue' 
                  bgColor={"red"}
                  _hover={{bg:"red"}}
                  mr={3}
                  onClick={onOpenDelete}
                  isDisabled={!formValues.nombre.trim()}
                >
                  Eliminar asignatura
                </Button>

                <Button 
                  colorScheme='blue' 
                  mr={3}
                  onClick={handleEdit}
                  isDisabled={!formValues.nombre.trim()}
                >
                  Guardar Cambios
                </Button>
              </ModalFooter>
            </ModalContent>

        </Modal>

        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"}>¿Estás seguro/a de que quieres eliminar la asignatura?</ModalHeader>
              <ModalCloseButton />
              <ModalBody >
                <Flex justifyContent={"center"}>
                  <Button 
                    colorScheme='blue' 
                    bgColor={"red"}
                    mr={3}
                    onClick={handleDelete}
                    isDisabled={!formValues.nombre.trim()}
                    _hover={{bgcolor:"red"}}
                    //borderRadius={}
                  >
                    Eliminar asignatura
                  </Button>

                  <Button 
                    colorScheme='blue' 
                    mr={3}
                    onClick={onCloseDelete}
                    isDisabled={!formValues.nombre.trim()}
                  >
                    Cancelar
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>

        </Modal>
          <Modal isOpen={isOpenAdd} onClose={handleCloseAdd} isCentered>
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
                      value={formValues.nombre}
                      onChange={handleFormChange}
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
                      value={formValues.descripcion}
                      onChange={handleFormChange}
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
                <Button 
                  colorScheme='blue' 
                  mr={3}
                  onClick={handleSubmit}
                  isDisabled={!formValues.nombre.trim()}
                >
                  Añadir Asignatura
                </Button>
              </ModalFooter>
            </ModalContent>
        </Modal>

      </Container>
    </Box>
  );
}