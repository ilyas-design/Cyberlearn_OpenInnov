"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

const HTML_TAG_PATTERN =
    /<\s*\/?\s*(p|h[1-6]|ul|ol|li|div|span|pre|code|strong|em|br|table|blockquote|a)\b/i;

function isHtmlContent(content: string): boolean {
    return HTML_TAG_PATTERN.test(content.trim());
}

interface LessonContentProps {
    content: string;
    className?: string;
    codeBlockClassName?: string;
}

export default function LessonContent({
    content,
    className,
    codeBlockClassName,
}: LessonContentProps) {
    if (isHtmlContent(content)) {
        return (
            <div
                className={className}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        );
    }

    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    code: ({ className: codeClassName, children }) => {
                        const match = /language-(\w+)/.exec(codeClassName || "");
                        return match ? (
                            <pre className={codeBlockClassName}>
                                <code className={codeClassName}>
                                    {String(children).replace(/\n$/, "")}
                                </code>
                            </pre>
                        ) : (
                            <code className={codeClassName}>
                                {String(children)}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
