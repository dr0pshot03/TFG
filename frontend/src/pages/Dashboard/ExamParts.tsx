import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useParams } from "react-router-dom";
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
  Select,

} from "@chakra-ui/react";
import { InlineIcon } from "@iconify/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { Feature } from "framer-motion";
import { Convocatoria, CreateExamenInput } from "@/types/examen.type";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch<IDispatch>();
  const userId = "user_id_ejemplo"; 
  const { id } = useParams<{ id: string }>();
  const { idAsign } = useParams<{ idAsign: string }>();
  
  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure();

  const asignatura =  useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examen =  useSelector((state: IRootState) => state.examenModel.selectedExamen);
  const partesExamenes =  useSelector((state: IRootState) => state.parteExamenModel.partesExamenes);
  const [selectedParteExamenId, setSelectedParteExamenId] = useState<string | null>(null);

  let duracionTotalExamen = (examen?.duracion_h || 0) * 60 + (examen?.duracion_m || 0);
  let duracionTotalPartes = partesExamenes.reduce((total, parte) => {
    return total + (parte.duracion_h * 60) + parte.duracion_m;
  }, 0);

  // Convertir minutos totales a horas y minutos
  const horasPartes = Math.floor(duracionTotalPartes / 60);
  const minutosPartes = duracionTotalPartes % 60;
  const coincide = duracionTotalExamen === duracionTotalPartes;

  const [ value, setValue ] = useState("");
  const [formValues, setFormValues] = useState({
    nombre: "",
    duracion_h: 0,
    duracion_m: 0
  });

  useEffect(() => {
    dispatch.examenModel.getExamen(id!);
    dispatch.parteExamenModel.getPartesExamenes(id!);
    dispatch.asignaturaModel.getAsignatura(idAsign!);
  }, [dispatch, id, idAsign]);

  const handleSubmit = async () => {
    const payload= {
      id_asign: id!,
      duracion_h: formValues.duracion_h,
      duracion_m: formValues.duracion_m,
      anno: new Date().getFullYear()
    } as CreateExamenInput; 

  try {
    await dispatch.examenModel.createExamen(payload);
    await dispatch.examenModel.getExamen(id!);
    setFormValues({ nombre: "", duracion_h: 0, duracion_m: 0 });
    onCloseAdd();
  } catch (e) {
    console.error("Error al guardar cambios", e);
  }
  };

  const handleEdit = async () => {
    const payload = {
      id: selectedParteExamenId!,
      nombre: formValues.nombre,
      duracion_h: parseInt(String(formValues.duracion_h)) || 0,
      duracion_m: parseInt(String(formValues.duracion_m)) || 0
    };

    try {
      await dispatch.parteExamenModel.updateParteExamen(payload);
      await dispatch.parteExamenModel.getPartesExamenes(id!);
      setFormValues({ nombre: "", duracion_h: 0, duracion_m: 0 });
      setSelectedParteExamenId(null);
      onCloseEdit();
    } catch (e) {
      console.error("Error al actualizar la parte del examen", e);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: (name === "duracion_h" || name === "duracion_m") ? parseInt(value) || 0 : value
    }));
  };

  const handleCloseAdd = () => {
    setFormValues({ nombre: "", duracion_h: 0, duracion_m: 0 });
    onCloseAdd();
  };

  const handleOpenEdit = (parteExamen: any) => {
    setSelectedParteExamenId(parteExamen.id);
    setFormValues({
      nombre: parteExamen.nombre,
      duracion_h: parteExamen.duracion_h,
      duracion_m: parteExamen.duracion_m
    });
    onOpenEdit();
  };

  const handleCloseEdit = () => {
    setFormValues({ nombre: "", duracion_h: 0, duracion_m: 0 });
    setSelectedParteExamenId(null);
    onCloseEdit();
  };

  const filteredPartesExamenes= partesExamenes.filter((parteExamen) => 
    parteExamen.nombre.toLowerCase().includes(value.toLowerCase())
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
          <VStack align="center" justify="center" spacing={4} w="100%">
            <Heading >
              {asignatura?.nombre}
            </Heading>
          </VStack>
        </Flex>

        <Flex>
          <VStack align={"start"} spacing={4} w="100%">
            <Heading size="lg">
              Convocatoria: {examen?.convocatoria}{" "+examen?.anno}
            </Heading>
            <Text mb={5} mt={-4}>Aquí encontrarás toda la información del examen de la convocatoria seleccionada</Text>
          </VStack>
        </Flex>
        <VStack>
          <TableContainer w={"100%"}>
            <Table>
              <Thead>
                <Tr bg="shade.2" w="100%">
                  <Td borderTopLeftRadius="12px" color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Parte</Td>
                  <Td color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Nombre</Td>
                  <Td color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Duración</Td>
                  <Td borderTopRightRadius="12px" color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Acciones </Td>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPartesExamenes.map((parteExamen, index) => (
                  <Tr key={parteExamen.id || index} bgColor={"#d9d9d9"} _hover={{ bg: "#e9e9e9" }}>
                    <Td
                      p={2}
                      textAlign="center"
                      borderRight="1px solid #aaaaaa"
                      borderBottom="1px solid #aaaaaa"
                    >
                      <Text fontSize="lg">{parteExamen.num_parte}</Text>
                    </Td>

                    <Td
                      p={2}       
                      textAlign="center"
                      borderRight="1px solid #aaaaaa"
                      borderBottom="1px solid #aaaaaa"
                    >
                      <Text fontSize="lg">{parteExamen.nombre}</Text>
                    </Td>

                    <Td
                      p={2}
                      textAlign="center"
                      borderRight="1px solid #aaaaaa"
                      borderBottom="1px solid #aaaaaa"
                    >
                      <Text fontSize="lg">{parteExamen.duracion_h != 0 ? parteExamen.duracion_h+"h" : null} {parteExamen.duracion_m != 0 ? parteExamen.duracion_m+"min" : null} {parteExamen.duracion_h == 0 && parteExamen.duracion_m == 0 ? "Añadir duración parte" : ""} </Text>
                    </Td>

                    <Td minW="200px" textAlign="center" p={2} borderBottom="1px solid #aaaaaa">
                      <Button 
                        colorScheme="blue" 
                        size="sm"
                        w={"45%"} 
                        borderRadius="full" 
                        bg="#000000"
                        onClick={() => handleOpenEdit(parteExamen)}
                        _hover={{ bg:  "#aaaaaa"}}
                      >
                        Modificar
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          
          <Box
            bg={coincide ? "green.50" : "red.50"}
            border="2px solid"
            borderColor={coincide ? "green.400" : "red.400"}
            borderRadius="lg"
            p={6}
            mt={8}
            w="100%"
          >
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md" color={coincide ? "green.700" : "red.700"}>
                {coincide ? "✓ Duración Correcta" : "⚠ Duración Incompleta"}
              </Heading>
              <Text fontSize="lg" fontWeight="bold" color={coincide ? "green.700" : "red.700"}>
                {coincide ? "Sincronizado" : `Faltan ${duracionTotalExamen - duracionTotalPartes} min`}
              </Text>
            </Flex>

            <Flex justify="space-around" gap={8}>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Duración del Examen
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={coincide ? "green.700" : "red.700"}>
                  {examen?.duracion_h || 0}h {examen?.duracion_m || 0}min
                </Text>
              </Box>

              <Box textAlign="center">
                <Text fontSize="3xl" color="gray.400">→</Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Duración Total de Partes
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color={coincide ? "green.700" : "red.700"}>
                  {horasPartes}h {minutosPartes}min
                </Text>
              </Box>
            </Flex>
          </Box>
        </VStack>

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
                  <FormControl isRequired>
                    <Flex justify={"space-between"} gap={4} mt={4}>
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Duración del Examen (Horas)</FormLabel>
                        <Select
                          id="duracion_h" 
                          name="duracion_h" 
                          value={formValues.duracion_h}
                          onChange={handleFormChange}
                          placeholder="Elige cuantas horas durará" 
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="0">0</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </Select>
                      </Box>
                      
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Duración del Examen (Minutos)</FormLabel>
                        <Select
                          id="duracion_m" 
                          name="duracion_m" 
                          value={formValues.duracion_m}
                          onChange={handleFormChange}
                          placeholder="Elige cuantos minutos durará" 
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="0">0</option>
                          <option value="5">5</option>
                          <option value="10">10</option>
                          <option value="15">15</option>
                          <option value="20">20</option>
                          <option value="25">25</option>
                          <option value="30">30</option>
                          <option value="35">35</option>
                          <option value="40">40</option>
                          <option value="45">45</option>
                          <option value="50">50</option>
                          <option value="55">55</option>
                        </Select>
                      </Box>
                    </Flex>
                  </FormControl>

                  <Text align={"center"} mb={-6} mt={3}>Nota: La duración total de las partes debe ser igual a la duración del examen</Text>

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
      </Container>  
    </Box>
  );
}