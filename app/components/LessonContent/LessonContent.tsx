"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import DOMPurify from "isomorphic-dompurify";
import "katex/dist/katex.min.css";

const HTML_TAG_PATTERN =
    /<\s*\/?\s*(p|h[1-6]|ul|ol|li|div|span|pre|code|strong|em|br|table|blockquote|a)\b/i;

const SANITIZE_OPTIONS = {
    ALLOWED_TAGS: [
        "p", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "div", "span", "pre", "code",
        "strong", "em", "br", "table", "thead", "tbody", "tr", "th", "td",
        "blockquote", "a",
    ],
    ALLOWED_ATTR: ["href", "title", "class", "target", "rel"],
    ALLOW_DATA_ATTR: false,
};

function isHtmlContent(content: string): boolean {
    return HTML_TAG_PATTERN.test(content.trim());
}

function sanitizeHtml(content: string): string {
    return DOMPurify.sanitize(content, SANITIZE_OPTIONS);
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
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
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
