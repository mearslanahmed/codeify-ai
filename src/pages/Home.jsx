import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Editor from "@monaco-editor/react";
import Select from "react-select";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { RingLoader } from "react-spinners";

const Home = () => {
  const options = [
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "typescript", label: "TypeScript" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "rust", label: "Rust" },
    { value: "dart", label: "Dart" },
    { value: "sql", label: "SQL" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "r", label: "R" },
    { value: "perl", label: "Perl" },
    { value: "shell", label: "Shell Script" },
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);

  // Custom Select styles (consistent with palette)
  const customSelectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#290025",
      borderColor: "#4F0147",
      color: "#F3E8FF",
      boxShadow: "none",
      "&:hover": { borderColor: "#E2B0FF" },
      width: "100%",
      borderRadius: "10px",
      minHeight: "48px",
      paddingLeft: "10px",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#35012C",
      border: "1px solid #4F0147",
      width: "100%",
      borderRadius: "10px",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#4F0147"
        : state.isFocused
        ? "#3A015C"
        : "transparent",
      color: "#F3E8FF",
      cursor: "pointer",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#F3E8FF",
      width: "100%",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#B784E3",
      width: "100%",
    }),
  };
  const [code, setCode] = useState("");

  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  async function reviewCode() {
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert-level software developer, skilled in writing efficient, clean, and advanced code.
I’m sharing a piece of code written in ${selectedOption.value}.
Your job is to deeply review this code and provide the following:

1️⃣ A quality rating: Better, Good, Normal, or Bad.
2️⃣ Detailed suggestions for improvement, including best practices and advanced alternatives.
3️⃣ A clear explanation of what the code does, step by step.
4️⃣ A list of any potential bugs or logical errors, if found.
5️⃣ Identification of syntax errors or runtime errors, if present.
6️⃣ Solutions and recommendations on how to fix each identified issue.

Analyze it like a senior developer reviewing a pull request.

Code: ${code}`,
    });
    console.log(response.text);
    setResponse(response.text);
    setLoading(false);
  }

  function extractJson(text) {
    // try naive JSON first
    try {
      return JSON.parse(text);
    } catch (e) {}
    // find first { ... } block
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      const chunk = text.slice(start, end + 1);
      try {
        return JSON.parse(chunk);
      } catch (e) {}
    }
    return null;
  }

  async function fixCode({ applyAutomatically = true } = {}) {
    setLoading(true);
    setResponse("");

    const prompt = `
You are an expert developer. Fix the given code so it runs and follows best practices.
Return a single JSON object ONLY with these fields:
{
  "correctedCode": "<the complete corrected source code string>",
  "explanation": "<concise explanation of fixes and why they are needed>"
}
Wrap the JSON in a single code block if possible. Do not return extra commentary outside the JSON block.

Language: ${selectedOption.label}
Code:
\`\`\`
${code}
\`\`\`
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response?.text ?? "";
      // try to parse JSON safely
      const parsed = extractJson(text);

      if (parsed && parsed.correctedCode) {
        setResponse(parsed.explanation || "No explanation provided.");
        if (applyAutomatically) {
          setCode(parsed.correctedCode);
        } else {
          // you could present a preview modal with parsed.correctedCode
          setResponse(
            (prev) =>
              (parsed.explanation || "") + "\n\nCorrected code available."
          );
        }
      } else {
        // fallback: show the raw model text so user can read it
        setResponse(
          "Could not parse JSON from model. Raw reply below:\n\n" + text
        );
      }
    } catch (err) {
      console.error("fixCode error", err);
      setResponse("Error calling the review API: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  // Monaco Editor custom theme
  const handleBeforeMount = (monaco) => {
    monaco.editor.defineTheme("codeify-purple", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#11001C",
        "editor.foreground": "#F3E8FF",
        "editor.lineHighlightBackground": "#290025",
        "editorCursor.foreground": "#E2B0FF",
        "editor.selectionBackground": "#4F0147",
        "editorLineNumber.foreground": "#B784E3",
      },
    });
  };

  return (
    <>
      <Navbar />
      <div className="main flex items-start h-[calc(100vh-90px)] bg-[#11001C] text-[#F3E8FF] overflow-hidden">
        {/* Left Section (Editor) */}
        <div className="left flex flex-col h-full w-1/2 border-r border-[#4F0147] px-6 py-6">
          {/* Controls row: outside editor border, with vertical padding */}
          <div className="controls-row flex items-center gap-5 mb-6 h-[60px]">
            <Select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e)}
              options={options}
              styles={customSelectStyles}
            />

            <button
              onClick={() => {
                if (!code) return alert("Please enter some code to fix.");
                fixCode({ applyAutomatically: true });
              }}
              disabled={loading}
              className="min-w-[140px] h-[48px] px-5 rounded-lg bg-[#4F0147] text-[#F3E8FF] text-[16px] font-medium hover:bg-[#3A015C] transition-all flex items-center justify-center"
              type="button"
            >
                
              Fix Code
            </button>

            <button
              onClick={() => {
                if (code === "") {
                  alert("Please enter some code to review.");
                } else {
                  reviewCode();
                }
              }}
              className="min-w-[140px] h-[48px] px-5 rounded-lg bg-[#4F0147] text-[#F3E8FF] text-[16px] font-medium hover:bg-[#3A015C] transition-all flex items-center justify-center"
              type="button"
            >
              Review
            </button>
          </div>

          {/* Editor container: starts below controls, has its own padding so buttons never touch it */}
          <div className="editor-wrap flex-1 overflow-hidden rounded-xl border border-[#4F0147] shadow-inner p-3">
            <Editor
              height="100%"
              defaultLanguage={selectedOption.value}
              value={code}
              onChange={(value) => setCode(value)}
              beforeMount={handleBeforeMount}
              theme="codeify-purple"
            />
          </div>
        </div>

        {/* Right Section (Response) */}
        <div
          className="right h-full w-1/2 p-6 text-[#E2B0FF] flex flex-col"
          style={{
            background: "linear-gradient(180deg, #290025 0%, #11001C 100%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-[#4F0147] h-[62px] mb-3">
            <p className="font-bold text-[26px]">Response</p>
          </div>

          <div className="response-area flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RingLoader color="#E2B0FF" />
              </div>
            ) : response ? (
              <div className="prose max-w-none text-[#EDEDED]">
                <Markdown>{response}</Markdown>
              </div>
            ) : (
              <p className="text-[#CBA1E3] opacity-70 italic">
                Your reviewed or fixed code will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
