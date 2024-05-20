import { useState, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import Header from "./Components/Header";
import Markdown from "react-markdown";

function App() {
  const monaco = useMonaco();
  const [editorValue, setEditorValue] = useState(
    `{\n\t"message": "Hello world"\n}`
  );
  const [parsedValue, setParsedValue] = useState(`
    class Message:
      def __init__(self, welcome):
          self.welcome = welcome

      def greet(self):
          return self.welcome

    msg = Message("Hello world")
    print(msg.greet())
    
  `);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar la carga

  useEffect(() => {
    if (monaco) {
      monaco.editor.setTheme("vs-dark");
    }
  }, [monaco]);

  const handleEditorChange = (value: string) => {
    setEditorValue(value);
  };

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedLanguage(event.target.value); // Actualizar estado al cambiar la selección
  };

  const parseData = () => {
    setIsLoading(true); // Activar el estado de carga

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
      })
      .finally(() => {
        setIsLoading(false); // Desactivar el estado de carga
      });
  };

  return (
    <div className="box-border overflow-hidden">
      <div className="flex items-center justify-center w-full mx-auto space-x-6">
        <Header />
        <select
          name="lang"
          id="lang"
          className="my-4 rounded"
          value={selectedLanguage}
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
          className="bg-gray-600 px-2 py-1 rounded-lg my-4 text-white hover:bg-gray-800 transition duration-300 ease-in-out"
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
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <h1 className="text-4xl">Loading...</h1>
            </div>
          ) : (
            <Markdown>{parsedValue}</Markdown>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
