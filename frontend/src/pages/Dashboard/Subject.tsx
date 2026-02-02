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
import { IRootState, IDispatch, select } from "../../store/store"; 
import { NavBar } from "./NavBar";
import { Feature } from "framer-motion";
import { Convocatoria } from "@/types/examen.type";

export default function Dashboard() {
  const dispatch = useDispatch<IDispatch>();
  const userId = "user_id_ejemplo"; 
  const { id } = useParams<{ id: string }>();
  
  const { isOpen: isOpenAdd, onOpen: onOpenAdd, onClose: onCloseAdd } = useDisclosure();

  const { isOpen: isOpenAccess, onOpen: onOpenAccess, onClose: onCloseAccess } = useDisclosure();

  const asignatura =  useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examenes =  useSelector((state: IRootState) => state.examenModel.examenes);

  const [ value, setValue ] = useState("");
  const [formValues, setFormValues] = useState({
    convocatoria: "",
    partes: 0,
    duracion_h: 0,
    duracion_m: 0
  });

    const handleSubmit = async () => {
    if (!formValues.convocatoria.trim()) {
      console.error("La convocatoria es obligatoria");
      return;
    }

    const payload= {
      id_asign: id!,
      convocatoria: formValues.convocatoria as Convocatoria,
      partes: parseInt(formValues.partes) || 0,
      duracion_h: formValues.duracion_h,
      duracion_m: formValues.duracion_m,
      anno: new Date().getFullYear()
    };

  try {
    await dispatch.examenModel.createExamen(payload);
    await dispatch.examenModel.getExamenes(id!);
    setFormValues({ convocatoria: "", partes: 0, duracion_h: 0, duracion_m: 0 });
    onCloseAdd();
  } catch (e) {
    console.error("Error al guardar cambios", e);
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
    setFormValues({ convocatoria: "", partes: 0, duracion_h: 0, duracion_m: 0 });
    onCloseAdd();
  };

  useEffect(() => {
    dispatch.examenModel.getExamenes(id!);
    dispatch.asignaturaModel.getAsignatura(id!);
  }, [dispatch, id]);

  const filteredExamenes= examenes.filter((examen) => 
    examen.convocatoria.toLowerCase().includes(value.toLowerCase())
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
                  px={4}
                  py={2}
                >
                  Filtros
                </Button>
              </Flex>  
              <Button 
              colorScheme="blue" 
              size="lg" 
              minW={"15%"}
              borderRadius="full" 
              px={10}
              bg="#0055D4"
              onClick={onOpenAdd}
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
                      <Td borderTopLeftRadius="12px" color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Año</Td>
                      <Td color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Convocatoria</Td>
                      <Td color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Partes</Td>
                      <Td color="shade.1" textAlign="center" w={"15%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"} > Duración </Td>
                      <Td borderTopRightRadius="12px" color="shade.1" textAlign="center" w={"20%"} fontWeight={"bold"} borderBottom={"1px solid #aaaaaa"}> Acciones </Td>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredExamenes.map((examen, index) => (
                      <Tr key={examen.id || index} bgColor={"#d9d9d9"} _hover={{ bg: "#e9e9e9" }}>
                        <Td
                          p={2}
                          textAlign="center"
                          borderRight="1px solid #aaaaaa"
                          borderBottom="1px solid #aaaaaa"
                        >
                          <Text fontSize="lg">{examen.anno}</Text>
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

                        <Td minW="200px" textAlign="center" p={2} borderBottom="1px solid #aaaaaa">
                          <Flex justify={"space-between"}>
                            <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              //onClick={() => handleOpenEdit(asignatura)}
                              _hover={{ bg:  "#aaaaaa"}}
                            >
                              Comenzar
                            </Button>

                            <Button 
                              colorScheme="blue" 
                              size="sm"
                              w={"45%"} 
                              borderRadius="full" 
                              bg="#000000"
                              onClick={onOpenAccess}
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
        <Modal isOpen={isOpenAdd} onClose={handleCloseAdd} isCentered>
          <ModalOverlay />
            <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"} minW={"70vh"}>
              <ModalHeader textAlign={"center"} fontSize={"x-large"}>Añadir examen</ModalHeader>
              <Text fontSize={"sm"} textAlign={"center"} mt={"-3.5"}>Introduce los siguientes datos</Text>
              <ModalCloseButton />
              <ModalBody>
                <VStack spacing={5} py={4}>
        
                  {/* Campo: Nombre */}
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
                <VStack py={4}>
                  

                </VStack>
              </ModalBody>

              <ModalFooter justifyContent={"center"}>
                <Button 
                  colorScheme='blue' 
                  mr={3}
                  onClick={handleSubmit}
                  isDisabled={!formValues.convocatoria || !formValues.partes || (!formValues.duracion_h && !formValues.duracion_m)}
                >
                  Añadir Examen
                </Button>
              </ModalFooter>
            </ModalContent>

        </Modal>
      </Container>  
    </Box>
  );
}