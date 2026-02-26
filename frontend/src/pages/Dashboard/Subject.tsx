import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useParams } from "react-router-dom";
import { 
  Box, Container, Flex, Icon, Text, Spacer, Heading, Button, VStack, useDisclosure, Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  FormControl,
  FormLabel,
  Input,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Td,
  InputGroup,
  InputRightElement,
  Select,
  Link,

} from "@chakra-ui/react";
import { InlineIcon } from "@iconify/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { Convocatoria, CreateExamenInput, UpdateExamenInput } from "@/types/examen.type";
import { useNavigate } from "react-router-dom";
import { FiMoreVertical } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";

export default function Parts() {
  const dispatch = useDispatch<IDispatch>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure();
  const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure();
  const { isOpen: isOpenOptions, onOpen: onOpenOptions, onClose: onCloseOptions } = useDisclosure();
  const { isOpen: isOpenFilters, onOpen: onOpenFilters, onClose: onCloseFilters } = useDisclosure();
  
  const { isOpen: isOpenPresentados, onOpen: onOpenPresentados, onClose: onClosePresentados } = useDisclosure();
  const [examenID, setExamenID] = useState("");

  const asignatura =  useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examenes =  useSelector((state: IRootState) => state.examenModel.examenes);

  const [ presentados, setPresentados ] = useState("");
  const [ aprobados, setAprobados ] = useState("");
  const [editAulasData, setEditAulasData] = useState<{aula: string, n_esperados: number}[]>([]);
  const [editAulaValues, setEditAulaValues] = useState({ aula: "", n_esperados: 0 });
  const [showEditAulaForm, setShowEditAulaForm] = useState(false);
  const [ aulasData, setAulasData ] = useState<{aula: string, n_esperados: number}[]>([]);

  const [ value, setValue ] = useState("");
  const [formValues, setFormValues] = useState({
    convocatoria: "",
    partes: 0,
    fecha_examen: "",
    aula: "",
    n_esperados: 0
  });

  const [filtersValues, setFiltersValues] = useState({
    convocatoria: "",
    partes: 0,
    fecha_examen: "",
    n_esperados: 0
  });

  const [appliedFilters, setAppliedFilters] = useState({
    convocatoria: "",
    partes: 0,
    fecha_examen: "",
    n_esperados: 0
  });
  
  const [editExamenValues, setEditExamenValues] = useState({
    convocatoria: "",
    fecha_examen: "",
    aula: "",
    n_esperados: 0
  });
  
  const [partesData, setPartesData] = useState<Array<{
    nombre: string;
    duracion_h: number;
    duracion_m: number;
  }>>([]);
  
  const [currentStep, setCurrentStep] = useState(0);

  const agregarAula = () => {
    if (!formValues.aula.trim()) return;

    setAulasData((prev) => [
      ...prev,
      {
        aula: formValues.aula.trim(),
        n_esperados: Number(formValues.n_esperados) || 0,
      },
    ]);

    setFormValues((prev) => ({
      ...prev,
      aula: "",
      n_esperados: 0,
    }));
  };

  useEffect(() => {
    dispatch.examenModel.getExamenes(id!);
    dispatch.asignaturaModel.getAsignatura(id!);
  }, [dispatch, id]);

  const handleSubmit = async () => {
    // Calcular duración total del examen sumando todas las partes
    let duracion_total_h = 0;
    let duracion_total_m = 0;
    
    partesData.forEach(parte => {
      duracion_total_m += parte.duracion_h * 60 + parte.duracion_m;
    });
    
    duracion_total_h = Math.floor(duracion_total_m / 60);
    duracion_total_m = duracion_total_m % 60;

    const aulaAlumnos = [
      ...aulasData,
      ...(formValues.aula.trim()
        ? [{ aula: formValues.aula.trim(), n_esperados: Number(formValues.n_esperados) || 0 }]
        : []),
    ];

    let n_total_esperados = 0;
    for(let i = 0 ; i < aulaAlumnos.length ; i++) n_total_esperados += aulaAlumnos[i].n_esperados;

    const payload= {
      id_asign: id!,
      convocatoria: formValues.convocatoria as Convocatoria,
      partes: formValues.partes,
      duracion_h: duracion_total_h,
      duracion_m: duracion_total_m,
      fecha_examen: new Date(formValues.fecha_examen),
      aula: aulaAlumnos[0]?.aula || "",
      n_esperados: n_total_esperados,
      anno: new Date().getFullYear(),
      aulaAlumnos: aulaAlumnos.map(item => ({
        aula: item.aula,
        n_esperados: Number(item.n_esperados) 
      }))
    } as CreateExamenInput; 

  try {
    const nuevoExamen = await dispatch.examenModel.createExamen(payload);
    if (nuevoExamen) {
      // Crear las partes del examen con sus duraciones específicas
      for(let i = 0; i < partesData.length; i++) {
        await dispatch.parteExamenModel.createParteExamen({
          id_examen: nuevoExamen.id,
          nombre: partesData[i].nombre,
          num_parte: i + 1,
          duracion_h: partesData[i].duracion_h,
          duracion_m: partesData[i].duracion_m
        });
      }
    }
    
    await dispatch.examenModel.getExamenes(id!);
    setFormValues({ convocatoria: "", partes: 0, fecha_examen: "", aula: "", n_esperados: 0 });
    setAulasData([]);
    setPartesData([]);
    handleCloseAdd();
  } catch (e) {
    console.error("Error al guardar cambios", e);
  }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "partes") {
      const numPartes = parseInt(value) || 0;
      setFormValues(prev => ({ ...prev, [name]: numPartes }));
      
      // Inicializar las partes con valores vacíos
      const newPartes = Array.from({ length: numPartes }, (_, i) => ({
        nombre: `Parte ${i + 1}`,
        duracion_h: 0,
        duracion_m: 0
      }));
      setPartesData(newPartes);
    } else {
      setFormValues(prev => ({
        ...prev,
        [name]: (name === "n_esperados") ? parseInt(value) || 0 : value
      }));
    }
  };
  
  const handleParteChange = (index: number, field: string, value: string | number) => {
    setPartesData(prev => {
      const newPartes = [...prev];
      newPartes[index] = {
        ...newPartes[index],
        [field]: field === "duracion_h" || field === "duracion_m" ? parseInt(value as string) || 0 : value
      };
      return newPartes;
    });
  };
  
  const handleEditExamenChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditExamenValues(prev => ({
      ...prev,
      [name]: name === "n_esperados" ? parseInt(value) || 0 : value
    }));
  };

  const handleEditAulaChange = (index: number, field: "aula" | "n_esperados", value: string) => {
    setEditAulasData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === "n_esperados" ? parseInt(value) || 0 : value,
      };
      return updated;
    });
  };

  const agregarAulaEdicion = () => {
    if (!editAulaValues.aula.trim()) return;

    setEditAulasData((prev) => [
      ...prev,
      {
        aula: editAulaValues.aula.trim(),
        n_esperados: Number(editAulaValues.n_esperados) || 0,
      },
    ]);

    setEditAulaValues({ aula: "", n_esperados: 0 });
    setShowEditAulaForm(false);
  };

  const handleCloseAdd = () => {
    setFormValues({ convocatoria: "", partes: 0, fecha_examen: "", aula: "", n_esperados: 0 });
    setAulasData([]);
    setPartesData([]);
    setCurrentStep(0);
    onCloseAdd();
  };
  
  const handleNextStep = () => {
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePreviousStep = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const handleCloseEdit = () => {
    setEditExamenValues({ convocatoria: "", fecha_examen: "", aula: "", n_esperados: 0 });
    setEditAulasData([]);
    setEditAulaValues({ aula: "", n_esperados: 0 });
    setShowEditAulaForm(false);
    onCloseEdit();
  };

  const handleOpenEditExamen = () => {
    const selected = examenes.find((ex) => ex.id === examenID);
    if (!selected) {
      return;
    }
    setEditExamenValues({
      convocatoria: selected.convocatoria,
      fecha_examen: selected.fecha_examen
        ? new Date(selected.fecha_examen).toISOString().slice(0, 10)
        : "",
      aula: selected.aula || "",
      n_esperados: selected.n_esperados || 0
    });

    const aulasIniciales = selected.aulaAlumnos?.length
      ? selected.aulaAlumnos.map((item) => ({
          aula: item.aula,
          n_esperados: Number(item.n_esperados) || 0,
        }))
      : [{ aula: selected.aula || "", n_esperados: selected.n_esperados || 0 }];

    setEditAulasData(aulasIniciales);
    setEditAulaValues({ aula: "", n_esperados: 0 });
    setShowEditAulaForm(false);
    onCloseOptions();
    onOpenEdit();
  };

  const handleEditExamenSubmit = async () => {
    try {
      const aulaPendiente = editAulaValues.aula.trim()
        ? [{
            aula: editAulaValues.aula.trim(),
            n_esperados: Number(editAulaValues.n_esperados) || 0,
          }]
        : [];

      const aulaAlumnosPayload = [...editAulasData, ...aulaPendiente]
        .filter((item) => item.aula.trim())
        .map((item) => ({
          aula: item.aula.trim(),
          n_esperados: Number(item.n_esperados) || 0,
        }));

      const nTotalEsperados = aulaAlumnosPayload.reduce(
        (total, item) => total + item.n_esperados,
        0
      );

      await dispatch.examenModel.updateExamen({
        id: examenID!,
        convocatoria: editExamenValues.convocatoria as Convocatoria,
        fecha_examen: new Date(editExamenValues.fecha_examen),
        aula: aulaAlumnosPayload[0]?.aula || "",
        n_esperados: nTotalEsperados,
        aulaAlumnos: aulaAlumnosPayload,
      });
      await dispatch.examenModel.getExamenes(id!);
      handleCloseEdit();
    } catch (e) {
      console.error("Error al actualizar el examen", e);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch.examenModel.deleteExamen(examenID!);
      await dispatch.examenModel.getExamenes(id!);
      onCloseOptions();
    } catch (e) {
      console.error("Error al eliminar la asignatura", e);
    }
  };

  const handleFiltersChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltersValues(prev => ({
      ...prev,
      [name]: (name === "partes" || name === "n_esperados")
        ? (value === "" ? 0 : parseInt(value) || 0)
        : value
    }));
  };

  const handleClearFilters = () => {
    setFiltersValues({ convocatoria: "", partes: 0, fecha_examen: "", aula: "", n_esperados: 0 });
    setAppliedFilters({ convocatoria: "", partes: 0, fecha_examen: "", aula: "", n_esperados: 0 });
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filtersValues);
    onCloseFilters();
  };

  const hasActiveFilters = Boolean(
    appliedFilters.convocatoria ||
    appliedFilters.partes ||
    appliedFilters.fecha_examen ||
    appliedFilters.n_esperados
  );

  const normalizedSearch = value.trim().toLowerCase();

  const filteredExamenes = examenes.filter((examen) => {
    if (normalizedSearch && !examen.convocatoria.toLowerCase().includes(normalizedSearch)) {
      return false;
    }

    if (appliedFilters.convocatoria && examen.convocatoria !== appliedFilters.convocatoria) {
      return false;
    }


    if (appliedFilters.partes && examen.partes !== appliedFilters.partes) {
      return false;
    }

    if (appliedFilters.n_esperados && examen.n_esperados < appliedFilters.n_esperados) {
      return false;
    }

    if (appliedFilters.fecha_examen) {
      const examenFecha = new Date(examen.fecha_examen).toISOString().slice(0, 10);
      if (examenFecha < appliedFilters.fecha_examen) {
        return false;
      }
    }

    return true;
  });

  const handlePresentados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const present = event.target.value;
    if (/^\d*$/.test(present)) {
      setPresentados(present);
    }
  };

  const handleAprobados = (event: React.ChangeEvent<HTMLInputElement>) => {
    const aprob = event.target.value;
    if (/^\d*$/.test(aprob)) {
      setAprobados(aprob);
    }
  };

  const handleUpdatePresentados = async () => {
    if (!examenID) return;
    const payload: UpdateExamenInput = {
      id: examenID,
      n_present: presentados === "" ? 0 : Number(presentados),
      n_aprobados: aprobados === "" ? 0 : Number(aprobados),
    };
    await dispatch.examenModel.updateExamen(payload);
    await dispatch.examenModel.getExamenes(id!);
    onClosePresentados();
  };

  return (
    <Box bg="white" w="100%" minH="100vh"> 
      <NavBar></NavBar>   
      <Link as={RouterLink} to={`/`} color="blue.600">
        <Text fontSize={"md"} mt={"5"} ml={"3"} > &lt;  Dashboard </Text>
      </Link>
      {/* --- 2. CONTENIDO PRINCIPAL --- */}
      <Container maxW="full" py={10}>
        
        <Flex 
          direction={{ base: "column", md: "row" }} 
          justify="space-between" 
          align={{ base: "start", md: "center" }}
          mb={10}
        >
          <VStack align="start" spacing={4}>
            <Heading as="h1" size="lg">
              {asignatura?.nombre}
            </Heading>
            <Text maxW={"70%"}>{asignatura?.descripcion}</Text>
          </VStack>
          {examenes.length != 0 ? 
            (<Button 
              colorScheme="blue" 
              borderRadius="full" 
              size={"lg"}
              minW={"15%"}
              px={8}
              bg="#0055D4"
              _hover={{ bg: "#0041a3" }}
              onClick={onOpenAdd}
            >
              Añadir examen
            </Button>) : (<></>)}
        </Flex>

        {examenes.length == 0 ? (<></>) : (
          <Flex w="100%" justify="space-between"  mb={"1%"}>
              <Flex justify={"space-between"}>
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
                    onChange={(e) => setValue(e.target.value)}
                    borderColor="white"
                    fontSize="14px"
                    _placeholder={{ color: "gray.500" }}
                    _focus={{ borderColor: "#0055D4", boxShadow: "none" }}
                  />
                </InputGroup>  

                <Button
                  size="md"
                  borderRadius="18px"
                  bgColor={"#e9e9e9"}
                  ml="5"
                  rightIcon={<InlineIcon icon="mdi:filter" style={{ color: "#1a202c", fontSize: "20px" }} />}
                  _hover={{ bg: "#d0d0d0" }}
                  fontSize="14px"
                  color="gray.500"
                  border="1px solid white"
                  fontWeight={"normal"}
                  onClick={onOpenFilters}
                  px={4}
                  py={2}
                >
                  Filtros
                </Button>

                {hasActiveFilters ? (<Button
                  size="md"
                  borderRadius="18px"
                  bgColor={"#e9e9e9"}
                  ml="5"
                  _hover={{ bg: "#d0d0d0" }}
                  rightIcon={<InlineIcon icon="solar:refresh-bold-duotone" style={{ color: "#1a202c", fontSize: "20px" }} />}
                  border="1px solid white"
                  fontWeight={"normal"}
                  onClick={handleClearFilters}
                  px={4}
                  py={2}
                >
                  <Text> Limpiar Filtros</Text>
                </Button>
              ) : (<></>)}
              </Flex>  
              <Button 
              colorScheme="blue" 
              size="lg" 
              minW={"15%"}
              borderRadius="full" 
              px={10}
              bg="#0055D4"
              onClick={() => navigate(`/asignatura/${id}/grafica/`)}
              _hover={{ bg: "#0041a3" }}
            >
              Ver gráfica
            </Button>
          </Flex>
        )}

        {examenes.length == 0 ?
          (<VStack spacing={4} py={10}>
            <Heading size="md" textAlign="center">
              Ups, parece que tu lista de examenes está vacía.
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
                Añadir examen
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
                      <Td borderTopLeftRadius="12px" color="shade.1" textAlign="center" w={"10%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Fecha de Examen</Td>
                      <Td color="shade.1" textAlign="center" w={"10%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Convocatoria</Td>
                      <Td color="shade.1" textAlign="center" w={"5%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Partes</Td>
                      <Td color="shade.1" textAlign="center" w={"10%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"} > Duración </Td>
                      <Td color="shade.1" textAlign="center" w={"5%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"} > Alumnos Esperados Totales</Td>
                      <Td color="shade.1" textAlign="center" w={"10%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"} > Aula/s </Td>
                      <Td borderTopRightRadius="12px" color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Acciones </Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredExamenes.map((examen, index) => (
                      <Tr key={examen.id || index} bgColor={examen.finalizado ? "#B9F6CA" : "#E2E8F0"}>
                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{new Date(examen.fecha_examen).toLocaleDateString('es-ES')}</Text>
                        </Td>

                        <Td
                          p={2}       
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{examen.convocatoria}</Text>
                        </Td>

                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{examen.partes}</Text>
                        </Td>

                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{examen.duracion_h != 0 ? examen.duracion_h+"h" : null} {examen.duracion_m != 0 ? examen.duracion_m+"min" : null} </Text>
                        </Td>

                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{examen.n_esperados}</Text>
                        </Td>

                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          {examen.aulaAlumnos.map((item, index) => (
                            <Text key={index} fontSize="lg">
                              {item.aula}: {item.n_esperados} alumnos
                            </Text>
                          ))}
                        </Td>
                      
                      
                        <Td minW="200px" textAlign="center" p={2} borderBottom="1px solid #aaaaaa">
                          <Flex justify={"space-between"}>
                            {examen.finalizado ? (
                              <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={() => {
                                setExamenID(examen.id);
                                setPresentados((examen.n_present ?? 0) > 0 ? String(examen.n_present) : "");
                                setAprobados((examen.n_aprobados ?? 0) > 0 ? String(examen.n_aprobados) : "");
                                onOpenPresentados();
                              }}
                              _hover={{ bg:  "#2e2e2e"}}
                            >
                              Alumnos Presentados
                            </Button>
                            ) : (<Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={() => navigate(`/asignatura/${id}/examen/${examen.id}/cuentaatras`)}
                              _hover={{ bg:  "#2e2e2e"}}
                            >
                              Comenzar
                            </Button>)}
                            

                            <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={() => navigate(`/asignatura/${id}/examen/${examen.id}`)}
                              _hover={{ bg:  "#2e2e2e"}}
                            >
                              Acceder
                            </Button>
                            
                            <Button 
                              //colorScheme="blue" 
                              size="sm"
                              w={"5%"} 
                              //borderRadius="full" 
                              bg="transparent"
                              onClick={() => {
                                setExamenID(examen.id);
                                onOpenOptions();
                              }}
                              _hover={{ bg:  "#aaaaaa"}}
                            >
                              <Icon as={FiMoreVertical} w={5} h={5} cursor="pointer" color={"black"}/>
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

        <Modal isOpen={isOpenPresentados} onClose={onClosePresentados} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"}>
              <ModalHeader textAlign={"center"}>Añadir Alumnos Presentados</ModalHeader>
              <ModalCloseButton />
              <ModalBody >
                <Flex justifyContent={"center"} mb={"3"}>
                  <VStack>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">¿Cuántos alumnos se han presentado?</FormLabel>
                      <Input
                        type="number"
                        placeholder="" 
                        onChange={handlePresentados}
                        value={presentados}
                        size="lg"
                        borderRadius="xl"    
                        focusBorderColor="blue.500"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel fontWeight="semibold">¿Cuántos alumnos han aprobado?</FormLabel>
                      <Input
                        type="number"
                        placeholder="" 
                        onChange={handleAprobados}
                        value={aprobados}
                        size="lg"
                        borderRadius="xl"    
                        focusBorderColor="blue.500"
                      />
                    </FormControl>
                  </VStack>
                </Flex>
              </ModalBody>
              <ModalFooter justifyContent={"center"}>
                <Button 
                    colorScheme='blue' 
                    onClick={handleUpdatePresentados}
                    _hover={{bgcolor:"red"}}
                  >
                    Añadir
                  </Button>
              </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={isOpenAdd} onClose={handleCloseAdd} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"} fontSize={"x-large"}>
                {currentStep === 0 ? "Añadir examen" : `Parte ${currentStep} de ${formValues.partes}`}
              </ModalHeader>
              <Text fontSize={"sm"} textAlign={"center"} mt={"-3.5"}>
                {currentStep === 0 ? "Introduce los datos del examen" : "Configura la duración de esta parte"}
              </Text>
              <ModalCloseButton />
              <ModalBody>
                {currentStep === 0 ? (
                  <VStack spacing={5} py={4}>
                  <FormControl isRequired>
                    <Flex justify={"space-between"} gap={4}>
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Convocatoria</FormLabel>
                        <Select
                          id="convocatoria" 
                          name="convocatoria" 
                          value={formValues.convocatoria}
                          onChange={handleFormChange}
                          placeholder="Elige la convocatoria" 
                          size="lg"
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="Febrero">Febrero</option>
                          <option value="Junio">Junio</option>
                          <option value="Septiembre">Septiembre</option>
                          <option value="Diciembre">Diciembre</option>
                        </Select>
                      </Box>
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Fecha del Examen</FormLabel>
                        <Input
                          id="fecha_examen" 
                          name="fecha_examen" 
                          type="date"
                          value={formValues.fecha_examen}
                          onChange={handleFormChange}
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        />
                      </Box>
                    </Flex>
                  </FormControl>

                  <FormControl isRequired>
                    <Flex justify={"space-between"} gap={4}>
                      <Box w="100%">
                        <FormLabel fontWeight="semibold">Partes del examen</FormLabel>
                        <Select
                          id="partes" 
                          name="partes" 
                          value={formValues.partes}
                          onChange={handleFormChange}
                          placeholder="Elige el nº de partes" 
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </Select>
                      </Box>
                    </Flex>
                  </FormControl>

                  <VStack w="100%" spacing={4} align="stretch">
                    {aulasData.map((item, index) => (
                      <FormControl key={`${item.aula}-${index}`}>
                        <Flex justify={"space-between"} gap={4}>
                          <Box w="50%">
                            <FormLabel fontWeight="semibold">Aula</FormLabel>
                            <Input
                              value={item.aula}
                              size="lg"
                              borderRadius="xl"
                              isReadOnly
                              isDisabled
                            />
                          </Box>

                          <Box w="50%">
                            <FormLabel fontWeight="semibold">Número de Alumnos Esperados</FormLabel>
                            <Input
                              value={item.n_esperados}
                              size="lg"
                              borderRadius="xl"
                              isReadOnly
                              isDisabled
                            />
                          </Box>
                        </Flex>
                      </FormControl>
                    ))}

                    <FormControl isRequired>
                      <Flex justify={"space-between"} gap={4}>
                        <Box w="50%">
                          <FormLabel fontWeight="semibold">Aula</FormLabel>
                          <Input
                            id="aula" 
                            name="aula" 
                            value={formValues.aula}
                            onChange={handleFormChange}
                            placeholder="Ej: Aula D03" 
                            size="lg"      
                            borderRadius="xl"    
                            focusBorderColor="blue.500"
                          />
                        </Box>

                        <Box w="50%">
                          <FormLabel fontWeight="semibold">Número de Alumnos Esperados</FormLabel>
                          <Input
                            id="n_esperados" 
                            name="n_esperados" 
                            type="number"
                            value={formValues.n_esperados || ""}
                            onChange={handleFormChange}
                            placeholder="Número de alumnos esperados" 
                            size="lg"      
                            borderRadius="xl"    
                            focusBorderColor="blue.500"
                            min="0"
                          />
                        </Box>
                      </Flex>
                    </FormControl>

                    <Button
                      size={"sm"}
                      alignSelf="flex-start"
                      onClick={agregarAula}
                      isDisabled={!formValues.aula.trim()}
                    >
                      Añadir otra aula
                    </Button>
                  </VStack>
                  </VStack>
                ) : (
                  <VStack spacing={5} py={4}>
                    <Box w="100%" p={4} borderWidth="1px" borderRadius="lg" bg="gray.50">
                      <FormControl isRequired>
                        <FormLabel fontWeight="semibold">Nombre de la Parte</FormLabel>
                        <Input
                          value={partesData[currentStep - 1]?.nombre || ""}
                          onChange={(e) => handleParteChange(currentStep - 1, "nombre", e.target.value)}
                          placeholder={`Parte ${currentStep}`}
                          size="lg"
                          borderRadius="xl"
                          focusBorderColor="blue.500"
                          mb={4}
                        />
                      </FormControl>
                      
                      <Flex justify={"space-between"} gap={4}>
                        <Box w="48%">
                          <FormLabel fontWeight="semibold">Horas</FormLabel>
                          <Select
                            value={partesData[currentStep - 1]?.duracion_h || 0}
                            onChange={(e) => handleParteChange(currentStep - 1, "duracion_h", e.target.value)}
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
                          <FormLabel fontWeight="semibold">Minutos</FormLabel>
                          <Select
                            value={partesData[currentStep - 1]?.duracion_m || 0}
                            onChange={(e) => handleParteChange(currentStep - 1, "duracion_m", e.target.value)}
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
                    </Box>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Parte {currentStep} de {formValues.partes}
                    </Text>
                  </VStack>
                )}

                  {/* Formularios para cada parte del examen */}
                  {formValues.partes > 0 && currentStep === 0 && (
                    <Box w="100%" mt={4} display="none">
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        Haz clic en "Siguiente" para configurar cada parte
                      </Text>
                    </Box>
                  )}
              </ModalBody>

              <ModalFooter justifyContent={"space-between"}>
                {currentStep > 0 && (
                  <Button 
                    variant="outline"
                    colorScheme='blue' 
                    size={"lg"}
                    onClick={handlePreviousStep}
                  >
                    Anterior
                  </Button>
                )}
                
                <Spacer />
                
                {currentStep === 0 ? (
                  <Button 
                    colorScheme='blue' 
                    size={"lg"}
                    onClick={handleNextStep}
                    isDisabled={
                      !formValues.convocatoria ||
                      !formValues.partes ||
                      !formValues.fecha_examen ||
                      (!formValues.aula.trim() && aulasData.length === 0)
                    }
                  >
                    Siguiente
                  </Button>
                ) : currentStep < formValues.partes ? (
                  <Button 
                    colorScheme='blue' 
                    size={"lg"}
                    onClick={handleNextStep}
                    isDisabled={!partesData[currentStep - 1]?.nombre.trim() || (!partesData[currentStep - 1]?.duracion_h && !partesData[currentStep - 1]?.duracion_m)}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button 
                    colorScheme='blue' 
                    size={"lg"}
                    onClick={handleSubmit}
                    isDisabled={!partesData[currentStep - 1]?.nombre.trim() || (!partesData[currentStep - 1]?.duracion_h && !partesData[currentStep - 1]?.duracion_m)}
                  >
                    Añadir Examen
                  </Button>
                )}
              </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={isOpenEdit} onClose={handleCloseEdit} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"} fontSize={"x-large"}>Editar examen</ModalHeader>
              <Text fontSize={"sm"} textAlign={"center"} mt={"-3.5"}>Modifica los datos básicos</Text>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={5} py={4}>
                  <FormControl isRequired>
                    <FormLabel fontWeight="semibold">Convocatoria</FormLabel>
                    <Select
                      id="convocatoria"
                      name="convocatoria"
                      value={editExamenValues.convocatoria}
                      onChange={handleEditExamenChange}
                      placeholder="Elige la convocatoria"
                      size="lg"
                      borderRadius="xl"
                      focusBorderColor="blue.500"
                    >
                      <option value="Febrero">Febrero</option>
                      <option value="Junio">Junio</option>
                      <option value="Septiembre">Septiembre</option>
                      <option value="Diciembre">Diciembre</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <Flex justify={"space-between"} gap={4}>
                      <Box w="100%">
                        <FormLabel fontWeight="semibold">Fecha del Examen</FormLabel>
                        <Input
                          id="fecha_examen"
                          name="fecha_examen"
                          type="date"
                          value={editExamenValues.fecha_examen}
                          onChange={handleEditExamenChange}
                          size="lg"
                          borderRadius="xl"
                          focusBorderColor="blue.500"
                        />
                      </Box>
                    </Flex>
                  </FormControl>

                  <VStack w="100%" spacing={4} align="stretch">
                        {editAulasData.map((item, index) => (
                          <FormControl key={`${item.aula}-${index}`}>
                            <Flex justify={"space-between"} gap={4}>
                              <Box w="50%">
                                <FormLabel fontWeight="semibold">Aula</FormLabel>
                                <Input
                                  value={item.aula}
                                  onChange={(e) => handleEditAulaChange(index, "aula", e.target.value)}
                                  size="lg"
                                  borderRadius="xl"
                                  focusBorderColor="blue.500"
                                />
                              </Box>

                              <Box w="50%">
                                <FormLabel fontWeight="semibold">Número de Alumnos Esperados</FormLabel>
                                <Input
                                  value={item.n_esperados}
                                  onChange={(e) => handleEditAulaChange(index, "n_esperados", e.target.value)}
                                  type="number"
                                  size="lg"
                                  borderRadius="xl"
                                  focusBorderColor="blue.500"
                                  min="0"
                                />
                              </Box>
                            </Flex>
                          </FormControl>
                        ))}

                        {showEditAulaForm && (
                          <FormControl isRequired>
                            <Flex justify={"space-between"} gap={4}>
                              <Box w="50%">
                                <FormLabel fontWeight="semibold">Aula</FormLabel>
                                <Input
                                  autoFocus
                                  value={editAulaValues.aula}
                                  onChange={(e) =>
                                    setEditAulaValues((prev) => ({ ...prev, aula: e.target.value }))
                                  }
                                  placeholder="Ej: Aula D03" 
                                  size="lg"      
                                  borderRadius="xl"    
                                  focusBorderColor="blue.500"
                                />
                              </Box>

                              <Box w="50%">
                                <FormLabel fontWeight="semibold">Número de Alumnos Esperados</FormLabel>
                                <Input
                                  type="number"
                                  value={editAulaValues.n_esperados || ""}
                                  onChange={(e) =>
                                    setEditAulaValues((prev) => ({
                                      ...prev,
                                      n_esperados: parseInt(e.target.value) || 0,
                                    }))
                                  }
                                  placeholder="Número de alumnos esperados" 
                                  size="lg"      
                                  borderRadius="xl"    
                                  focusBorderColor="blue.500"
                                  min="0"
                                />
                              </Box>
                            </Flex>
                          </FormControl>
                        )}

                        <Button
                          size={"sm"}
                          alignSelf="flex-start"
                          onClick={() => {
                            if (!showEditAulaForm) {
                              setShowEditAulaForm(true);
                              return;
                            }
                            agregarAulaEdicion();
                          }}
                          isDisabled={showEditAulaForm && !editAulaValues.aula.trim()}
                        >
                          {showEditAulaForm ? "Guardar aula" : "Añadir otra aula"}
                        </Button>
                      </VStack>
                </VStack>
              </ModalBody>

              <ModalFooter justifyContent={"center"}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleEditExamenSubmit}
                  isDisabled={!editExamenValues.convocatoria || !editExamenValues.fecha_examen || editAulasData.length === 0}
                >
                  Guardar cambios
                </Button>
              </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={isOpenFilters} onClose={onCloseFilters} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"} fontSize={"x-large"}>Filtros</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={5} py={4}>
                  <FormControl>
                    <Flex justify={"space-between"} gap={4}>
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Convocatoria</FormLabel>
                        <Select
                          id="convocatoria" 
                          name="convocatoria" 
                          value={filtersValues.convocatoria}
                          onChange={handleFiltersChange}
                          placeholder="Elige la convocatoria" 
                          size="lg"
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="Febrero">Febrero</option>
                          <option value="Junio">Junio</option>
                          <option value="Septiembre">Septiembre</option>
                          <option value="Diciembre">Diciembre</option>
                        </Select>
                      </Box>
                      <Box w="48%">
                        <FormLabel fontWeight="semibold">Fecha del Examen</FormLabel>
                        <Input
                          id="fecha_examen" 
                          name="fecha_examen" 
                          type="date"
                          value={filtersValues.fecha_examen}
                          onChange={handleFiltersChange}
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        />
                      </Box>
                    </Flex>
                  </FormControl>

                  <FormControl>
                    <Flex justify={"space-between"} gap={4}>
                      <Box w="50%">
                        <FormLabel fontWeight="semibold">Partes del examen</FormLabel>
                        <Select
                          id="partes" 
                          name="partes" 
                          value={filtersValues.partes ? String(filtersValues.partes) : ""}
                          onChange={handleFiltersChange}
                          placeholder="Elige el nº de partes" 
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                          <option value="7">7</option>
                          <option value="8">8</option>
                          <option value="9">9</option>
                          <option value="10">10</option>
                        </Select>
                      </Box>
                      
                      <Box w="50%">
                        <FormLabel fontWeight="semibold">Nº Alumnos Esperados</FormLabel>
                        <Input
                          id="n_esperados" 
                          name="n_esperados" 
                          type="number"
                          value={filtersValues.n_esperados || ""}
                          onChange={handleFiltersChange}
                          placeholder="Nº alumnos esperados" 
                          size="lg"      
                          borderRadius="xl"    
                          focusBorderColor="blue.500"
                          min="0"
                        />
                      </Box>
                    </Flex>
                  </FormControl>
                  </VStack>
                </ModalBody>

              <ModalFooter justifyContent={"center"}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleApplyFilters}
                >
                  Filtrar
                </Button>
              </ModalFooter>
            </ModalContent>
        </Modal>

        <Modal isOpen={isOpenOptions} onClose={onCloseOptions} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"75vh"}>
              <ModalHeader textAlign={"center"} fontSize={"x-large"}>Más opciones</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                  <Flex justifyContent={"center"} mb={"3"}>
                  <Button 
                    colorScheme='blue' 
                    bgColor={"red"}
                    mr={3}
                    onClick={handleDelete}
                    _hover={{bgcolor:"red"}}
                  >
                    Eliminar examen
                  </Button>

                  <Button 
                    colorScheme='blue' 
                    onClick={handleOpenEditExamen}
                    mr={3}
                  >
                    Editar examen
                  </Button>
                </Flex>
              </ModalBody>
            </ModalContent>

        </Modal>
      </Container>  
    </Box>
  );
}