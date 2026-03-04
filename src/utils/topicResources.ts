import { supabase } from "@/integrations/supabase/client";
import * as pdfjsLib from 'pdfjs-dist';

export interface TopicResource {
    id?: string;
    topic_id: string;
    resource_type: 'pdf' | 'link' | 'text' | 'document';
    resource_url: string;
    file_name?: string;
    file_size?: number;
    extracted_content?: string;
    metadata?: Record<string, any>;
}

/**
 * Extract text content from a PDF file
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        // Extract text from each page
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n\n';
        }

        return fullText.trim();
    } catch (error) {
        console.error('PDF extraction error:', error);
        throw new Error('Failed to extract text from PDF');
    }
};

/**
 * Upload a file to Supabase Storage
 */
export const uploadFileToStorage = async (
    file: File,
    topicId: string,
    userId: string
): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${topicId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('topic-resources')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error('Upload error:', error);
        throw new Error('Failed to upload file');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('topic-resources')
        .getPublicUrl(data.path);

    return publicUrl;
};

/**
 * Create a new custom topic
 */
export const createCustomTopic = async (
    name: string,
    description: string,
    userId: string
) => {
    const { data, error } = await supabase
        .from('topics')
        .insert({
            name,
            description,
            user_id: userId,
            is_predefined: false
        })
        .select()
        .single();

    if (error) {
        console.error('Topic creation error:', error);
        throw new Error('Failed to create topic');
    }

    return data;
};

/**
 * Save a resource to the database
 */
export const saveTopicResource = async (resource: TopicResource) => {
    const { data, error } = await supabase
        .from('topic_resources')
        .insert(resource)
        .select()
        .single();

    if (error) {
        console.error('Resource save error:', error);
        throw new Error('Failed to save resource');
    }

    return data;
};

/**
 * Get all resources for a topic
 */
export const getTopicResources = async (topicId: string) => {
    const { data, error } = await supabase
        .from('topic_resources')
        .select('*')
        .eq('topic_id', topicId);

    if (error) {
        console.error('Fetch resources error:', error);
        throw new Error('Failed to fetch resources');
    }

    return data;
};

/**
 * Build context string from topic resources
 */
export const buildTopicContext = async (topicId: string): Promise<string> => {
    const resources = await getTopicResources(topicId);

    if (!resources || resources.length === 0) {
        return '';
    }

    let context = '';

    for (const resource of resources) {
        if (resource.extracted_content) {
            context += `\n--- Resource: ${resource.file_name || resource.resource_type} ---\n`;
            context += resource.extracted_content;
            context += '\n\n';
        }
    }

    return context.trim();
};

/**
 * Fetch content from a URL (for link resources)
 */
export const fetchLinkContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Simple HTML to text extraction (you might want to use a library like 'html-to-text')
        const text = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/\s+/g, ' ')
            .trim();

        return text.substring(0, 10000); // Limit to 10k chars
    } catch (error) {
        console.error('Link fetch error:', error);
        return '';
    }
};
