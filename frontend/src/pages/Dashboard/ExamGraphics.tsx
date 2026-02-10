import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import { useParams } from "react-router-dom";
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

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExamGraphics() {
  const dispatch = useDispatch<IDispatch>();
  const { idAsign } = useParams<{ idAsign: string }>();

  useEffect(() => {
    dispatch.examenModel.getExamenes(idAsign!);
    dispatch.asignaturaModel.getAsignatura(idAsign!);
  }, [dispatch, idAsign]);

  const asignatura =  useSelector((state: IRootState) => state.asignaturaModel.selectedAsignatura);
  const examenes =  useSelector((state: IRootState) => state.examenModel.examenes);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState("");
  const [selectedCurso, setSelectedCurso] = useState("");

  const filteredExamenes = useMemo(() => {
    return examenes.filter((examen) => {
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
  }, [examenes, selectedConvocatoria, selectedCurso]);

  const chartData = useMemo(() => {
    const grouped = new Map<
      string,
      { label: string; minutos: number; year: number; order: number }
    >();
    const convocatoriaOrder = ["Febrero", "Junio", "Septiembre", "Diciembre"];

    filteredExamenes.forEach((examen) => {
      const convocatoria = examen.convocatoria ?? "Sin convocatoria";
      const parsed = new Date(examen.fecha_examen as unknown as string);
      const yearValue = Number.isNaN(parsed.getTime()) ? 0 : parsed.getFullYear();
      const yearLabel = String(yearValue);
      const orderIndex = convocatoriaOrder.indexOf(convocatoria);
      const order = orderIndex === -1 ? convocatoriaOrder.length : orderIndex;
      const key = `${convocatoria} ${yearLabel}`;
      const current = grouped.get(key) ?? {
        label: key,
        minutos: 0,
        year: yearValue,
        order,
      };

      const minutos =
        Number(examen.duracion_h ?? 0) * 60 + Number(examen.duracion_m ?? 0);
      grouped.set(key, { ...current, minutos: current.minutos + minutos });
    });

    return Array.from(grouped.values())
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        if (a.order !== b.order) return a.order - b.order;
        return a.label.localeCompare(b.label);
      })
      .map(({ label, minutos }) => ({ label, minutos }));
  }, [filteredExamenes]);

  const yAxisTicks = useMemo(() => {
    const step = 30;
    const maxMinutes = chartData.reduce(
      (max, item) => Math.max(max, item.minutos), 0
    );
    const maxTick = Math.ceil(maxMinutes / step) * step;
    const count = maxTick / step + 1;
    return Array.from({ length: count }, (_, index) => index * step);
  }, [chartData]);

  const convocatoriaOptions = Array.from(
    new Set(examenes.map((examen) => examen.convocatoria).filter(Boolean))
  );
  const cursoOptions = useMemo(() => {
    const years = examenes
      .map((examen) => new Date(examen.fecha_examen as unknown as string))
      .filter((date) => !Number.isNaN(date.getTime()))
      .map((date) => date.getFullYear());
    return Array.from(new Set(years))
      .sort((a, b) => a - b)
      .map((year) => String(year));
  }, [examenes]);

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
      const title = asignatura?.nombre ?? "Grafica de examenes";

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

      const safeName = (asignatura?.nombre ?? "examenes")
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
            {asignatura?.nombre}
          </Heading>
          <Text color="gray.600">Gráfica histórica de los tiempos de los exámenes.</Text>
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
              w={{ base: "100%", md: "480px" }}
              direction={{ base: "column", md: "row" }}
            >
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
              <Box w="100%">
                <Text fontSize="sm" mb={1} color="gray.600" textAlign="center">
                  Año
                </Text>
                <Select
                  placeholder="Elige el año"
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
                <XAxis dataKey="label" textAnchor="end" height={60}/>
                <YAxis
                  ticks={yAxisTicks}
                  domain={[0, yAxisTicks[yAxisTicks.length - 1] ?? 0]}
                  tickFormatter={(value: number) => `${(value / 60).toFixed(1)} h`}
                />
                <Tooltip
                  formatter={(value?: number) => {
                    const minutes = Number(value ?? 0);
                    const hours = Math.floor(minutes / 60);
                    const mins = Math.round(minutes % 60);
                    return [`${hours}h ${mins}m`, "Duración"];
                  }}
                />
                <Bar dataKey="minutos" fill="#cfd4da" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        </Box>
      </Container>  
    </Box>
  );
}
