package com.insteip.backend.service.impl;


import lombok.RequiredArgsConstructor;
import com.insteip.backend.domain.entity.*;
import com.insteip.backend.domain.exception.ResourceNotFoundException;
import com.insteip.backend.domain.exception.BadRequestException;
import com.insteip.backend.repository.*;
import com.insteip.backend.domain.dto.certificado.CertificadoResponseDTO;
import com.insteip.backend.service.interfaces.CertificadoService;
import com.insteip.backend.infrastructure.util.ProgresoAcademicoUtils;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.awt.Color;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificadoServiceImpl implements CertificadoService {

    private final CertificadoRepository certificadoRepository;

    private final UsuarioRepository usuarioRepository;

    private final CursoRepository cursoRepository;

    private final ModuloRepository moduloRepository;

    private final VideoRepository videoRepository;

    private final AvanceVideoRepository avanceVideoRepository;

    private final com.insteip.backend.service.interfaces.AuditoriaService auditoriaService;

    private final PlantillaCertificadoRepository plantillaCertificadoRepository;

    @org.springframework.beans.factory.annotation.Value("${application.storage.path}")
    private String storagePathSetting;

    @org.springframework.beans.factory.annotation.Value("${application.api.base-url}")
    private String apiBaseUrl;

    @org.springframework.beans.factory.annotation.Value("${application.frontend.base-url}")
    private String frontendBaseUrl;

    private String UPLOADS_DIR;

    @jakarta.annotation.PostConstruct
    public void init() {
        java.nio.file.Path base = java.nio.file.Paths.get(storagePathSetting).toAbsolutePath().normalize();
        this.UPLOADS_DIR = base.resolve("certificados").toString();
        try {
            Files.createDirectories(java.nio.file.Paths.get(this.UPLOADS_DIR));
        } catch (IOException e) {
            System.err.println("Could not create certificates directory: " + e.getMessage());
        }
    }

    @Override
    public Certificado generarCertificado(Long usuarioId, Long cursoId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + usuarioId));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new ResourceNotFoundException("Curso no encontrado con id: " + cursoId));

        // 1. Check if course progress is 100%
        if (!isCursoCompletado(usuarioId, curso)) {
            throw new BadRequestException("El curso no ha sido completado al 100% todavía. Complete todos los videos para emitir su certificado.");
        }

        // 2. Return existing if already generated
        return certificadoRepository.findByUsuarioIdAndCursoId(usuarioId, cursoId)
                .map(existing -> repairIfNeeded(existing, usuario, curso))
                .orElseGet(() -> createCertificate(usuario, curso, usuarioId, cursoId));
    }

    @Override
    public Certificado obtenerCertificado(Long id) {
        return certificadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificado no encontrado con id: " + id));
    }

    @Override
    public Certificado validarCertificado(String codigo) {
        return certificadoRepository.findByCodigo(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Certificado inválido o no existente con código: " + codigo));
    }

    private boolean isCursoCompletado(Long usuarioId, Curso curso) {
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrdenAsc(curso.getId());
        int totalVideos = 0;
        int completedVideos = 0;

        for (Modulo modulo : modulos) {
            if (!modulo.getEstado()) continue;
            List<Video> videos = videoRepository.findByModuloIdOrderByOrdenAsc(modulo.getId());
            for (Video video : videos) {
                if (!video.getEstado()) continue;
                totalVideos++;
                AvanceVideo avance = avanceVideoRepository.findByUsuarioIdAndVideoId(usuarioId, video.getId())
                        .orElse(null);
                if (ProgresoAcademicoUtils.isVideoCompletado(video, avance)) {
                    completedVideos++;
                }
            }
        }

        return completedVideos == totalVideos;
    }

    private Certificado repairIfNeeded(Certificado cert, Usuario usuario, Curso curso) {
        boolean needsRepair = cert.getArchivoPdf() == null || cert.getArchivoPdf().isBlank();
        if (!needsRepair) {
            try {
                String fileName = cert.getCodigo() + ".pdf";
                Path filePath = Paths.get(UPLOADS_DIR).resolve(fileName);
                needsRepair = !Files.exists(filePath);
            } catch (Exception e) {
                needsRepair = true;
            }
        }

        if (!needsRepair) {
            return cert;
        }

        try {
            writePdfOnDisk(cert, usuario, curso);
        } catch (Exception e) {
            throw new RuntimeException("Error al reparar el archivo físico del certificado: " + e.getMessage());
        }

        cert.setUrlValidacion(frontendBaseUrl + "/certificados/validar/" + cert.getCodigo());
        cert.setArchivoPdf(resolvePdfUrl(cert));
        return certificadoRepository.save(cert);
    }

    private Certificado createCertificate(Usuario usuario, Curso curso, Long usuarioId, Long cursoId) {
        String codigoUnico = "INS-2026-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String numRegistro = "REG-" + System.currentTimeMillis() / 1000;

        Certificado cert = Certificado.builder()
                .usuario(usuario)
                .curso(curso)
                .codigo(codigoUnico)
                .archivoPdf("") // Updated below
                .urlValidacion(frontendBaseUrl + "/certificados/validar/" + codigoUnico)
                .numeroRegistro(numRegistro)
                .fechaEmision(LocalDateTime.now())
                .build();

        cert = certificadoRepository.save(cert);

        try {
            writePdfOnDisk(cert, usuario, curso);
        } catch (Exception e) {
            certificadoRepository.delete(cert);
            throw new RuntimeException("Error al generar el archivo físico del certificado: " + e.getMessage());
        }

        cert.setArchivoPdf(resolvePdfUrl(cert));
        Certificado saved = certificadoRepository.save(cert);
        auditoriaService.registrarEvento("CERTIFICADO", "GENERAR", "Generado certificado para curso ID: " + cursoId + " y usuario ID: " + usuarioId);
        return saved;
    }

    private String resolvePdfUrl(Certificado cert) {
        return apiBaseUrl + "/api/certificados/" + cert.getId() + "/download";
    }

    private void writePdfOnDisk(Certificado cert, Usuario usuario, Curso curso) throws DocumentException, IOException {
        String filename = cert.getCodigo() + ".pdf";
        Path targetPath = Paths.get(UPLOADS_DIR).resolve(filename);

        // A4 landscape size
        Document document = new Document(PageSize.A4.rotate(), 50, 50, 35, 35);
        PdfWriter writer = PdfWriter.getInstance(document, Files.newOutputStream(targetPath));
        writer.setPageEvent(new CertificatePageBorder());
        
        document.open();

        Color primaryColor = new Color(0, 52, 102);     // Brand Navy Blue (#003466)
        Color secondaryColor = new Color(0, 110, 28);   // Brand Forest Green (#006e1c)
        Color grayColor = new Color(75, 85, 99);        // Tailwind Gray 600
        Color lightGrayColor = new Color(156, 163, 175); // Tailwind Gray 400

        Font titleFont = new Font(Font.HELVETICA, 26, Font.BOLD, primaryColor);
        Font nameFont = new Font(Font.HELVETICA, 30, Font.BOLD, primaryColor);
        Font bodyFont = new Font(Font.HELVETICA, 10, Font.NORMAL, grayColor);
        Font italicBodyFont = new Font(Font.HELVETICA, 11, Font.ITALIC, grayColor);
        Font courseFont = new Font(Font.HELVETICA, 20, Font.BOLD | Font.ITALIC, secondaryColor);
        Font dateFont = new Font(Font.HELVETICA, 9, Font.ITALIC, grayColor);
        Font metaFont = new Font(Font.COURIER, 8, Font.BOLD, lightGrayColor);

        Paragraph spacer = new Paragraph("\n");
        document.add(spacer);

        // 1. Header Section: Brand Logo & Subtitle
        boolean hasLogo = false;
        try {
            // Load and align insteip-logo.png
            Path logoPath = Paths.get("..", "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
            if (!Files.exists(logoPath)) {
                logoPath = Paths.get(System.getProperty("user.dir"), "frontend", "src", "assets", "insteip-logo.png").toAbsolutePath().normalize();
            }
            if (Files.exists(logoPath)) {
                Image logoImg = Image.getInstance(logoPath.toString());
                logoImg.setAlignment(Element.ALIGN_CENTER);
                logoImg.scaleToFit(180, 60); // Make the brand mark more prominent
                document.add(logoImg);
                hasLogo = true;
            }
        } catch (Exception e) {
            System.err.println("Could not load branding logo in PDF: " + e.getMessage());
        }

        if (!hasLogo) {
            Paragraph fallbackBrand = new Paragraph("INSTEIP", new Font(Font.HELVETICA, 24, Font.BOLD, primaryColor));
            fallbackBrand.setAlignment(Element.ALIGN_CENTER);
            document.add(fallbackBrand);
        }

        Paragraph insteipSubtitle = new Paragraph("INSTITUTO DE TERAPIAS INTEGRALES PERÚ", new Font(Font.HELVETICA, 8, Font.BOLD, grayColor));
        insteipSubtitle.setAlignment(Element.ALIGN_CENTER);
        document.add(insteipSubtitle);
        document.add(spacer);

        // Solid green line divider
        PdfPTable lineDivider = new PdfPTable(1);
        lineDivider.setWidthPercentage(85);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBorder(PdfPCell.NO_BORDER);
        lineCell.setBackgroundColor(secondaryColor);
        lineCell.setFixedHeight(2f); // 2pt solid line
        lineDivider.addCell(lineCell);
        document.add(lineDivider);
        document.add(spacer);

        // 2. Certificate Body Content
        Paragraph mainTitle = new Paragraph("CERTIFICADO DE CULMINACIÓN Y EXCELENCIA ACADÉMICA", titleFont);
        mainTitle.setAlignment(Element.ALIGN_CENTER);
        mainTitle.setSpacingAfter(4f);
        document.add(mainTitle);
        document.add(spacer);

        Paragraph certText1 = new Paragraph("Se hace constar por medio del presente documento que", italicBodyFont);
        certText1.setAlignment(Element.ALIGN_CENTER);
        document.add(certText1);
        document.add(spacer);

        Paragraph studentName = new Paragraph(usuario.getNombres().toUpperCase() + " " + usuario.getApellidos().toUpperCase(), nameFont);
        studentName.setAlignment(Element.ALIGN_CENTER);
        studentName.setSpacingAfter(2f);
        document.add(studentName);
        document.add(spacer);

        Paragraph certText2 = new Paragraph("ha cursado y aprobado satisfactoriamente todos los módulos y evaluaciones correspondientes al programa de estudios en:", bodyFont);
        certText2.setAlignment(Element.ALIGN_CENTER);
        document.add(certText2);
        document.add(spacer);

        Paragraph courseName = new Paragraph("\"" + curso.getNombre().toUpperCase() + "\"", courseFont);
        courseName.setAlignment(Element.ALIGN_CENTER);
        courseName.setSpacingAfter(2f);
        document.add(courseName);
        document.add(spacer);

        // Date of emission
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy");
        String formattedDate = cert.getFechaEmision().format(formatter);
        Paragraph emitDate = new Paragraph("Emitido en la plataforma el día " + formattedDate + ".", dateFont);
        emitDate.setAlignment(Element.ALIGN_CENTER);
        document.add(emitDate);
        document.add(spacer);

        // 3. Bottom Section (2 Columns: QR Validation and Signature)
        com.lowagie.text.pdf.PdfPTable footerTable = new com.lowagie.text.pdf.PdfPTable(2);
        footerTable.setWidthPercentage(90);
        try {
            footerTable.setWidths(new float[]{1.2f, 1.0f});
        } catch (DocumentException de) {
            // ignore
        }

        // Left cell: Validation QR and Instructions
        com.lowagie.text.pdf.PdfPCell leftCell = new com.lowagie.text.pdf.PdfPCell();
        leftCell.setBorder(com.lowagie.text.pdf.PdfPCell.NO_BORDER);
        leftCell.setHorizontalAlignment(Element.ALIGN_CENTER);

        boolean hasQr = false;
        try {
            String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=" 
                    + java.net.URLEncoder.encode(cert.getUrlValidacion(), java.nio.charset.StandardCharsets.UTF_8);
            Image qrImage = Image.getInstance(java.net.URI.create(qrUrl).toURL());
            qrImage.setAlignment(Element.ALIGN_CENTER);
            qrImage.scaleAbsolute(65, 65);
            leftCell.addElement(qrImage);
            hasQr = true;
        } catch (Exception e) {
            System.err.println("Could not generate QR Code: " + e.getMessage());
        }

        Font qrFont = new Font(Font.HELVETICA, 7, Font.NORMAL, grayColor);
        Paragraph qrText = new Paragraph(hasQr ? "Escanee para validar la autenticidad académica" : "[ Escanee QR para Validar en Servidor ]", qrFont);
        qrText.setAlignment(Element.ALIGN_CENTER);
        leftCell.addElement(qrText);
        footerTable.addCell(leftCell);

        // Right cell: Signature line & Director details
        com.lowagie.text.pdf.PdfPCell rightCell = new com.lowagie.text.pdf.PdfPCell();
        rightCell.setBorder(com.lowagie.text.pdf.PdfPCell.NO_BORDER);
        rightCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        rightCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
        rightCell.setPaddingTop(10);

        String cargoDir = "Director Académico";
        String firmaDirText = "Firma del Director";

        PlantillaCertificado plantilla = plantillaCertificadoRepository.findAll().stream()
                .filter(p -> p.getActivo() != null && p.getActivo())
                .findFirst()
                .orElse(null);

        if (plantilla != null) {
            if (plantilla.getCargoDirector() != null && !plantilla.getCargoDirector().isBlank()) {
                cargoDir = plantilla.getCargoDirector();
            }
            if (plantilla.getFirmaDirector() != null && !plantilla.getFirmaDirector().isBlank()) {
                firmaDirText = plantilla.getFirmaDirector();
            }
        }

        // Draw signature divider line
        Paragraph signLine = new Paragraph("_________________________", new Font(Font.HELVETICA, 10, Font.BOLD, primaryColor));
        signLine.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(signLine);

        Paragraph signText = new Paragraph(firmaDirText, new Font(Font.HELVETICA, 9, Font.BOLD, primaryColor));
        signText.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(signText);

        Paragraph cargoText = new Paragraph(cargoDir, new Font(Font.HELVETICA, 8, Font.NORMAL, grayColor));
        cargoText.setAlignment(Element.ALIGN_CENTER);
        rightCell.addElement(cargoText);

        footerTable.addCell(rightCell);
        document.add(footerTable);
        document.add(spacer);

        // Metadata footer at the very bottom
        Paragraph metaFooter = new Paragraph(
            "CÓDIGO DE VALIDACIÓN: " + cert.getCodigo() + "  |  NÚMERO DE REGISTRO: " + cert.getNumeroRegistro() + "  |  VALIDACIÓN EN LÍNEA: " + cert.getUrlValidacion(), 
            metaFont
        );
        metaFooter.setAlignment(Element.ALIGN_CENTER);
        document.add(metaFooter);

        document.close();
    }

    @Override
    public Page<CertificadoResponseDTO> listarCertificados(Pageable pageable, String search) {
        return certificadoRepository.searchCertificadosPaged(search, pageable).map(cert -> new CertificadoResponseDTO(
                cert.getId(),
                cert.getUsuario().getId(),
                cert.getCurso().getId(),
                cert.getUsuario().getNombres() + " " + cert.getUsuario().getApellidos(),
                cert.getUsuario().getCorreo(),
                cert.getCurso().getNombre(),
                cert.getCodigo(),
                cert.getArchivoPdf() == null || cert.getArchivoPdf().isBlank() ? resolvePdfUrl(cert) : cert.getArchivoPdf(),
                cert.getUrlValidacion() == null || cert.getUrlValidacion().isBlank()
                        ? frontendBaseUrl + "/certificados/validar/" + cert.getCodigo()
                        : cert.getUrlValidacion(),
                cert.getNumeroRegistro(),
                cert.getFechaEmision()
        ));
    }
}

class CertificatePageBorder extends com.lowagie.text.pdf.PdfPageEventHelper {
    private final com.lowagie.text.pdf.BaseFont watermarkFont;

    public CertificatePageBorder() {
        com.lowagie.text.pdf.BaseFont font = null;
        try {
            font = com.lowagie.text.pdf.BaseFont.createFont(
                    com.lowagie.text.pdf.BaseFont.HELVETICA_BOLD,
                    com.lowagie.text.pdf.BaseFont.WINANSI,
                    com.lowagie.text.pdf.BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            System.err.println("Could not load watermark font: " + e.getMessage());
        }
        this.watermarkFont = font;
    }

    @Override
    public void onStartPage(com.lowagie.text.pdf.PdfWriter writer, com.lowagie.text.Document document) {
        if (watermarkFont == null) {
            return;
        }

        com.lowagie.text.pdf.PdfContentByte canvas = writer.getDirectContentUnder();
        com.lowagie.text.pdf.PdfGState gState = new com.lowagie.text.pdf.PdfGState();
        gState.setFillOpacity(0.12f);
        gState.setStrokeOpacity(0.12f);
        canvas.saveState();
        canvas.setGState(gState);
        canvas.beginText();
        canvas.setFontAndSize(watermarkFont, 78);
        canvas.setColorFill(new java.awt.Color(214, 221, 231));
        float centerX = document.getPageSize().getWidth() / 2f;
        float centerY = document.getPageSize().getHeight() / 2f;
        canvas.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, "INSTEIP", centerX, centerY + 22, 45);
        canvas.setFontAndSize(watermarkFont, 18);
        canvas.showTextAligned(com.lowagie.text.Element.ALIGN_CENTER, "INSTITUTO DE TERAPIAS INTEGRALES PERÚ", centerX, centerY - 22, 45);
        canvas.endText();
        canvas.restoreState();
    }

    @Override
    public void onEndPage(com.lowagie.text.pdf.PdfWriter writer, com.lowagie.text.Document document) {
        com.lowagie.text.pdf.PdfContentByte cb = writer.getDirectContent();
        cb.saveState();
        
        // Outer border (Navy blue - #003466)
        cb.setColorStroke(new java.awt.Color(0, 52, 102));
        cb.setLineWidth(4f);
        cb.rectangle(20, 20, document.getPageSize().getWidth() - 40, document.getPageSize().getHeight() - 40);
        cb.stroke();
        
        // Inner border (Forest Green - #006e1c)
        cb.setColorStroke(new java.awt.Color(0, 110, 28));
        cb.setLineWidth(1.5f);
        cb.rectangle(26, 26, document.getPageSize().getWidth() - 52, document.getPageSize().getHeight() - 52);
        cb.stroke();
        
        cb.restoreState();
    }
}
