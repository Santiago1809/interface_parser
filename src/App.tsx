import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import Header from "./Components/Header";
import Markdown from "react-markdown";

function App() {
  const monaco = useMonaco();
  const [editorValue, setEditorValue] = useState("{\n\n}");
  const [parsedValue, setParsedValue] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Python");

  useEffect(() => {
    if (monaco) {
      monaco.editor.setTheme("vs-dark");
    }
  }, [monaco]);

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value); // Update state on selection change
  };

  const parseData = () => {
    fetch("http://localhost:8080", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msg: editorValue,
        lang: selectedLanguage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setParsedValue(data[0]?.Content?.Parts[0]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        // Si hay algún error, puedes manejarlo aquí
      });
  };

  return (
    <div className="box-border overflow-hidden">
      <div className="flex items-center justify-center space-x-6">
        <Header />
        <select
          name="lang"
          id="lang"
          className="my-4 rounded"
          value={selectedLanguage} // Set initial value from state
          onChange={handleLanguageChange}
        >
          <option value="py">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="cs">C#</option>
          <option value="C">C</option>
          <option value="js">JavaScript</option>
          <option value="ts">TypeScript</option>
          <option value="go">Go</option>
          <option value="php">PHP</option>
          <option value="ruby">Ruby</option>
          <option value="rust">Rust</option>
          <option value="perl">Perl</option>
        </select>
        <button
          className="bg-gray-600 px-2 py-1 rounded-lg my-4"
          onClick={parseData}
        >
          Parse
        </button>
      </div>

      <main className="grid grid-cols-2">
        <Editor
          height="100vh"
          width="50vw"
          defaultValue={editorValue}
          defaultLanguage="json"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            autoDetectHighContrast: false,
          }}
        />
        <div className="ml-5">
          <Markdown>{parsedValue}</Markdown>
        </div>
      </main>
    </div>
  );
}

export default App;
