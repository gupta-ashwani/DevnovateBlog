import React, { useState, useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import {
  Eye,
  Edit3,
  Split,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Code,
  Image,
  Heading1,
  Heading2,
  Heading3,
  HelpCircle,
} from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

type ViewMode = "edit" | "preview" | "split";

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = "Write your blog content in Markdown...",
  height = 400,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [showHelp, setShowHelp] = useState(false);

  // Toolbar button for quick insertions
  const insertMarkdown = (
    before: string,
    after: string = "",
    placeholder: string = ""
  ) => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = before + (selectedText || placeholder) + after;

    const newValue =
      value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos =
        start + before.length + (selectedText || placeholder).length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => insertMarkdown("**", "**", "bold text"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => insertMarkdown("*", "*", "italic text"),
    },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => insertMarkdown("# ", "", "Heading 1"),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => insertMarkdown("## ", "", "Heading 2"),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => insertMarkdown("### ", "", "Heading 3"),
    },
    {
      icon: Link,
      title: "Link",
      action: () => insertMarkdown("[", "](https://example.com)", "link text"),
    },
    {
      icon: Image,
      title: "Image",
      action: () =>
        insertMarkdown("![", "](https://example.com/image.jpg)", "alt text"),
    },
    {
      icon: List,
      title: "Unordered List",
      action: () => insertMarkdown("- ", "", "list item"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => insertMarkdown("1. ", "", "list item"),
    },
    {
      icon: Quote,
      title: "Quote",
      action: () => insertMarkdown("> ", "", "quote text"),
    },
    {
      icon: Code,
      title: "Code Block",
      action: () => insertMarkdown("```\n", "\n```", "code here"),
    },
  ];

  const markdownComponents = useMemo(
    () => ({
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || "");
        return !inline && match ? (
          <SyntaxHighlighter
            style={tomorrow}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }),
    []
  );

  const helpContent = (
    <div className="space-y-4 text-sm">
      <div>
        <h4 className="font-semibold mb-2">Basic Formatting</h4>
        <div className="space-y-1 text-gray-600">
          <div>
            <code>**bold**</code> → <strong>bold</strong>
          </div>
          <div>
            <code>*italic*</code> → <em>italic</em>
          </div>
          <div>
            <code>`code`</code> →{" "}
            <code className="bg-gray-100 px-1 rounded">code</code>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Headers</h4>
        <div className="space-y-1 text-gray-600">
          <div>
            <code># Heading 1</code>
          </div>
          <div>
            <code>## Heading 2</code>
          </div>
          <div>
            <code>### Heading 3</code>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Lists</h4>
        <div className="space-y-1 text-gray-600">
          <div>
            <code>- Unordered item</code>
          </div>
          <div>
            <code>1. Ordered item</code>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Links & Images</h4>
        <div className="space-y-1 text-gray-600">
          <div>
            <code>[Link text](URL)</code>
          </div>
          <div>
            <code>![Alt text](Image URL)</code>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Code Blocks</h4>
        <div className="space-y-1 text-gray-600">
          <div>
            <code>```javascript</code>
          </div>
          <div>
            <code>console.log('Hello');</code>
          </div>
          <div>
            <code>```</code>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={button.action}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title={button.title}
            >
              <button.icon className="h-4 w-4" />
            </motion.button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="Markdown Help"
          >
            <HelpCircle className="h-4 w-4" />
          </motion.button>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1 text-sm flex items-center space-x-1 transition-colors ${
                viewMode === "edit"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 text-sm flex items-center space-x-1 transition-colors border-x border-gray-300 ${
                viewMode === "split"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Split className="h-3 w-3" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 text-sm flex items-center space-x-1 transition-colors ${
                viewMode === "preview"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Help Panel */}
      {showHelp && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 bg-blue-50 border-b border-gray-200"
        >
          {helpContent}
        </motion.div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {viewMode === "edit" && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed"
            style={{ height: `${height}px` }}
          />
        )}

        {viewMode === "preview" && (
          <div
            className="prose prose-sm max-w-none p-4 overflow-y-auto"
            style={{ height: `${height}px` }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {value || "*Nothing to preview*"}
            </ReactMarkdown>
          </div>
        )}

        {viewMode === "split" && (
          <div className="flex">
            <div className="w-1/2 border-r border-gray-200">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed"
                style={{ height: `${height}px` }}
              />
            </div>
            <div className="w-1/2">
              <div
                className="prose prose-sm max-w-none p-4 overflow-y-auto"
                style={{ height: `${height}px` }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {value || "*Nothing to preview*"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;
