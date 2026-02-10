import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import {
  Box,
  Button,
  Container,
  Flex,
  Select,
  Text,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { IRootState, IDispatch } from "../../store/store"; 
import { NavBar } from "./NavBar";
import api from "@/configs/axios";
import type { Asignatura } from "@/types/asignatura.type";
import type { Examen } from "@/types/examen.type";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function GlobalGraphics() {
  const dispatch = useDispatch<IDispatch>();
  const userID = "user_id_ejemplo"
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAsignaturaId, setSelectedAsignaturaId] = useState("");
  const [selectedConvocatoria, setSelectedConvocatoria] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const asignaturas = useSelector(
    (state: IRootState) => state.asignaturaModel.asignaturas
  );
  const [allExamenes, setAllExamenes] = useState<Examen[]>([]);

  useEffect(() => {
    dispatch.asignaturaModel.getAsignaturas(userID);
  }, [dispatch, userID]);

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
            api.get(`/api/examen/asignatura/${asignatura.id}`)
          )
        );
        const merged = responses.flatMap((response) => response.data ?? []);
        if (isActive) {
          setAllExamenes(merged);
        }
      } catch (error) {
        console.error("Error al cargar examenes", error);
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

  const selectedAsignatura = useMemo<Asignatura | undefined>(() => {
    if (!selectedAsignaturaId) {
      return undefined;
    }
    return asignaturas.find((asignatura) => asignatura.id === selectedAsignaturaId);
  }, [asignaturas, selectedAsignaturaId]);

  const subjectsForChart = useMemo(() => {
    const base = selectedAsignaturaId
      ? asignaturas.filter((asignatura) => asignatura.id === selectedAsignaturaId)
      : asignaturas;
    const idsWithExams = new Set(allExamenes.map((examen) => examen.id_asign));
    return base.filter((asignatura) => idsWithExams.has(asignatura.id));
  }, [asignaturas, selectedAsignaturaId, allExamenes]);

  // Filtra los datos según el usuario elija
  const filteredExamenes = useMemo(() => {
    return allExamenes.filter((examen) => {
      if (selectedAsignaturaId && examen.id_asign !== selectedAsignaturaId) {
        return false;
      }
      if (selectedConvocatoria && examen.convocatoria !== selectedConvocatoria) {
        return false;
      }
      if (!selectedCurso) {
        return true;
      }
      const parsed = new Date(examen.fecha_examen as unknown as string);
      if (Number.isNaN(parsed.getTime())) {
        return false;
      }
      return String(parsed.getFullYear()) === selectedCurso;
    });
  }, [allExamenes, selectedAsignaturaId, selectedConvocatoria, selectedCurso]);

  // Prepara los datos que mostrará la gráfica
  const chartData = useMemo(() => {
    const grouped = new Map<
      string,
      Record<string, number | string>
    >();

    const convocatoriaOrder = ["Febrero", "Junio", "Septiembre", "Diciembre"];

    filteredExamenes.forEach((examen) => {
      if (subjectsForChart.length > 0 && !subjectsForChart.some((s) => s.id === examen.id_asign)) {
        return;
      }
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
      const currentValue = Number(current[examen.id_asign] ?? 0);
      grouped.set(key, {
        ...current,
        [examen.id_asign]: currentValue + minutos,
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
  }, [filteredExamenes, subjectsForChart]);

  // Prepara el eje Y, haciendo que vaya de 0.5 en 0.5
  const yAxisTicks = useMemo(() => {
    const step = 30;
    const subjectIds = subjectsForChart.map((subject) => subject.id);
    const maxMinutes = chartData.reduce((max, item) => {
      const currentMax = subjectIds.reduce((innerMax, subjectId) => {
        const value = Number(item[subjectId] ?? 0);
        return Math.max(innerMax, value);
      }, 0);
      return Math.max(max, currentMax);
    }, 0);
    const maxTick = Math.ceil(maxMinutes / step) * step;
    const count = maxTick / step + 1;
    return Array.from({ length: count }, (_, index) => index * step);
  }, [chartData, subjectsForChart]);


  // Función que aleatoriza los colores de la leyenda.
  const subjectColors = useMemo(() => {
    const hashString = (value: string) => {
      let hash = 10;
      for (let i = 0; i < value.length; i += 1) {
        hash = (hash << 5) - hash + value.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const toHsl = (seed: number) => {
      const hue = seed % 360;
      return `hsl(${hue}, 65%, 52%)`;
    };

    return subjectsForChart.reduce<Record<string, string>>((acc, subject) => {
      const seed = hashString(subject.id);
      acc[subject.id] = toHsl(seed);
      return acc;
    }, {});
  }, [subjectsForChart]);

  const formatMinutes = (value?: number) => {
    const minutes = Number(value ?? 0);
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const baseExamenesForOptions = useMemo(() => {
    if (!selectedAsignaturaId) {
      return allExamenes;
    }
    return allExamenes.filter(
      (examen) => examen.id_asign === selectedAsignaturaId
    );
  }, [allExamenes, selectedAsignaturaId]);

  const convocatoriaOptions = Array.from(
    new Set(
      baseExamenesForOptions.map((examen) => examen.convocatoria).filter(Boolean)
    )
  );
  const cursoOptions = useMemo(() => {
    const years = baseExamenesForOptions
      .map((examen) => new Date(examen.fecha_examen as unknown as string))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.getFullYear());
    return Array.from(new Set(years))
      .sort((a, b) => a - b)
      .map((year) => String(year));
  }, [baseExamenesForOptions]);

  // Función para exportar el pdf.
  const handleExportPdf = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 32;
      const titleGap = 20;
      const title = selectedAsignatura?.nombre ?? "Historico de asignaturas";

      pdf.setFontSize(30);
      const titleWidth = pdf.getTextWidth(title);
      const titleX = Math.max((pageWidth - titleWidth) / 2, margin);
      const titleY = margin+30;
      pdf.text(title, titleX, titleY);

      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - titleY - titleGap - margin;
      let imgWidth = maxWidth;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight > maxHeight) {
        const scale = maxHeight / imgHeight;
        imgWidth = imgWidth * scale;
        imgHeight = imgHeight * scale;
      }

      const x = (pageWidth - imgWidth) / 2;
      const y = titleY + titleGap + (maxHeight - imgHeight) / 2;
      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      const safeName = (selectedAsignatura?.nombre ?? "historico-asignaturas")
        .replace(/[^a-zA-Z0-9-_]+/g, "_");
      pdf.save(`grafica-${safeName}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box bg="white" w="100%" minH="100vh"> 
      <NavBar></NavBar>   
      {/* --- 1. CONTENIDO PRINCIPAL --- */}
      <Container maxW="full" py={10}>
        
        <VStack align="center" spacing={2} mb={6} textAlign="center">
          <Heading as="h1" size="lg">
            Grafica historica de los tiempos de los examenes
          </Heading>
          <Text color="gray.600">
            {selectedAsignatura?.nombre ?? "Todas las asignaturas"}
          </Text>
        </VStack>

        <Flex
          direction={{ base: "column", md: "row" }}
          align={"center"}
          gap={4}
          mb={8}
        >
          <Box flex="1" display={{ base: "none", md: "block" }} />

          <Flex flex="1" justify="center">
            <Flex
              gap={4}
              w={{ base: "100%", md: "700px" }}
              direction={{ base: "column", md: "row" }}
            >
              <Box w="100%">
                <Text fontSize="sm" mb={1} color="gray.600" textAlign="center">
                  Asignatura
                </Text>
                <Select
                  placeholder="Elige la asignatura"
                  value={selectedAsignaturaId}
                  onChange={(event) => setSelectedAsignaturaId(event.target.value)}
                >
                  {asignaturas.map((asignatura) => (
                    <option key={asignatura.id} value={asignatura.id}>
                      {asignatura.nombre}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box w="100%">
                <Text fontSize="sm" mb={1} color="gray.600" textAlign="center">
                  Curso
                </Text>
                <Select
                  placeholder="Elige el curso"
                  value={selectedCurso}
                  onChange={(event) => setSelectedCurso(event.target.value)}
                >
                  {cursoOptions.map((curso) => (
                    <option key={curso} value={curso}>
                      {curso}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box w="100%">
                <Text fontSize="sm" mb={1} color="gray.600" textAlign="center">
                  Convocatoria
                </Text>
                <Select
                  placeholder="Elige la convocatoria"
                  value={selectedConvocatoria}
                  onChange={(event) => setSelectedConvocatoria(event.target.value)}
                >
                  {convocatoriaOptions.map((convocatoria) => (
                    <option key={convocatoria} value={convocatoria}>
                      {convocatoria}
                    </option>
                  ))}
                </Select>
              </Box>
            </Flex>
          </Flex>

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

        <Box
          w="100%"
          mx="auto"
          h={"60vh"}
          ref={chartRef}
          sx={{
            "& .recharts-wrapper:focus": { outline: "none" },
            "& .recharts-wrapper:focus-visible": { outline: "none" },
            "& .recharts-surface:focus": { outline: "none" },
            "& .recharts-surface:focus-visible": { outline: "none" },
          }}
        >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" textAnchor="end" height={60} />
                <YAxis
                  ticks={yAxisTicks}
                  domain={[0, yAxisTicks[yAxisTicks.length - 1] ?? 0]}
                  tickFormatter={(value: number) => `${(value / 60).toFixed(1)} h`}
                />
                <Tooltip
                  formatter={(value?: number, name?: string) => [
                    formatMinutes(Number(value ?? 0)),
                    name ?? "Duracion",
                  ]}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                {subjectsForChart.map((subject) => (
                  <Bar
                    key={subject.id}
                    dataKey={subject.id}
                    name={subject.nombre}
                    fill={subjectColors[subject.id] ?? "#2f6fe4"}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
        </Box>
      </Container>  
    </Box>
  );
}
