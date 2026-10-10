import mammoth from "mammoth";

export interface DocumentExtractionResult {
  text: string;
  wordCount: number;
  mimeType: string;
  fileName: string;
  fileSizeBytes: number;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export class DocumentExtractor {
  /**
   * Validate file size and mime types
   */
  public static validateFile(file: { size: number; name: string; type?: string }) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size (${Math.round(file.size / (1024 * 1024))}MB) exceeds maximum allowed limit of 10MB.`);
    }

    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith(".pdf");
    const isDocx = lowerName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      throw new Error(`Unsupported document format. DevLens AI supports .pdf and .docx files only.`);
    }

    return { isPdf, isDocx };
  }

  /**
   * Extract plain text from PDF Buffer
   */
  public static async extractFromPdf(buffer: Buffer): Promise<string> {
    try {
      // Dynamic import to avoid build-time issues with pdf-parse native canvas/test bindings
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (err: any) {
      throw new Error(`Failed to extract text from PDF document: ${err?.message || "Malformed PDF"}`);
    }
  }

  /**
   * Extract plain text from DOCX Buffer using mammoth
   */
  public static async extractFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err: any) {
      throw new Error(`Failed to extract text from DOCX document: ${err?.message || "Malformed DOCX"}`);
    }
  }

  /**
   * Universal extraction runner
   */
  public static async extractDocument(
    buffer: Buffer,
    fileName: string,
    mimeType?: string
  ): Promise<DocumentExtractionResult> {
    const { isPdf } = DocumentExtractor.validateFile({
      size: buffer.length,
      name: fileName,
      type: mimeType,
    });

    let rawText = "";
    if (isPdf) {
      rawText = await DocumentExtractor.extractFromPdf(buffer);
    } else {
      rawText = await DocumentExtractor.extractFromDocx(buffer);
    }

    // Sanitize extracted text: normalize carriage returns, strip non-printable null bytes
    const sanitized = rawText
      .replace(/\0/g, "")
      .replace(/\r\n/g, "\n")
      .trim();

    const words = sanitized.split(/\s+/).filter(Boolean);

    return {
      text: sanitized,
      wordCount: words.length,
      mimeType: isPdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileName,
      fileSizeBytes: buffer.length,
    };
  }
}
