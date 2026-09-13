package com.insteip.backend.service.impl;

import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.repository.*;
import com.insteip.backend.service.interfaces.MatriculaPdfService;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class MatriculaPdfServiceImpl implements MatriculaPdfService {

    private final MatriculaRepository matriculaRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${application.frontend.base-url:https://insteip.edu.pe}")
    private String frontendBaseUrl;

    @Override
    @Transactional(readOnly = true)
    public byte[] generarPdfMatricula(Long matriculaId, String correoSolicitante) {
        Matricula matricula = matriculaRepository.findById(matriculaId)
                .orElseThrow(() -> new ResourceNotFoundException("Matrícula no encontrada con id: " + matriculaId));

        validarPermisoDescarga(matricula, correoSolicitante);
        return construirPdf(matricula);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generarMiPdfMatriculaPorCurso(Long cursoId, String correoAlumno) {
        Usuario alumno = usuarioRepository.findByCorreo(correoAlumno)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con correo: " + correoAlumno));

        Matricula matricula = matriculaRepository.findByUsuarioIdAndCursoId(alumno.getId(), cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró matrícula activa para este curso."));

        return construirPdf(matricula);
    }

    private void validarPermisoDescarga(Matricula matricula, String correoSolicitante) {
        if (correoSolicitante == null || correoSolicitante.isBlank()) {
            return;
        }

        Usuario solicitante = usuarioRepository.findByCorreo(correoSolicitante).orElse(null);
        if (solicitante == null) {
            return;
        }

        String rol = solicitante.getRol() != null ? solicitante.getRol().getNombre() : "";
        if ("ADMINISTRADOR".equalsIgnoreCase(rol)) {
            return; // Admin can download anything
        }

        boolean esElAlumno = matricula.getUsuario() != null &&
                matricula.getUsuario().getId().equals(solicitante.getId());
        
        boolean esElDocente = matricula.getCurso() != null &&
                matricula.getCurso().getDocente() != null &&
                matricula.getCurso().getDocente().getId().equals(solicitante.getId());

        if (!esElAlumno && !esElDocente) {
            throw new BadRequestException("No tiene permisos para descargar esta ficha de matrícula.");
        }
    }

    private byte[] construirPdf(Matricula matricula) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // Document setup: A4 Portrait with 32pt margins for balanced single-page layout
            Document document = new Document(PageSize.A4, 32, 32, 32, 32);
            PdfWriter writer = PdfWriter.getInstance(document, out);
            writer.setPageEvent(new MatriculaPdfPageBorder());

            document.open();

            // Institutional Color Palette
            Color primaryNavy = new Color(0, 52, 102);     // #003466
            Color secondaryGreen = new Color(0, 110, 28);  // #006e1c
            Color accentGold = new Color(180, 83, 9);      // Amber 700 #b45309
            Color darkText = new Color(30, 41, 59);        // Slate 800 #1e293b
            Color mutedGray = new Color(100, 116, 139);    // Slate 500 #64748b
            Color bgLightBlue = new Color(241, 245, 249);  // Slate 100 #f1f5f9
            Color bgGreenLight = new Color(240, 253, 244); // Emerald 50 #f0fdf4
            Color borderSlate = new Color(203, 213, 225);  // Slate 300 #cbd5e1

            // Typography Fonts
            Font fontHeaderTitle = new Font(Font.HELVETICA, 12, Font.BOLD, primaryNavy);
            Font fontHeaderSubtitle = new Font(Font.HELVETICA, 8, Font.NORMAL, mutedGray);
            Font fontSectionTitle = new Font(Font.HELVETICA, 9, Font.BOLD, primaryNavy);
            Font fontLabel = new Font(Font.HELVETICA, 8, Font.BOLD, mutedGray);
            Font fontValue = new Font(Font.HELVETICA, 9, Font.NORMAL, darkText);
            Font fontValueBold = new Font(Font.HELVETICA, 9, Font.BOLD, darkText);
            Font fontHighlight = new Font(Font.HELVETICA, 10, Font.BOLD, secondaryGreen);
            Font fontWarning = new Font(Font.HELVETICA, 9, Font.BOLD, accentGold);
            Font fontFooterNote = new Font(Font.HELVETICA, 7.5f, Font.NORMAL, mutedGray);
            Font fontLegalText = new Font(Font.HELVETICA, 8f, Font.NORMAL, darkText);

            Font fontDanger = new Font(Font.HELVETICA, 7.5f, Font.BOLD, new Color(185, 28, 28));
            Font fontDangerText = new Font(Font.HELVETICA, 7.2f, Font.NORMAL, new Color(127, 29, 29));
            Font fontPassword = new Font(Font.COURIER, 9f, Font.BOLD, primaryNavy);
            Color bgRedLight = new Color(254, 242, 242);  // Red 50
            Color borderRed = new Color(252, 165, 165);   // Red 300

            DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            DateTimeFormatter df = DateTimeFormatter.ofPattern("dd/MM/yyyy");

            Usuario alumno = matricula.getUsuario();
            Curso curso = matricula.getCurso();
            Usuario docente = curso != null ? curso.getDocente() : null;

            LocalDateTime fMatricula = matricula.getFechaMatricula() != null ? matricula.getFechaMatricula() : LocalDateTime.now();
            LocalDateTime fExpiracion = matricula.getFechaExpiracion() != null ? matricula.getFechaExpiracion() : fMatricula.plusMonths(12);

            String matriculaCodigo = String.format("MAT-%d-%05d", fMatricula.getYear(), matricula.getId());

            // =========================================================================
            // 1. TOP INSTITUTIONAL HEADER (Logo + Institution Titles + Badge Number)
            // =========================================================================
            PdfPTable headerTable = new PdfPTable(3);
            headerTable.setWidthPercentage(100);
            headerTable.setWidths(new float[]{2.0f, 5.0f, 3.0f});

            // Logo Cell
            PdfPCell logoCell = new PdfPCell();
            logoCell.setBorder(PdfPCell.NO_BORDER);
            logoCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            try {
                Path logoPath = Paths.get("..", "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
                if (!Files.exists(logoPath)) {
                    logoPath = Paths.get(System.getProperty("user.dir"), "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
                }
                if (Files.exists(logoPath)) {
                    Image logoImg = Image.getInstance(logoPath.toString());
                    logoImg.scaleToFit(105, 42);
                    logoCell.addElement(logoImg);
                } else {
                    Paragraph logoText = new Paragraph("INSTEIP", new Font(Font.HELVETICA, 17, Font.BOLD, primaryNavy));
                    logoCell.addElement(logoText);
                }
            } catch (Exception e) {
                Paragraph logoText = new Paragraph("INSTEIP", new Font(Font.HELVETICA, 17, Font.BOLD, primaryNavy));
                logoCell.addElement(logoText);
            }
            headerTable.addCell(logoCell);

            // Title Cell
            PdfPCell titleCell = new PdfPCell();
            titleCell.setBorder(PdfPCell.NO_BORDER);
            titleCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph instName = new Paragraph("INSTITUTO DE TERAPIAS INTEGRALES PERÚ", fontHeaderTitle);
            Paragraph instSubtitle = new Paragraph("SISTEMA OFICIAL DE REGISTRO Y CONTROL ACADÉMICO", fontHeaderSubtitle);
            titleCell.addElement(instName);
            titleCell.addElement(instSubtitle);
            headerTable.addCell(titleCell);

            // Enrollment Badge Cell
            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setBorder(PdfPCell.BOX);
            badgeCell.setBorderColor(primaryNavy);
            badgeCell.setBorderWidth(1.2f);
            badgeCell.setBackgroundColor(bgLightBlue);
            badgeCell.setPadding(6f);
            badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph badgeTitle = new Paragraph("FICHA DE MATRÍCULA", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            badgeTitle.setAlignment(Element.ALIGN_CENTER);
            Paragraph badgeNumber = new Paragraph(matriculaCodigo, new Font(Font.HELVETICA, 10, Font.BOLD, secondaryGreen));
            badgeNumber.setAlignment(Element.ALIGN_CENTER);
            Paragraph badgeEmision = new Paragraph("Emisión: " + LocalDateTime.now().format(df), new Font(Font.HELVETICA, 7, Font.NORMAL, darkText));
            badgeEmision.setAlignment(Element.ALIGN_CENTER);

            badgeCell.addElement(badgeTitle);
            badgeCell.addElement(badgeNumber);
            badgeCell.addElement(badgeEmision);
            headerTable.addCell(badgeCell);

            document.add(headerTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 2. DOCUMENT TITLE BANNER
            // =========================================================================
            PdfPTable bannerTable = new PdfPTable(1);
            bannerTable.setWidthPercentage(100);
            PdfPCell bannerCell = new PdfPCell();
            bannerCell.setBackgroundColor(primaryNavy);
            bannerCell.setPaddingTop(4f);
            bannerCell.setPaddingBottom(4f);
            bannerCell.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph bannerText = new Paragraph("FICHA CONSOLIDADA DE MATRÍCULA Y CONSTANCIA DE ACCESO ACADÉMICO", new Font(Font.HELVETICA, 10f, Font.BOLD, Color.WHITE));
            bannerText.setAlignment(Element.ALIGN_CENTER);
            bannerCell.addElement(bannerText);
            bannerTable.addCell(bannerCell);
            document.add(bannerTable);

            document.add(new Paragraph(" "));

            // =========================================================================
            // 1. DATOS DEL ESTUDIANTE MATRICULADO
            // =========================================================================
            PdfPTable studentTable = new PdfPTable(2);
            studentTable.setWidthPercentage(100);
            studentTable.setWidths(new float[]{1.0f, 1.0f});

            PdfPCell secEstudiante = new PdfPCell(new Phrase("1. DATOS DEL ESTUDIANTE MATRICULADO", fontSectionTitle));
            secEstudiante.setColspan(2);
            secEstudiante.setBackgroundColor(bgLightBlue);
            secEstudiante.setPadding(4f);
            secEstudiante.setBorderColor(borderSlate);
            studentTable.addCell(secEstudiante);

            String nombreCompleto = ((alumno.getNombres() != null ? alumno.getNombres() : "") + " " + 
                                     (alumno.getApellidos() != null ? alumno.getApellidos() : "")).trim().toUpperCase();

            studentTable.addCell(createDataCell("NOMBRES Y APELLIDOS COMPLETOS:", nombreCompleto, fontLabel, fontValueBold));
            studentTable.addCell(createDataCell("DOCUMENTO DE IDENTIDAD (DNI / PASAPORTE / CE):", "Documento Registrado y Verificado", fontLabel, fontValue));
            studentTable.addCell(createDataCell("CORREO ELECTRÓNICO INSTITUCIONAL / PERSONAL:", alumno.getCorreo() != null ? alumno.getCorreo() : "No registrado", fontLabel, fontValue));
            studentTable.addCell(createDataCell("TELÉFONO O WHATSAPP DE CONTACTO:", alumno.getTelefono() != null && !alumno.getTelefono().isBlank() ? alumno.getTelefono() : "No registrado", fontLabel, fontValue));

            document.add(studentTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 2. INFORMACIÓN DEL PROGRAMA ACADÉMICO
            // =========================================================================
            PdfPTable courseTable = new PdfPTable(2);
            courseTable.setWidthPercentage(100);
            courseTable.setWidths(new float[]{1.0f, 1.0f});

            PdfPCell secCurso = new PdfPCell(new Phrase("2. INFORMACIÓN DEL PROGRAMA ACADÉMICO", fontSectionTitle));
            secCurso.setColspan(2);
            secCurso.setBackgroundColor(bgLightBlue);
            secCurso.setPadding(4f);
            secCurso.setBorderColor(borderSlate);
            courseTable.addCell(secCurso);

            PdfPCell cursoCell = createDataCell("CURSO / PROGRAMA:", curso != null ? curso.getNombre().toUpperCase() : "N/A", fontLabel, fontValueBold);
            cursoCell.setColspan(2);
            courseTable.addCell(cursoCell);

            String nombreDocente = docente != null ? 
                    ((docente.getNombres() != null ? docente.getNombres() : "") + " " + 
                     (docente.getApellidos() != null ? docente.getApellidos() : "")).trim().toUpperCase() 
                    : "ASIGNADO POR LA DIRECCIÓN ACADÉMICA";

            courseTable.addCell(createDataCell("DOCENTE TITULAR:", nombreDocente, fontLabel, fontValue));
            courseTable.addCell(createDataCell("MODALIDAD DEL CURSO:", "Online Asincrónico (Acceso Campus Virtual 24/7)", fontLabel, fontValue));

            document.add(courseTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 3. VIGENCIA Y PLAZO DE ACCESO A LA PLATAFORMA
            // =========================================================================
            PdfPTable validityTable = new PdfPTable(1);
            validityTable.setWidthPercentage(100);

            PdfPCell validityCell = new PdfPCell();
            validityCell.setBackgroundColor(bgGreenLight);
            validityCell.setBorderColor(secondaryGreen);
            validityCell.setBorderWidth(1.1f);
            validityCell.setPadding(6f);

            Paragraph valHeader = new Paragraph("3. VIGENCIA Y PLAZO DE ACCESO A LA PLATAFORMA", fontSectionTitle);
            valHeader.setSpacingAfter(4f);
            validityCell.addElement(valHeader);

            PdfPTable datesInner = new PdfPTable(3);
            datesInner.setWidthPercentage(100);
            datesInner.setWidths(new float[]{1.0f, 1.0f, 1.0f});

            datesInner.addCell(createBorderLessCell("FECHA DE INICIO Y MATRÍCULA:", fMatricula.format(dtf), fontLabel, fontValueBold));
            datesInner.addCell(createBorderLessCell("FECHA DE VENCIMIENTO / PLAZO MÁXIMO:", fExpiracion.format(dtf), fontLabel, fontWarning));
            
            boolean estaActiva = matricula.getEstado() != null && matricula.getEstado();
            String estadoTexto = estaActiva ? "ACTIVA / HABILITADA" : "INACTIVA / FINALIZADA";
            datesInner.addCell(createBorderLessCell("ESTADO DE LA MATRÍCULA:", estadoTexto, fontLabel, estaActiva ? fontHighlight : fontWarning));

            validityCell.addElement(datesInner);
            validityTable.addCell(validityCell);
            document.add(validityTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 4. CREDENCIALES DE ACCESO AL AULA VIRTUAL Y ADVERTENCIA DE SEGURIDAD
            // =========================================================================
            PdfPTable credentialsTable = new PdfPTable(1);
            credentialsTable.setWidthPercentage(100);

            PdfPCell secCredenciales = new PdfPCell(new Phrase("4. CREDENCIALES DE ACCESO AL AULA VIRTUAL", fontSectionTitle));
            secCredenciales.setBackgroundColor(bgLightBlue);
            secCredenciales.setPadding(4f);
            secCredenciales.setBorderColor(borderSlate);
            credentialsTable.addCell(secCredenciales);

            PdfPCell credInnerContainer = new PdfPCell();
            credInnerContainer.setPadding(6f);
            credInnerContainer.setBorderColor(borderSlate);

            // Tabla con usuario y contraseña
            PdfPTable credFields = new PdfPTable(2);
            credFields.setWidthPercentage(100);
            credFields.setWidths(new float[]{1.0f, 1.0f});

            String userLogin = alumno.getCorreo() != null ? alumno.getCorreo() : "No registrado";
            String passLogin = (alumno.getPasswordPlain() != null && !alumno.getPasswordPlain().isBlank()) 
                    ? alumno.getPasswordPlain() 
                    : "•••••••• (Registrada previamente)";

            credFields.addCell(createDataCell("USUARIO / CORREO DE INGRESO:", userLogin, fontLabel, fontValueBold));
            credFields.addCell(createDataCell("CONTRASEÑA DE ACCESO ASIGNADA:", passLogin, fontLabel, fontPassword));

            credInnerContainer.addElement(credFields);

            // Caja de advertencia de confidencialidad y prohibición
            PdfPTable warningBox = new PdfPTable(1);
            warningBox.setWidthPercentage(100);
            warningBox.setSpacingBefore(4f);

            PdfPCell warnCell = new PdfPCell();
            warnCell.setBackgroundColor(bgRedLight);
            warnCell.setBorderColor(borderRed);
            warnCell.setBorderWidth(1f);
            warnCell.setPadding(5f);

            Paragraph warnTitle = new Paragraph("⚠️ AVISO DE CONFIDENCIALIDAD Y RESTRICCIÓN DE USO:", fontDanger);
            warnTitle.setSpacingAfter(2f);
            warnCell.addElement(warnTitle);

            Paragraph warnText = new Paragraph(
                    "Está TOTALMENTE PROHIBIDO compartir, ceder o transferir las credenciales de acceso a terceras personas. " +
                    "El sistema realiza auditoría continua de direcciones IP e inicios de sesión concurrentes. " +
                    "Cualquier infracción o uso no autorizado conllevará a la SUSPENSIÓN INMEDIATA Y DEFINITIVA del acceso " +
                    "a la plataforma educativa por falta grave a las normas y reglamentos del instituto.",
                    fontDangerText
            );
            warnText.setLeading(10.5f);
            warnCell.addElement(warnText);
            warningBox.addCell(warnCell);

            credInnerContainer.addElement(warningBox);
            credentialsTable.addCell(credInnerContainer);

            document.add(credentialsTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 5. TÉRMINOS DE COMPROMISO Y USO DE PLATAFORMA
            // =========================================================================
            PdfPTable termsTable = new PdfPTable(1);
            termsTable.setWidthPercentage(100);

            PdfPCell secTerminos = new PdfPCell(new Phrase("5. TÉRMINOS DE COMPROMISO Y USO DE PLATAFORMA", fontSectionTitle));
            secTerminos.setBackgroundColor(bgLightBlue);
            secTerminos.setPadding(4f);
            secTerminos.setBorderColor(borderSlate);
            termsTable.addCell(secTerminos);

            PdfPCell termsContentCell = new PdfPCell();
            termsContentCell.setPadding(5f);
            termsContentCell.setBorderColor(borderSlate);

            Paragraph clauseText = new Paragraph(
                    "El acceso al aula virtual y a los recursos educativos de INSTEIP es de carácter estrictamente personal e intransferible conforme al reglamento interno institucional. El estudiante se compromete al uso ético de sus credenciales y de los materiales académicos proporcionados.",
                    fontLegalText
            );
            clauseText.setLeading(11f);
            termsContentCell.addElement(clauseText);
            termsTable.addCell(termsContentCell);

            document.add(termsTable);
            document.add(new Paragraph(" "));

            // =========================================================================
            // 6. CÓDIGO QR DE VERIFICACIÓN DIGITAL Y FIRMA INSTITUCIONAL
            // =========================================================================
            PdfPTable validationTable = new PdfPTable(2);
            validationTable.setWidthPercentage(100);
            validationTable.setWidths(new float[]{1.1f, 0.9f});

            // Left Box: Código QR de verificación digital
            PdfPCell qrContainerCell = new PdfPCell();
            qrContainerCell.setBorderColor(borderSlate);
            qrContainerCell.setPadding(5f);
            qrContainerCell.setBackgroundColor(bgLightBlue);

            Paragraph qrHeader = new Paragraph("6. CÓDIGO QR DE VERIFICACIÓN DIGITAL", fontSectionTitle);
            qrHeader.setSpacingAfter(3f);
            qrContainerCell.addElement(qrHeader);

            PdfPTable qrInnerTable = new PdfPTable(2);
            qrInnerTable.setWidthPercentage(100);
            qrInnerTable.setWidths(new float[]{0.8f, 2.2f});

            PdfPCell qrImageCell = new PdfPCell();
            qrImageCell.setBorder(PdfPCell.NO_BORDER);
            qrImageCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            try {
                String validationUrl = frontendBaseUrl + "/dashboard/mis-cursos";
                String qrApiUrl = "https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=" 
                        + java.net.URLEncoder.encode(validationUrl, java.nio.charset.StandardCharsets.UTF_8);
                Image qrImg = Image.getInstance(java.net.URI.create(qrApiUrl).toURL());
                qrImg.scaleAbsolute(50, 50);
                qrImageCell.addElement(qrImg);
            } catch (Exception ignored) {}

            qrInnerTable.addCell(qrImageCell);

            PdfPCell qrDescCell = new PdfPCell();
            qrDescCell.setBorder(PdfPCell.NO_BORDER);
            qrDescCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            Paragraph qrExplanation = new Paragraph(
                    "Enlace institucional para validar la autenticidad, validez y vigencia de la matrícula.\nCódigo: " + matriculaCodigo + "\nPortal: insteip.edu.pe",
                    fontFooterNote
            );
            qrExplanation.setLeading(9.5f);
            qrDescCell.addElement(qrExplanation);
            qrInnerTable.addCell(qrDescCell);

            qrContainerCell.addElement(qrInnerTable);
            validationTable.addCell(qrContainerCell);

            // Right Box: Sello y Firma Digital de Dirección Académica
            PdfPCell signCell = new PdfPCell();
            signCell.setBorderColor(borderSlate);
            signCell.setPadding(5f);
            signCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            signCell.setVerticalAlignment(Element.ALIGN_MIDDLE);

            Paragraph spaceBeforeSign = new Paragraph("\n", new Font(Font.HELVETICA, 4));
            Paragraph signLine = new Paragraph("___________________________________", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            signLine.setAlignment(Element.ALIGN_CENTER);
            Paragraph signTitle = new Paragraph("DIRECCIÓN ACADÉMICA Y REGISTRO", new Font(Font.HELVETICA, 8, Font.BOLD, primaryNavy));
            signTitle.setAlignment(Element.ALIGN_CENTER);
            Paragraph signSub = new Paragraph("INSTEIP - Formación Continua y Especializada", fontFooterNote);
            signSub.setAlignment(Element.ALIGN_CENTER);

            signCell.addElement(spaceBeforeSign);
            signCell.addElement(signLine);
            signCell.addElement(signTitle);
            signCell.addElement(signSub);
            validationTable.addCell(signCell);

            document.add(validationTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar la ficha consolidada de matrícula en PDF: " + e.getMessage(), e);
        }
    }

    private PdfPCell createDataCell(String label, String value, Font fLabel, Font fValue) {
        PdfPCell cell = new PdfPCell();
        cell.setPadding(4.5f);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.addElement(new Paragraph(label, fLabel));
        cell.addElement(new Paragraph(value, fValue));
        return cell;
    }

    private PdfPCell createBorderLessCell(String label, String value, Font fLabel, Font fValue) {
        PdfPCell cell = new PdfPCell();
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setPadding(3f);
        cell.addElement(new Paragraph(label, fLabel));
        cell.addElement(new Paragraph(value, fValue));
        return cell;
    }
}

class MatriculaPdfPageBorder extends PdfPageEventHelper {
    @Override
    public void onEndPage(PdfWriter writer, Document document) {
        PdfContentByte cb = writer.getDirectContent();
        cb.saveState();

        // Outer institutional border
        cb.setColorStroke(new java.awt.Color(0, 52, 102));
        cb.setLineWidth(1.8f);
        cb.rectangle(18, 18, document.getPageSize().getWidth() - 36, document.getPageSize().getHeight() - 36);
        cb.stroke();

        // Inner emerald accent line
        cb.setColorStroke(new java.awt.Color(0, 110, 28));
        cb.setLineWidth(0.75f);
        cb.rectangle(22, 22, document.getPageSize().getWidth() - 44, document.getPageSize().getHeight() - 44);
        cb.stroke();

        cb.restoreState();
    }
}
