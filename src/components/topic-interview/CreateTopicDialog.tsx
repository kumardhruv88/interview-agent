import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Link as LinkIcon, Loader2, X, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';

interface CreateTopicDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CreateTopicDialog = ({ open, onOpenChange }: CreateTopicDialogProps) => {
    const [topicName, setTopicName] = useState("");
    const [description, setDescription] = useState("");
    const [showDescription, setShowDescription] = useState(false);
    const [duration, setDuration] = useState(15);
    const [resourceLinks, setResourceLinks] = useState<string[]>([""]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleAddLink = () => {
        setResourceLinks([...resourceLinks, ""]);
    };

    const handleRemoveLink = (index: number) => {
        setResourceLinks(resourceLinks.filter((_, i) => i !== index));
    };

    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...resourceLinks];
        newLinks[index] = value;
        setResourceLinks(newLinks);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setUploadedFiles([...uploadedFiles, ...newFiles]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!topicName.trim()) {
            toast({
                variant: "destructive",
                title: "Topic name required",
                description: "Please enter a name for your custom topic.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            // Get current user (if authenticated)
            const { data: { user } } = await supabase.auth.getUser();

            // Dev mode or not authenticated - use localStorage
            if (!user) {
                const topicId = Date.now().toString();
                const topic = {
                    id: topicId,
                    name: topicName,
                    description: description,
                    is_predefined: false,
                    created_at: new Date().toISOString()
                };

                // Save to localStorage
                const savedTopics = localStorage.getItem('custom_topics');
                const topics = savedTopics ? JSON.parse(savedTopics) : [];
                topics.push(topic);
                localStorage.setItem('custom_topics', JSON.stringify(topics));

                const hasResources = uploadedFiles.length > 0 || resourceLinks.filter(l => l.trim()).length > 0;

                toast({
                    title: "Topic created successfully!",
                    description: hasResources
                        ? "Resources will be available locally. Sign in to sync across devices."
                        : "Topic created. AI will interview based on general knowledge.",
                });

                // Reset form
                setTopicName("");
                setDescription("");
                setShowDescription(false);
                setResourceLinks([""]);
                setUploadedFiles([]);
                setDuration(15);
                onOpenChange(false);

                // Navigate to voice interview
                setTimeout(() => {
                    navigate(`/topic-interview/${topicId}/voice`, {
                        state: {
                            topicMode: true,
                            topicName: topic.name,
                            topicId: topicId,
                            duration: duration,
                            description: description
                        }
                    });
                }, 500);
                return;
            }

            // Authenticated user - use Supabase
            const { data: topic, error: topicError } = await supabase
                .from('topics')
                .insert({
                    name: topicName,
                    description: description,
                    user_id: user.id,
                    is_predefined: false
                })
                .select()
                .single();

            if (topicError) throw topicError;

            // Process and upload files
            for (const file of uploadedFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${topic.id}/${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('topic-resources')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('topic-resources')
                    .getPublicUrl(uploadData.path);

                let extractedText = '';
                if (file.type === 'application/pdf') {
                    try {
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                            const page = await pdf.getPage(pageNum);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items
                                .map((item: any) => item.str)
                                .join(' ');
                            extractedText += pageText + '\n\n';
                        }
                    } catch (pdfError) {
                        console.error('PDF extraction error:', pdfError);
                    }
                }

                await supabase
                    .from('topic_resources')
                    .insert({
                        topic_id: topic.id,
                        resource_type: 'pdf',
                        resource_url: publicUrl,
                        file_name: file.name,
                        file_size: file.size,
                        extracted_content: extractedText.trim(),
                        metadata: { original_name: file.name }
                    });
            }

            // Process resource links
            const validLinks = resourceLinks.filter(link => link.trim().length > 0);
            for (const link of validLinks) {
                await supabase
                    .from('topic_resources')
                    .insert({
                        topic_id: topic.id,
                        resource_type: 'link',
                        resource_url: link,
                        metadata: { url: link }
                    });
            }

            const hasResources = uploadedFiles.length > 0 || validLinks.length > 0;

            toast({
                title: "Topic created successfully!",
                description: hasResources
                    ? "Resources uploaded. AI will use them for contextual questions."
                    : "Topic created. AI will interview based on general knowledge of this topic.",
            });

            // Reset form
            setTopicName("");
            setDescription("");
            setShowDescription(false);
            setResourceLinks([""]);
            setUploadedFiles([]);
            setDuration(15);
            onOpenChange(false);

            // Navigate to voice interview
            setTimeout(() => {
                navigate(`/topic-interview/${topic.id}/voice`, {
                    state: {
                        topicMode: true,
                        topicName: topic.name,
                        topicId: topic.id,
                        duration: duration,
                        description: description
                    }
                });
            }, 500);
        } catch (error: any) {
            console.error('Submission error:', error);
            toast({
                variant: "destructive",
                title: "Failed to create topic",
                description: error.message || "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Custom Topic</DialogTitle>
                    <DialogDescription>
                        Resources are optional - AI interviews on general knowledge too.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Topic Name */}
                    <div className="space-y-2">
                        <Label htmlFor="topic-name">Topic Name *</Label>
                        <Input
                            id="topic-name"
                            placeholder="e.g., Advanced TypeScript Patterns"
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                        />
                    </div>

                    {/* Description - Expandable */}
                    {!showDescription ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDescription(true)}
                            className="w-full justify-start text-muted-foreground"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add description (optional)
                        </Button>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="description">Description</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setShowDescription(false);
                                        setDescription("");
                                    }}
                                    className="h-6 px-2"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                            <Textarea
                                id="description"
                                placeholder="Focus areas, specific concepts, etc..."
                                className="min-h-[60px] resize-none text-sm"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Duration Selection */}
                    <div className="space-y-2">
                        <Label>Interview Duration</Label>
                        <Select value={duration.toString()} onValueChange={(val) => setDuration(parseInt(val))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="20">20 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <Label>Upload Resources (Optional)</Label>
                        <div className="border-2 border-dashed border-white/10 rounded-lg p-4 hover:border-primary/50 transition-colors">
                            <input
                                type="file"
                                id="file-upload"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                multiple
                                onChange={handleFileUpload}
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center gap-1 cursor-pointer"
                            >
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-muted-foreground opacity-60">
                                    PDF, DOC, DOCX, TXT (Max 10MB)
                                </span>
                            </label>
                        </div>

                        {/* Uploaded Files List */}
                        {uploadedFiles.length > 0 && (
                            <div className="space-y-2 mt-3">
                                {uploadedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10"
                                    >
                                        <span className="text-sm truncate">{file.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Resource Links */}
                    <div className="space-y-2">
                        <Label>Resource Links (Optional)</Label>
                        {resourceLinks.map((link, index) => (
                            <div key={index} className="flex gap-2">
                                <div className="flex-1 relative">
                                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="https://..."
                                        value={link}
                                        onChange={(e) => handleLinkChange(index, e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                {resourceLinks.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveLink(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddLink}
                            className="w-full"
                        >
                            + Add Another Link
                        </Button>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Starting Interview...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Create & Start Interview
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
