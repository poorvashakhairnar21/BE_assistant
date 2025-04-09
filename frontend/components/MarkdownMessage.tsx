"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css" // Using a dark theme that works well in both light/dark modes

interface MarkdownMessageProps {
  content: string
  isDarkMode?: boolean
}

const MarkdownMessage = ({ content, isDarkMode }: MarkdownMessageProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      className="markdown-content"
      components={{
        // Headings
        h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-4" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-3" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,

        // Lists
        ul: ({ node, ...props }) => <ul className="list-disc pl-6 my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-decimal pl-6 my-2" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,

        // Links
        a: ({ node, ...props }) => (
          <a
            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // Paragraphs
        p: ({ node, ...props }) => <p className="my-2" {...props} />,

        // Blockquotes
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3" {...props} />
        ),

        // Tables
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
        tbody: ({ node, ...props }) => <tbody {...props} />,
        tr: ({ node, ...props }) => <tr className="border-b border-gray-300 dark:border-gray-700" {...props} />,
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-2 text-left border-r border-gray-300 dark:border-gray-700 last:border-r-0"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td className="px-4 py-2 border-r border-gray-300 dark:border-gray-700 last:border-r-0" {...props} />
        ),

        // Code blocks
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
        
          if (inline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded font-mono text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                {...props}
              >
                {children}
              </code>
            );
          }
        
          return (
            <div className="my-4 rounded-lg overflow-hidden">
              {/* Language label with grey background */}
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-4 py-1.5 font-mono uppercase tracking-wide">
                {match ? match[1] : "code"}
              </div>
              {/* Code block */}
              <pre className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm overflow-x-auto m-0 p-4 rounded-b-lg">
                <code className="font-mono whitespace-pre" {...props}>
                  {children}
                </code>
              </pre>
            </div>
          );
        },

        // Images
        img: ({ node, ...props }) => (
          <img className="max-w-full h-auto rounded my-4" {...props} alt={props.alt || "Image"} />
        ),

        // Horizontal rule
        hr: ({ node, ...props }) => <hr className="my-6 border-t border-gray-300 dark:border-gray-700" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownMessage
