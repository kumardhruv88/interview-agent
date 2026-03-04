import * as pdfjsLib from 'pdfjs-dist';

// Use Vite's URL import to get the worker URL from the installed package
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

export const extractCandidateName = (text: string): string => {
    // Heuristic: Name is often on the first line or within the first few lines.
    // We'll look for the first non-empty line that isn't a common header.
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    if (lines.length === 0) return "Candidate";

    // Check first 5 lines for a likely name (2-3 words, no numbers, common header keywords)
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
        const line = lines[i];
        // Simple filter: 2-4 words, no digits, distinct from "Resume", "CV", "curriculum vitae"
        if (
            line.split(' ').length >= 2 &&
            line.split(' ').length <= 4 &&
            !/\d/.test(line) &&
            !/resume|cv|curriculum|vitae|email|phone|address|summary|objective/i.test(line)
        ) {
            return line;
        }
    }

    return "Candidate";
};
