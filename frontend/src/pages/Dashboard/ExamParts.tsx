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
  Link,
  IconButton,

} from "@chakra-ui/react";
import { FiChevronUp, FiChevronDown } from "react-icons/fi";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { CreateExamenInput } from "@/types/examen.type";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

export default function Parts() {
  const navigate = useNavigate();
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

  const [ value, setValue ] = useState("");
  const [formValues, setFormValues] = useState({
    nombre: "",
    duracion_h: 0,
    duracion_m: 0
  });

  useEffect(() => {
    dispatch.examenModel.getExamen(id!);
    dispatch.parteExamenModel.getPartesExamen(id!);
    dispatch.asignaturaModel.getAsignatura(idAsign!);
  }, [dispatch, id, idAsign]);

  const handleSubmit = async () => {
    const payload= {
      id_asign: id!,
      duracion_h: formValues.duracion_h,
      duracion_m: formValues.duracion_m,
      anno: new Date().getFullYear(),
      partes: [],
      convocatoria: "",
      fecha_examen: new Date(),
      aula: "",
      n_present: 0
    }; 

  try {
    await dispatch.examenModel.createExamen(payload);
    await dispatch.examenModel.getExamen(id!);
    setFormValues({ nombre: "", duracion_h: 0, duracion_m: 0 });
    onCloseAdd();
  } catch (e) {
    console.error("Error al guardar cambios", e);
  }
  };

  const handleDelete = async () => {
    try {
      if (selectedParteExamenId && examen) {
        if (examen.partes === 1)
        {
          await dispatch.examenModel.deleteExamen(id!)
          navigate(`/asignatura/${idAsign}`)
          onCloseDelete();
          return;
        }else{
          const selectedParte = partesExamenes.find(p => p.id === selectedParteExamenId);
          if (selectedParte) {
            const totalExamenMin = (examen.duracion_h || 0) * 60 + (examen.duracion_m || 0);
            const parteMin = selectedParte.duracion_h * 60 + selectedParte.duracion_m;
            const nuevoTotal = Math.max(totalExamenMin - parteMin, 0);
            await dispatch.examenModel.updateTimeExamen({
              id: id!,
              duracion_h: Math.floor(nuevoTotal / 60),
              partes: examen.partes - 1,
              duracion_m: nuevoTotal % 60
            });
          }
        }
      }
      await dispatch.parteExamenModel.deleteParteExamen(selectedParteExamenId!);
      await dispatch.parteExamenModel.getPartesExamen(id!);
      onCloseDelete();
    } catch (e) {
      console.error("Error al eliminar la asignatura", e);
    }
  };

  const handleEdit = async () => {
    const payload = {
      id: selectedParteExamenId!,
      nombre: formValues.nombre,
      duracion_h: parseInt(String(formValues.duracion_h)) || 0,
      duracion_m: parseInt(String(formValues.duracion_m)) || 0
    };

    if (selectedParteExamenId && examen) {
      const totalExamenMin = (examen.duracion_h || 0) * 60 + (examen.duracion_m || 0);

      const parteActual = partesExamenes.find((parte) => parte.id === selectedParteExamenId);
      const parteActualMin = parteActual
        ? payload.duracion_h * 60 + payload.duracion_m
        : 0;

      const parteNuevaMin = payload.duracion_h * 60 + payload.duracion_m;
      
      const nuevoTotal = Math.max(totalExamenMin - parteActualMin + parteNuevaMin, 0);

      await dispatch.examenModel.updateTimeExamen({
        id: id!,
        duracion_h: Math.floor(nuevoTotal / 60),
        partes: examen.partes,
        duracion_m: nuevoTotal % 60
      });
    }

    try {
      await dispatch.parteExamenModel.updateParteExamen(payload);
      await dispatch.parteExamenModel.getPartesExamen(id!);
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

  const handleMoveUp = async (parteId: string) => {
    try {
      await dispatch.parteExamenModel.moveUpParteExamen({ id: parteId });
      await dispatch.parteExamenModel.getPartesExamen(id!);
    } catch (e) {
      console.error("Error al mover hacia arriba la parte del examen", e);
    }
  };

  const handleMoveDown = async (parteId: string) => {
    try {
      await dispatch.parteExamenModel.moveDownParteExamen({ id: parteId });
      await dispatch.parteExamenModel.getPartesExamen(id!);
    } catch (e) {
      console.error("Error al mover hacia abajo la parte del examen", e);
    }
  };

  const filteredPartesExamenes= partesExamenes.filter((parteExamen) => 
    parteExamen.nombre.toLowerCase().includes(value.toLowerCase())
  );


  return (
    <Box bg="white" w="100%" minH="100vh"> 
      <NavBar></NavBar>   
      <Link as={RouterLink} to={`/asignatura/${idAsign}`} color="blue.600">
        <Text fontSize={"md"} mt={"5"} ml={"3"} > &lt;  Dashboard &lt; {asignatura?.nombre} </Text>
      </Link>
      {/* --- 1. CONTENIDO PRINCIPAL --- */}
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
            <Heading size={"lg"}>
              Fecha:{" "}
              {examen?.fecha_examen
                ? new Date(examen.fecha_examen).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "—"}
              {" // Convocatoria: "}
              {examen?.convocatoria ?? "—"}
            </Heading>
            <Text mb={5} mt={-2}>Aquí encontrarás toda la información del examen de la convocatoria seleccionada</Text>
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
                      <Box position="relative" w="100%">
                        <HStack spacing={1} position="absolute" left={0} top="50%" transform="translateY(-50%)">
                          <IconButton
                            aria-label="Subir parte"
                            icon={<FiChevronUp />}
                            size="sm"
                            borderRadius="full"
                            onClick={() => handleMoveUp(parteExamen.id)}
                            isDisabled={index === 0}
                          />
                          <IconButton
                            aria-label="Bajar parte"
                            icon={<FiChevronDown />}
                            size="sm"
                            borderRadius="full"
                            onClick={() => handleMoveDown(parteExamen.id)}
                            isDisabled={index === filteredPartesExamenes.length - 1}
                          />
                        </HStack>
                        <Text fontSize="lg" textAlign="center">{parteExamen.num_parte}</Text>
                      </Box>
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
                      <Flex justify={"space-between"} align="center" gap={2}>
                        <Button 
                          colorScheme="blue" 
                          w={"45%"} 
                          borderRadius="full" 
                          bg="#000000"
                          onClick={() => handleOpenEdit(parteExamen)}
                          _hover={{ bg:  "#aaaaaa"}}
                        >
                          Modificar
                        </Button>
                        <Button 
                          colorScheme='blue' 
                          bgColor={"red"}
                          borderRadius="full" 
                          w={"45%"} 
                          _hover={{bg:"red"}}
                          mr={3}
                          onClick={() => {
                            onOpenDelete();
                            setSelectedParteExamenId(parteExamen.id);
                          }}
                        >
                          Eliminar parte
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>    
        </VStack>

        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"100vh"}>
              <ModalHeader textAlign={"center"}>¿Estás seguro/a de que quieres eliminar esta parte del examen?</ModalHeader>
              <ModalCloseButton />
              <ModalBody >
                <Flex justifyContent={"center"} mb={"3"}>
                  <Button 
                    colorScheme='blue' 
                    bgColor={"red"}
                    mr={3}
                    onClick={handleDelete}
                    _hover={{bgcolor:"red"}}
                  >
                    Eliminar parte
                  </Button>

                  <Button 
                    colorScheme='blue' 
                    mr={3}
                    onClick={onCloseDelete}
                  >
                    Cancelar
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>

        </Modal>

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
                </VStack>
              </ModalBody>

              <ModalFooter justifyContent={"center"}>
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