import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  Heading,
  VStack,
  Link,
  Modal,
  useDisclosure,
  ModalBody,
  ModalOverlay,
  ModalHeader,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  FormControl,
  FormLabel,
  Checkbox,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import api from "@/configs/axios";
import type { Asignatura } from "@/types/asignatura.type";
import type { Examen } from "@/types/examen.type";

import { Link as RouterLink } from "react-router-dom";

import { useAuth } from "@clerk/clerk-react";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GlobalGraphics() {
  const dispatch = useDispatch<IDispatch>();
  const { userId } = useAuth();


  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAsignaturaIds, setSelectedAsignaturaIds] = useState<string[]>([]);
  const [selectedConvocatorias, setSelectedConvocatorias] = useState<string[]>([]);
  const [selectedCursos, setSelectedCursos] = useState<string[]>([]);
  const [draftAsignaturaIds, setDraftAsignaturaIds] = useState<string[]>([]);
  const [draftConvocatorias, setDraftConvocatorias] = useState<string[]>([]);
  const [draftCursos, setDraftCursos] = useState<string[]>([]);

  const { isOpen: isOpenFilter, onOpen: onOpenFilter, onClose: onCloseFilters } = useDisclosure();

  const asignaturas = useSelector(
    (state: IRootState) => state.asignaturaModel.asignaturas
  );
  const [allExamenes, setAllExamenes] = useState<Examen[]>([]);

  useEffect(() => {
    dispatch.asignaturaModel.getAsignaturas(userId!);
  }, [dispatch, userId]);

  useEffect(() => {
    let isActive = true;

    const loadAllExamenes = async () => {
      if (asignaturas.length === 0) {
        if (isActive) setAllExamenes([]);
        return;
      }
      try {
        const responses = await Promise.all(
          asignaturas.map((asignatura) =>
            api.get(`/examen/asignatura/${asignatura.id}`)
          )
        );
        const merged = responses.flatMap((response) => response.data ?? []);
        if (isActive) {
          setAllExamenes(merged);
        }
      } catch (error) {
        if (isActive) {
          setAllExamenes([]);
        }
      }
    };

    loadAllExamenes();

    return () => {
      isActive = false;
    };
  }, [asignaturas]);

  const selectedAsignaturas = useMemo<Asignatura[]>(() => {
    if (selectedAsignaturaIds.length === 0) {
      return [];
    }
    return asignaturas.filter((asignatura) => selectedAsignaturaIds.includes(asignatura.id));
  }, [asignaturas, selectedAsignaturaIds]);

  const selectedAsignaturaLabel = useMemo(() => {
    if (selectedAsignaturas.length === 1) {
      return selectedAsignaturas[0].nombre;
    }
    if (selectedAsignaturas.length > 1) {
      return "Varias asignaturas";
    }
    return "Todas las asignaturas";
  }, [selectedAsignaturas]);

  const hasActiveFilters =
    selectedAsignaturaIds.length > 0 ||
    selectedConvocatorias.length > 0 ||
    selectedCursos.length > 0;

  const toggleValue = (
    value: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
      return;
    }
    setSelected([...selected, value]);
  };

  const handleOpenFilters = () => {
    setDraftAsignaturaIds(selectedAsignaturaIds);
    setDraftConvocatorias(selectedConvocatorias);
    setDraftCursos(selectedCursos);
    onOpenFilter();
  };

  const handleApplyFilters = () => {
    setSelectedAsignaturaIds(draftAsignaturaIds);
    setSelectedConvocatorias(draftConvocatorias);
    setSelectedCursos(draftCursos);
    onCloseFilters();
  };

  const handleClearFilters = () => {
    setDraftAsignaturaIds([]);
    setDraftConvocatorias([]);
    setDraftCursos([]);
    setSelectedAsignaturaIds([]);
    setSelectedConvocatorias([]);
    setSelectedCursos([]);
  };

  const subjectsWithExams = useMemo(() => {
    const idsWithExams = new Set(allExamenes.map((examen) => examen.id_asign));
    return asignaturas.filter((asignatura) => idsWithExams.has(asignatura.id));
  }, [asignaturas, allExamenes]);

  const subjectsForChart = useMemo(() => {
    if (selectedAsignaturaIds.length === 0) {
      return subjectsWithExams;
    }
    return subjectsWithExams.filter((asignatura) => selectedAsignaturaIds.includes(asignatura.id));
  }, [subjectsWithExams, selectedAsignaturaIds]);

  const orderedSubjectsForChart = useMemo(() => {
    return [...subjectsForChart].sort((a, b) => {
      const nameComparison = a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" });
      if (nameComparison !== 0) {
        return nameComparison;
      }
      return a.id.localeCompare(b.id);
    });
  }, [subjectsForChart]);

  const getHueDistance = (a: number, b: number) => {
    const diff = Math.abs(a - b);
    return Math.min(diff, 360 - diff);
  };

  const buildDistinctRandomColors = (count: number) => {
    if (count <= 0) {
      return [];
    }

    const colors: string[] = [];
    const usedHues: number[] = [];
    const minHueDistance = 26;
    const goldenAngle = 137.508;
    const baseHue = Math.random() * 360;

    for (let index = 0; index < count; index += 1) {
      let attempt = 0;
      let hue = (baseHue + index * goldenAngle) % 360;

      while (
        attempt < 8
        && usedHues.some((used) => getHueDistance(used, hue) < minHueDistance)
      ) {
        hue = (hue + Math.random() * 40 + 10) % 360;
        attempt += 1;
      }

      usedHues.push(hue);

      const saturation = 65 + Math.floor(Math.random() * 16);
      const lightness = 45 + Math.floor(Math.random() * 10);
      colors.push(`hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };

  const normalizeSeriesKey = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

  const chartSeries = useMemo(() => {
    const seriesByKey = new Map<string, { key: string; label: string }>();

    orderedSubjectsForChart.forEach((subject) => {
      const key = normalizeSeriesKey(subject.nombre);
      if (!seriesByKey.has(key)) {
        seriesByKey.set(key, {
          key,
          label: subject.nombre,
        });
      }
    });

    const uniqueSeries = Array.from(seriesByKey.values());
    const randomColors = buildDistinctRandomColors(uniqueSeries.length);

    return uniqueSeries.map((series, index) => ({
      ...series,
      color: randomColors[index],
    }));
  }, [orderedSubjectsForChart]);

  const subjectSeriesKeyById = useMemo(() => {
    const map = new Map<string, string>();

    subjectsForChart.forEach((subject) => {
      map.set(subject.id, normalizeSeriesKey(subject.nombre));
    });

    return map;
  }, [subjectsForChart]);

  // Filtra los datos según el usuario elija
  const filteredExamenes = useMemo(() => {
    return allExamenes.filter((examen) => {
      if (selectedAsignaturaIds.length > 0 && !selectedAsignaturaIds.includes(examen.id_asign)) {
        return false;
      }
      if (selectedConvocatorias.length > 0 && !selectedConvocatorias.includes(examen.convocatoria)) {
        return false;
      }
      if (selectedCursos.length === 0) {
        return true;
      }
      const parsed = new Date(examen.fecha_examen as unknown as string);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      return selectedCursos.includes(String(parsed.getFullYear()));
    });
  }, [allExamenes, selectedAsignaturaIds, selectedConvocatorias, selectedCursos]);

  // Prepara los datos que mostrará la gráfica
  const chartData = useMemo<Array<Record<string, number | string>>>(() => {
    const grouped = new Map<
      string,
      Record<string, number | string>
    >();

    const convocatoriaOrder = ["Febrero", "Junio", "Septiembre", "Diciembre"];

    filteredExamenes.forEach((examen) => {
      const seriesKey = subjectSeriesKeyById.get(examen.id_asign);
      if (!seriesKey) return;

      const convocatoria = examen.convocatoria ?? "Sin convocatoria";
      const parsed = new Date(examen.fecha_examen as unknown as string);
      const yearValue = Number.isNaN(parsed.getTime()) ? 0 : parsed.getFullYear();
      const yearLabel = String(yearValue);
      const orderIndex = convocatoriaOrder.indexOf(convocatoria);
      const order = orderIndex === -1 ? convocatoriaOrder.length : orderIndex;
      const key = `${convocatoria} ${yearLabel}`;
      const current = grouped.get(key) ?? {
        label: key,
        year: yearValue,
        order,
      };

      const minutos =
        Number(examen.duracion_h ?? 0) * 60 + Number(examen.duracion_m ?? 0);
      const presentados = Number(examen.sesion?.[0]?.n_present ?? 0);
      const currentValue = Number(current[seriesKey] ?? 0);
      const presentadosKey = `presentados_${seriesKey}`;
      const currentPresentadosValue = Number(current[presentadosKey] ?? 0);
      grouped.set(key, {
        ...current,
        [seriesKey]: currentValue + minutos,
        [presentadosKey]: currentPresentadosValue + presentados,
      });
    });

    return Array.from(grouped.values())
      .sort((a, b) => {
        const yearA = Number(a.year ?? 0);
        const yearB = Number(b.year ?? 0);
        const orderA = Number(a.order ?? 0);
        const orderB = Number(b.order ?? 0);
        const labelA = String(a.label ?? "");
        const labelB = String(b.label ?? "");
        if (yearA !== yearB) return yearA - yearB;
        if (orderA !== orderB) return orderA - orderB;
        return labelA.localeCompare(labelB);
      })
      .map(({ label, ...rest }) => ({ label, ...rest }));
  }, [filteredExamenes, subjectSeriesKeyById]);

  // Prepara el eje Y, haciendo que vaya de 0.5 en 0.5
  const yAxisTicks = useMemo(() => {
    const step = 30;
    const seriesKeys = chartSeries.map((series) => series.key);
    const maxMinutes = chartData.reduce((max, item) => {
      const currentMax = seriesKeys.reduce((innerMax, seriesKey) => {
        const value = Number(item[seriesKey] ?? 0);
        return Math.max(innerMax, value);
      }, 0);
      return Math.max(max, currentMax);
    }, 0);
    const maxTick = Math.ceil(maxMinutes / step) * step;
    const count = maxTick / step + 1;
    return Array.from({ length: count }, (_, index) => index * step);
  }, [chartData, chartSeries]);


  const formatMinutes = (value?: number) => {
    const minutes = Number(value ?? 0);
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const convocatoriaOptions = Array.from(
    new Set(allExamenes.map((examen) => examen.convocatoria).filter(Boolean))
  );
  const cursoOptions = useMemo(() => {
    const years = allExamenes
      .map((examen) => new Date(examen.fecha_examen as unknown as string))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.getFullYear());
    return Array.from(new Set(years))
      .sort((a, b) => a - b)
      .map((year) => String(year));
  }, [allExamenes]);

  // Función para exportar el pdf
  const handleExportPdf = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const chartElement = chartRef.current;

      if ("fonts" in document) {
        await (document as Document & { fonts: FontFaceSet }).fonts.ready;
      }

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      const sourceCanvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        width: chartElement.scrollWidth,
        height: chartElement.scrollHeight,
        windowWidth: chartElement.scrollWidth,
        windowHeight: chartElement.scrollHeight,
      });

      const imgData = sourceCanvas.toDataURL("image/png");
      const canvasWidth = sourceCanvas.width;
      const canvasHeight = sourceCanvas.height;
      const horizontalPadding = 32;
      const topPadding = 20;
      const bottomPadding = 24;
      const titleHeight = 118;
      const titleGap = 12;
      const pageWidth = canvasWidth + horizontalPadding * 2;
      const pageHeight = canvasHeight + topPadding + titleHeight + titleGap + bottomPadding;

      const pdf = new jsPDF({
        orientation: pageWidth >= pageHeight ? "landscape" : "portrait",
        unit: "px",
        format: [pageWidth, pageHeight],
      });

      const title = selectedAsignaturaLabel === "Todas las asignaturas"
        ? "Histórico de asignaturas"
        : selectedAsignaturaLabel;

      pdf.setFontSize(76);
      const titleWidth = pdf.getTextWidth(title);
      const titleX = Math.max((pageWidth - titleWidth) / 2, horizontalPadding);
      const titleY = topPadding + titleHeight - 20;
      pdf.text(title, titleX, titleY);

      const x = horizontalPadding;
      const y = topPadding + titleHeight + titleGap;
      pdf.addImage(imgData, "PNG", x, y, canvasWidth, canvasHeight);

      const safeName = (selectedAsignaturas.length === 1
        ? selectedAsignaturas[0].nombre
        : selectedAsignaturas.length > 1
          ? "varias-asignaturas"
          : "historico-asignaturas")
        .replace(/[^a-zA-Z0-9-_]+/g, "_");
      pdf.save(`grafica-${safeName}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box bg="white" w="100%" minH="100vh"> 
      <NavBar></NavBar>   
      <Link as={RouterLink} to="/" color="blue.600" >
        <Text fontSize={"md"} mt={"5"} ml={"3"} >&lt; Volver al inicio</Text>
      </Link>
      {/* --- 1. CONTENIDO PRINCIPAL --- */}
      <Container maxW="full">
        <VStack align="center" spacing={2} mb={6} textAlign="center" marginBottom={"85"}>
          <Heading as="h1" size="lg">
            Gráfica Histórica de los Tiempos de Exámenes
          </Heading>
        </VStack>

        {chartData > 0 ? (
          <Flex
          direction={{ base: "column", md: "row" }}
          align={"center"}
          gap={4}
          mb={8}
        >
          <Button 
            onClick={handleOpenFilters} 
            bgColor={"#0055D4"}
            _hover={{ borderColor: "#0055D4", boxShadow: "none" }}
            color={"white"}
            borderRadius={"15"}
            w="25vh"
            minH={"5vh"}>
            Filtros
          </Button>

          {hasActiveFilters && (
            <Button
              onClick={handleClearFilters}
              variant="outline"
              borderColor="#0055D4"
              color="#0055D4"
              borderRadius={"15"}
              w="25vh"
              minH={"5vh"}
            >
              Limpiar filtros
            </Button>
          )}

          <Flex flex="1" justify={"flex-end"}>
            <Button
            bgColor={"#0055D4"}
            _hover={{ borderColor: "#0055D4", boxShadow: "none" }}
            color={"white"}
            borderRadius={"15"}
            w="25vh"
            minH={"5vh"}
            onClick={handleExportPdf}
            isLoading={isExporting}
            isDisabled={isExporting}
            loadingText="Generando"
           >
            Descargar gráfica
            </Button>
          </Flex>
        </Flex>
        ) : null}
        
        <Box
          w="100%"
          h={"60vh"}
          minH="320px"
          ref={chartRef}
          position="relative"
          sx={{
            "& .recharts-wrapper:focus": { outline: "none" },
            "& .recharts-wrapper:focus-visible": { outline: "none" },
            "& .recharts-surface:focus": { outline: "none" },
            "& .recharts-surface:focus-visible": { outline: "none" },
          }}
        >
          
          {chartData.length > 0 ? (
            <Box w="100%" display="flex" justifyContent="center" mb={3}>
              <Box
                bg="white"
                px={3}
                py={2}
                display="inline-block"
                w="fit-content"
                maxW="100%"
              >
                <VStack as="ul" align="start" spacing={1} m={0} p={0} listStyleType="none">
                  <Text as="li" fontSize="xs" lineHeight="18px" m={0} color="gray.800" whiteSpace="nowrap">
                    <Box as="span" color="#2f6fe4" fontSize="13px" lineHeight="18px" verticalAlign="baseline">
                      ■
                    </Box>
                    <Box as="span" ml={2} verticalAlign="baseline">
                      Barras: nº de horas
                    </Box>
                  </Text>
                  <Text as="li" fontSize="xs" lineHeight="18px" m={0} color="gray.800" whiteSpace="nowrap">
                    <Box as="span" color="#2f6fe4" fontSize="12px" lineHeight="18px" verticalAlign="baseline">
                      ●
                    </Box>
                    <Box as="span" ml={2} verticalAlign="baseline">
                      Círculos: nº de alumnos presentados
                    </Box>
                  </Text>
                </VStack>
              </Box>
            </Box>

          ) : null}

          <Flex w="100%" h="100%" align="stretch" gap={4}>
            <Box flex="1" minW={0}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={320}>
                  <ComposedChart data={chartData} barCategoryGap="40%" barGap={8}>
                    <XAxis dataKey="label" textAnchor="middle" height={60} />
                    <YAxis
                      ticks={yAxisTicks}
                      domain={[0, yAxisTicks[yAxisTicks.length - 1] ?? 0]}
                      tickFormatter={(value: number) => `${(value / 60).toFixed(1)} h`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.1)]}
                      tickFormatter={(value: number) => `${value}`}
                    />
                    <Tooltip
                      formatter={(value?: number, name?: string) => {
                        if ((name ?? "").includes("Presentados")) {
                          return [`${Number(value ?? 0)}`, "Presentados"];
                        }
                        return [
                          formatMinutes(Number(value ?? 0)),
                          name ?? "Duracion",
                        ];
                      }}
                    />

                    {chartSeries.map((series) => (
                      <Bar
                        key={series.key}
                        dataKey={series.key}
                        name={series.label}
                        fill={series.color}
                        barSize={18}
                      />
                    ))}
                    {chartSeries.map((series) => (
                      <Line
                        key={`presentados_${series.key}`}
                        type="linear"
                        yAxisId="right"
                        dataKey={`presentados_${series.key}`}
                        name={`${series.label} (Presentados)`}
                        stroke={series.color}
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={{ r: 7, fill: series.color }}
                        activeDot={{ r: 9 }}
                        legendType="none"
                        connectNulls
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" textAlign="center" >
                  <VStack spacing={3} align="center" mx="auto" maxW="640px">
                    <Heading as="h3" size="md" color="gray.700">
                      La gráfica no está disponible
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      ¡Prueba a añadir algún exámen en tus asignaturas!
                    </Text>
                  </VStack>
                </Box>
              )}
              
            </Box>

            <Box w="320px" alignSelf="center" pr={2}>
              <Box as="ul" listStyleType="none" m={0} p={0}>
                {chartSeries.map((series) => (
                  <Box
                    as="li"
                    key={series.key}
                    minH="22px"
                    mb="6px"
                    whiteSpace="nowrap"
                  >
                    <Text fontSize="sm" lineHeight="22px" m={0} color="gray.800">
                      <Box as="span" color={series.color} fontSize="15px" lineHeight="22px" verticalAlign="baseline">
                        ■
                      </Box>
                      <Box as="span" ml={2} verticalAlign="baseline">
                        {series.label}
                      </Box>
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          </Flex>
        </Box>
      </Container>  

      <Modal isOpen={isOpenFilter} onClose={onCloseFilters} isCentered >
        <ModalOverlay />
          <ModalContent justifyContent={"center"} alignContent={"center"} borderRadius={"20px"}>
            <ModalHeader textAlign={"center"}>Filtros</ModalHeader>
            <ModalCloseButton />
            <ModalBody >
              <Flex justifyContent={"center"} mb={"3"}>
                <VStack w="100%">
                  <FormControl>
                    <FormLabel fontWeight="semibold">Asignaturas</FormLabel>
                    <SimpleGrid columns={1} spacing={2} overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="xl" p={3}>
                      {subjectsWithExams.map((asignatura) => (
                        <Checkbox
                          key={asignatura.id}
                          isChecked={draftAsignaturaIds.includes(asignatura.id)}
                          onChange={() => toggleValue(asignatura.id, draftAsignaturaIds, setDraftAsignaturaIds)}
                        >
                          {asignatura.nombre}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="semibold">Curso</FormLabel>
                    <SimpleGrid columns={2} spacing={2} maxH="140px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="xl" p={3}>
                      {cursoOptions.map((curso) => (
                        <Checkbox
                          key={curso}
                          isChecked={draftCursos.includes(curso)}
                          onChange={() => toggleValue(curso, draftCursos, setDraftCursos)}
                        >
                          {curso}
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontWeight="semibold">Convocatoria</FormLabel>
                    <Stack spacing={2} border="1px solid" borderColor="gray.200" borderRadius="xl" p={3}>
                      {convocatoriaOptions.map((convocatoria) => (
                        <Checkbox
                          key={convocatoria}
                          isChecked={draftConvocatorias.includes(convocatoria)}
                          onChange={() => toggleValue(convocatoria, draftConvocatorias, setDraftConvocatorias)}
                        >
                          {convocatoria}
                        </Checkbox>
                      ))}
                    </Stack>
                  </FormControl>
                </VStack>
              </Flex>
            </ModalBody>
            <ModalFooter justifyContent={"center"} gap={3}>
              <Button
                variant="outline"
                onClick={handleClearFilters}
              >
                Limpiar
              </Button>
              <Button 
                  colorScheme='blue' 
                  onClick={handleApplyFilters}
                  _hover={{bgcolor:"red"}}
                >
                  Filtrar
                </Button>
            </ModalFooter>
          </ModalContent>
      </Modal>
    </Box>
  );
}
