import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  Box,
  Container,
  Flex,
  Button,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { NavBar } from "./NavBar";
import { IDispatch, IRootState } from "../../store/store";
import { useAuth } from "@clerk/clerk-react";
import type { historico } from "@/types/historico.type";
import api from "@/configs/axios";

export default function History() {
  const dispatch = useDispatch<IDispatch>();
  const { userId } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenFilters, onOpen: onOpenFilters, onClose: onCloseFilters } = useDisclosure();
  const [selectedScope, setSelectedScope] = useState<"none" | "mine" | "other">("none");
  const [loadingMine, setLoadingMine] = useState(false);
  const [loadingOther, setLoadingOther] = useState(false);
  const [historicoPorAsignatura, setHistoricoPorAsignatura] = useState<Record<string, historico[]>>({});
  const [asignaturaNombreById, setAsignaturaNombreById] = useState<Record<string, string>>({});
  const [searchProfesor, setSearchProfesor] = useState("");
  const [filtersValues, setFiltersValues] = useState({
    curso: "",
    convocatoria: "",
    tipoConvocatoria: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    curso: "",
    convocatoria: "",
    tipoConvocatoria: "",
  });

  const asignaturas = useSelector((state: IRootState) => state.asignaturaModel.asignaturas);
  const historico = useSelector((state: IRootState) => state.historicoModel.historico);

  useEffect(() => {
    onOpen();
  }, [onOpen]);

  useEffect(() => {
    let cancelled = false;

    const loadHistoricoMisAsignaturas = async () => {
      if (selectedScope !== "mine") return;
      if (asignaturas.length === 0) {
        setHistoricoPorAsignatura({});
        return;
      }

      setLoadingMine(true);
      const entries = await Promise.all(
        asignaturas.map(async (asignatura) => {
          const historicoAsignatura = (await dispatch.historicoModel.getHistorico(asignatura.id)) as historico[];
          return [asignatura.id, historicoAsignatura ?? []] as const;
        })
      );

      if (!cancelled) {
        setHistoricoPorAsignatura(Object.fromEntries(entries));
        setLoadingMine(false);
      }
    };

    void loadHistoricoMisAsignaturas();

    return () => {
      cancelled = true;
    };
  }, [selectedScope, asignaturas, dispatch]);

  const handleMineScope = async () => {
    setSelectedScope("mine");
    onClose();
    if (!userId) return;
    await dispatch.asignaturaModel.getAsignaturas(userId);
  };

  const handleOtherScope = () => {
    setSelectedScope("other");
    onClose();
  };

  const handleSearchProfesor = async () => {
    const trimmed = searchProfesor.trim();
    if (!trimmed) return;

    setLoadingOther(true);
    const results = (await dispatch.historicoModel.searchHistoricoProfesor(trimmed)) as historico[];

    const ids = Array.from(new Set((results ?? []).map((item) => item.id_asignatura))).filter(Boolean);
    const missingIds = ids.filter((idAsignatura) => !asignaturaNombreById[idAsignatura]);

    if (missingIds.length > 0) {
      const fetchedEntries = await Promise.all(
        missingIds.map(async (idAsignatura) => {
          try {
            const res = await api.get(`/asignaturas/${idAsignatura}`);
            return [idAsignatura, res.data?.nombre ?? idAsignatura] as const;
          } catch {
            return [idAsignatura, idAsignatura] as const;
          }
        })
      );

      setAsignaturaNombreById((prev) => ({
        ...prev,
        ...Object.fromEntries(fetchedEntries),
      }));
    }

    setLoadingOther(false);
  };

  const handleFiltersChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltersValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(filtersValues);
    onCloseFilters();
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      curso: "",
      convocatoria: "",
      tipoConvocatoria: "",
    };
    setFiltersValues(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  const hasActiveFilters = Boolean(
    appliedFilters.curso ||
    appliedFilters.convocatoria ||
    appliedFilters.tipoConvocatoria
  );

  const formatPercent = (value: number) => `${Number(value ?? 0).toFixed(2)}%`;

  const historicoAgrupadoOtroProfesor = historico.reduce<Record<string, historico[]>>((acc, item) => {
    const key = item.id_asignatura;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});



  return (
    <Box>
      <NavBar></NavBar>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px" mx={4}>
          <ModalHeader textAlign="center">¿Sobre quién quieres ver el histórico?</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Flex align="center" justify="center" gap={4} flexWrap="wrap">
              <Button colorScheme="blue" onClick={handleMineScope}>
                Mis Asignaturas
              </Button>
              <Button variant="outline" colorScheme="blue" onClick={handleOtherScope}>
                Otro Profesor
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>

      {selectedScope === "mine" ? (
        <Container maxW="7xl" py={8}>
          <VStack align="stretch" spacing={6}>
            <Flex align="center" justify="space-between" wrap="wrap" gap={3}>
              <Heading size="lg">Histórico de mis asignaturas</Heading>
              <Flex gap={3}>
                <Button variant="outline" colorScheme="blue" onClick={onOpenFilters}>
                  Filtros
                </Button>
                {hasActiveFilters ? (
                  <Button variant="ghost" colorScheme="blue" onClick={handleClearFilters}>
                    Limpiar filtros
                  </Button>
                ) : null}
              </Flex>
            </Flex>

            {loadingMine ? (
              <Text color="gray.600">Cargando histórico...</Text>
            ) : asignaturas.length === 0 ? (
              <Text color="gray.600">No tienes asignaturas disponibles.</Text>
            ) : (
              asignaturas.map((asignatura) => {
                const rows = historicoPorAsignatura[asignatura.id] ?? [];
                const filteredRows = rows.filter((item) => {
                  const cursoMatch = !appliedFilters.curso || item.curso.toLowerCase().includes(appliedFilters.curso.toLowerCase());
                  const convocatoriaMatch = !appliedFilters.convocatoria || item.convocatoria === appliedFilters.convocatoria;
                  const tipoMatch = !appliedFilters.tipoConvocatoria || item.tipo_convocatoria === appliedFilters.tipoConvocatoria;
                  return cursoMatch && convocatoriaMatch && tipoMatch;
                });
                return (
                  <Box key={asignatura.id} borderWidth="1px" borderRadius="lg" p={4}>
                    <Heading size="md" mb={4}>{asignatura.nombre}</Heading>

                    {filteredRows.length === 0 ? (
                      <Text color="gray.500">Sin registros en el histórico.</Text>
                    ) : (
                      <TableContainer>
                        <Table size="sm">
                          <Thead>
                            <Tr>
                              <Th>Curso</Th>
                              <Th>Convocatoria</Th>
                              <Th>Tipo</Th>
                              <Th isNumeric>Matriculados</Th>
                              <Th isNumeric>Presentados</Th>
                              <Th isNumeric>% Aprobados</Th>
                              <Th>Profesor</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {filteredRows.map((item) => (
                              <Tr key={item.id}>
                                <Td>{item.curso}</Td>
                                <Td>{item.convocatoria}</Td>
                                <Td>{item.tipo_convocatoria}</Td>
                                <Td isNumeric>{item.n_matriculados}</Td>
                                <Td isNumeric>{item.n_presentados}</Td>
                                <Td isNumeric>{formatPercent(item.porcentaje_aprobados)}</Td>
                                <Td>{item.nombre_p} {item.apellidos_p}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </Box>
                );
              })
            )}
          </VStack>
        </Container>
      ) : null}

      {selectedScope === "other" ? (
        <Container maxW="7xl" py={8}>
          <VStack align="stretch" spacing={6}>
            <Heading size="lg">Histórico de otro profesor</Heading>

            <Flex gap={3} wrap="wrap">
              <Input
                value={searchProfesor}
                onChange={(e) => setSearchProfesor(e.target.value)}
                placeholder="Busca por nombre y/o apellidos"
                maxW="420px"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleSearchProfesor();
                  }
                }}
              />
              <Button colorScheme="blue" onClick={handleSearchProfesor} isDisabled={!searchProfesor.trim()}>
                Buscar
              </Button>
            </Flex>

            {loadingOther ? (
              <Text color="gray.600">Buscando histórico...</Text>
            ) : historico.length === 0 ? (
              <Text color="gray.600">No hay resultados. Prueba otro nombre o apellido.</Text>
            ) : (
              Object.entries(historicoAgrupadoOtroProfesor).map(([idAsignatura, rows]) => (
                <Box key={idAsignatura} borderWidth="1px" borderRadius="lg" p={4}>
                  <Heading size="md" mb={4}>{asignaturaNombreById[idAsignatura] ?? idAsignatura}</Heading>

                  <TableContainer>
                    <Table size="sm">
                      <Thead>
                        <Tr>
                          <Th>Profesor</Th>
                          <Th>Curso</Th>
                          <Th>Convocatoria</Th>
                          <Th>Tipo</Th>
                          <Th isNumeric>Matriculados</Th>
                          <Th isNumeric>Presentados</Th>
                          <Th isNumeric>% Aprobados</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((item) => (
                          <Tr key={item.id}>
                            <Td>{item.nombre_p} {item.apellidos_p}</Td>
                            <Td>{item.curso}</Td>
                            <Td>{item.convocatoria}</Td>
                            <Td>{item.tipo_convocatoria}</Td>
                            <Td isNumeric>{item.n_matriculados}</Td>
                            <Td isNumeric>{item.n_presentados}</Td>
                            <Td isNumeric>{formatPercent(item.porcentaje_aprobados)}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ))
            )}
          </VStack>
        </Container>
      ) : null}

      <Modal isOpen={isOpenFilters} onClose={onCloseFilters} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="20px" mx={4}>
          <ModalHeader textAlign="center">Filtros</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Curso</FormLabel>
                <Input
                  name="curso"
                  value={filtersValues.curso}
                  onChange={handleFiltersChange}
                  placeholder="Ej: 25/26"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Convocatoria</FormLabel>
                <Select
                  name="convocatoria"
                  value={filtersValues.convocatoria}
                  onChange={handleFiltersChange}
                  placeholder="Todas"
                >
                  <option value="Febrero">Febrero</option>
                  <option value="Junio">Junio</option>
                  <option value="Septiembre">Septiembre</option>
                  <option value="Diciembre">Diciembre</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Tipo de Convocatoria</FormLabel>
                <Select
                  name="tipoConvocatoria"
                  value={filtersValues.tipoConvocatoria}
                  onChange={handleFiltersChange}
                  placeholder="Todos"
                >
                  <option value="Ordinaria">Ordinaria</option>
                  <option value="Extraordinaria">Extraordinaria</option>
                </Select>
              </FormControl>

              <Flex justify="center" gap={3} pt={2}>
                <Button variant="ghost" onClick={handleClearFilters}>Limpiar</Button>
                <Button colorScheme="blue" onClick={handleApplyFilters}>Aplicar</Button>
              </Flex>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
    </Box>
  );
}