'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Components } from 'react-markdown'
import { Copy, Check } from 'lucide-react'
import React, { useState } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
}

interface CodeBlockProps {
  language?: string
  children: string
}

function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  return (
    <div className="mb-3 rounded-lg border border-border overflow-hidden group relative">
      {language && (
        <div className="px-3 py-2 bg-elev border-b border-border text-xs text-muted font-medium flex justify-between items-center">
          <span>{language}</span>
          <button
            onClick={copyCode}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-background border border-transparent hover:border-border"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <div className="relative">
        <pre className="overflow-x-auto p-4 bg-background">
          <code className={`font-mono text-sm ${language ? `language-${language}` : ''}`}>
            {children}
          </code>
        </pre>
        {!language && (
          <button
            onClick={copyCode}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded text-xs bg-elev hover:bg-background border border-border"
          >
            {copied ? (
              <>
                <Check size={12} />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const components: Components = {
    // Headings
    h1: ({ children }) => <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 border-b border-border pb-1">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-3 first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h4>,
    h5: ({ children }) => <h5 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h5>,
    h6: ({ children }) => <h6 className="text-sm font-medium mb-1 mt-2 first:mt-0">{children}</h6>,
    
    // Paragraphs
    p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
    
    // Lists
    ul: ({ children }) => <ul className="mb-3 pl-6 space-y-1">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 pl-6 space-y-1 list-decimal">{children}</ol>,
    li: ({ children }) => <li className="list-disc leading-relaxed">{children}</li>,
    
    // Emphasis
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    
    // Code
    code: ({ inline, className, children, ...props }) => {
      if (inline) {
        return (
          <code 
            className="px-1.5 py-0.5 rounded bg-elev border border-border text-sm font-mono" 
            {...props}
          >
            {children}
          </code>
        )
      }
      
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      return (
        <CodeBlock language={language} children={String(children).replace(/\n$/, '')} />
      )
    },
    
    // Pre (for code blocks without highlighting)
    pre: ({ children }) => {
      // Extract the code content from the pre element
      const codeContent = typeof children === 'string' ? children : 
        React.isValidElement(children) && children.props.children ? 
        String(children.props.children) : String(children)
      
      return <CodeBlock children={codeContent} />
    },
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="mb-3 pl-4 border-l-4 border-primary/30 bg-elev/50 py-2 pr-4 rounded-r italic">
        {children}
      </blockquote>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline underline-offset-2"
      >
        {children}
      </a>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border border-border rounded-lg">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-elev">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="border-b border-border last:border-b-0">{children}</tr>,
    th: ({ children }) => <th className="px-3 py-2 text-left font-medium text-sm border-r border-border last:border-r-0">{children}</th>,
    td: ({ children }) => <td className="px-3 py-2 text-sm border-r border-border last:border-r-0">{children}</td>,
    
    // Horizontal rule
    hr: () => <hr className="my-4 border-t border-border" />,
    
    // Images (basic styling)
    img: ({ src, alt }) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg border border-border mb-3" 
      />
    ),
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}