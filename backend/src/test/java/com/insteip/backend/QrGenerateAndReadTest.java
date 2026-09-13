package com.insteip.backend;

import com.google.zxing.*;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.common.HybridBinarizer;
import com.google.zxing.qrcode.QRCodeReader;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class QrGenerateAndReadTest {

    @Test
    @DisplayName("Generar código QR institucional, guardarlo en PNG, leerlo/decodificarlo y verificar coincidencia")
    void testGenerarYLeerCodigoQr() throws Exception {
        // 1. Datos del QR del estudiante
        String qrPayload = "QR_STU_74859612_LMSV2";
        int width = 350;
        int height = 350;

        System.out.println("==================================================");
        System.out.println(">> [PASO 1] Generando codigo QR con payload: " + qrPayload);

        // 2. Generar matriz QR con ZXing
        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
        hints.put(EncodeHintType.MARGIN, 2);

        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrPayload, BarcodeFormat.QR_CODE, width, height, hints);

        // 3. Guardar archivo en disco usando MatrixToImageWriter
        Path tempDir = Paths.get("target", "qr_tests");
        Files.createDirectories(tempDir);
        File qrFile = tempDir.resolve("qr_estudiante_74859612.png").toFile();
        MatrixToImageWriter.writeToPath(bitMatrix, "PNG", qrFile.toPath());

        assertTrue(qrFile.exists(), "El archivo QR PNG generado debe existir en disco");
        assertTrue(qrFile.length() > 0, "El archivo QR PNG debe contener bytes");
        System.out.println(">> [PASO 2] Archivo QR guardado exitosamente en: " + qrFile.getAbsolutePath() + " (" + qrFile.length() + " bytes)");

        // 4. Leer / Decodificar el código QR desde el archivo generado
        System.out.println(">> [PASO 3] Leyendo y decodificando el archivo QR...");
        BufferedImage readImage = ImageIO.read(qrFile);
        assertNotNull(readImage, "La imagen leida no debe ser nula");

        LuminanceSource source = new BufferedImageLuminanceSource(readImage);
        BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

        Map<DecodeHintType, Object> decodeHints = new HashMap<>();
        decodeHints.put(DecodeHintType.CHARACTER_SET, "UTF-8");

        QRCodeReader qrReader = new QRCodeReader();
        Result result = qrReader.decode(bitmap, decodeHints);

        // 5. Validar resultado de lectura
        assertNotNull(result, "El resultado de la decodificacion no debe ser nulo");
        String decodedText = result.getText();
        System.out.println(">> [PASO 4] Texto decodificado del QR: " + decodedText);
        System.out.println(">> [PASO 5] Formato detectado: " + result.getBarcodeFormat());
        System.out.println("==================================================");

        assertEquals(BarcodeFormat.QR_CODE, result.getBarcodeFormat());
        assertEquals(qrPayload, decodedText, "El texto leido del QR debe coincidir exactamente con el original generado");
    }
}
