import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { extractTextFromPDF } from '@/utils/pdf';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

interface ResumeUploaderProps {
    onResumeConverted: (text: string) => void;
}

export const ResumeUploader = ({ onResumeConverted }: ResumeUploaderProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const { toast } = useToast();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please upload a PDF file.',
            });
            return;
        }

        setFileName(file.name);
        setIsProcessing(true);

        try {
            const text = await extractTextFromPDF(file);
            onResumeConverted(text);
            toast({
                title: 'Resume uploaded',
                description: 'Successfully extracted text from your resume.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Upload failed',
                description: 'Could not read the PDF file.',
            });
            setFileName(null);
        } finally {
            setIsProcessing(false);
        }
    }, [onResumeConverted, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer text-center",
                isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50",
                fileName ? "bg-primary/5 border-primary" : ""
            )}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
                {isProcessing ? (
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                ) : fileName ? (
                    <CheckCircle className="w-10 h-10 text-green-500" />
                ) : (
                    <Upload className="w-10 h-10 text-muted-foreground" />
                )}

                <div className="space-y-1">
                    <p className="font-medium text-foreground">
                        {isProcessing ? 'Processing PDF...' : fileName || 'Upload your Resume (PDF)'}
                    </p>
                    {!fileName && !isProcessing && (
                        <p className="text-sm text-muted-foreground">
                            Drag & drop or click to browse
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};
