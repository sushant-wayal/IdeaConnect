import { useEffect, useState } from "react";
import FileSystem from "./fileSystem";
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css';

const updateFileSystem = (fileSystem, pathArray, name, content, start) => {
  const newFileSystem = [...fileSystem];
  if (start === pathArray.length - 1) {
    newFileSystem.push({
      name,
      content,
    });
    return newFileSystem
  }
  let folderIndex = newFileSystem.findIndex(({ name }) => name === pathArray[start]);
  if (folderIndex === -1) {
    newFileSystem.push({
      name: pathArray[start],
      files: [],
    });
    folderIndex = newFileSystem.length - 1;
  }
  newFileSystem[folderIndex] = {
    ...newFileSystem[folderIndex],
    files: updateFileSystem(newFileSystem[folderIndex].files, pathArray, name, content, start + 1),
  };
  return newFileSystem;
};


const CodeFiles = ({ codeFiles, codeTitle }) => {
  const [fileSystem, setFileSystem] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);
  const demoCodeFiles = [
    {
      name: "main.py",
      content: "print('Hello World')",
      path: "main.py",
    },
    {
      name: "index.js",
      content: "console.log('Hello World')",
      path: "src/index.js",
    },
    {
      name: "index.html",
      content: `
        import Head from 'next/head';
    import { useState } from 'react';
    import styles from '../styles/Home.module.css';

    export default function Home() {
      const [todos, setTodos] = useState([]);
      const [newTodo, setNewTodo] = useState('');

      const addTodo = () => {
        if (newTodo.trim() !== '') {
          setTodos([...todos, { text: newTodo, completed: false }]);
          setNewTodo('');
        }
      };

      const toggleComplete = (index) => {
        const updatedTodos = [...todos];
        updatedTodos[index].completed = !updatedTodos[index].completed;
        setTodos(updatedTodos);
      };

      const deleteTodo = (index) => {
        const updatedTodos = todos.filter((_, i) => i !== index);
        setTodos(updatedTodos);
      };

      return (
        &lt;div className={styles.container}&gt;
          &lt;Head&gt;
            &lt;title&gt;Simple Todo App&lt;/title&gt;
          &lt;/Head&gt;

          &lt;h1 className={styles.title}&gt;Simple Todo App&lt;/h1&gt;

          &lt;div className={styles.inputContainer}&gt;
            &lt;input
              type="text"
              value={newTodo}
              onChange={(e) =&gt; setNewTodo(e.target.value)}
              placeholder="Add a new todo"
            /&gt;
            &lt;button onClick={addTodo}&gt;Add&lt;/button&gt;
          &lt;/div&gt;

          &lt;ul className={styles.todoList}&gt;
            {todos.map((todo, index) =&gt; (
              &lt;li key={index} className={styles.todoItem}&gt;
                &lt;input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =&gt; toggleComplete(index)}
                /&gt;
                &lt;span
                  className={todo.completed ? styles.completed : ''}
                &gt;
                  {todo.text}
                &lt;/span&gt;
                &lt;button onClick={() =&gt; deleteTodo(index)}&gt;
                  Delete
                &lt;/button&gt;
              &lt;/li&gt;
            ))}
          &lt;/ul&gt;
        &lt;/div&gt;
      );
    }
      `,
      path: "public/index.html",
    },
  ];
  // codeFiles = demoCodeFiles;
  useEffect(() => {
    let updatedFileSystem = [];
    codeFiles.forEach(({ path, name, content }) => {
      const pathArray = path.split("/");
      updatedFileSystem = updateFileSystem(updatedFileSystem, pathArray, name, content, 0);
    });
    setFileSystem((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(updatedFileSystem)) {
        return updatedFileSystem;
      }
      return prev;
    });
  }, [codeFiles]);
  
  
  if (codeFiles.length === 0) {
    return (
      <div className="bg-[#797270] rounded-2xl flex-grow h-full flex justify-center items-center flex-col text-3xl">
        <p>No code files to display</p>
      </div>
    );
  }
  return (
    <div className="bg-[#797270] rounded-2xl flex-grow h-full p-2 flex flex-col justify-between items-center">
      <div className="w-full h-10 bg-[#C1EDCC] rounded-2xl flex justify-center items-center">
        <p className="text-2xl font-semibold text-center">
          {codeTitle}
        </p>
      </div>
      <div className="w-full flex-grow flex p-2 justify-between gap-2 overflow-y-scroll">
        <div className="bg-[#908D8D] h-full w-64 overflow-scroll rounded-2xl">
          <FileSystem system={fileSystem} setCurrentFile={setCurrentFile}/>
        </div>
        <div className="h-full flex-grow flex flex-col items-center justify-start gap-2">
          <h3 className="text-xl w-full h-10 rounded-2xl text-center items-center bg-[#C1EDCC]">{currentFile?.name}</h3>
          <div className="bg-[#333333] w-full rounded-2xl flex-grow overflow-y-scroll">
            {/* <textarea className="w-full h-full resize-none bg-transparent focus:outline-none"
              value={currentFile?.content}
              rows={currentFile?.content.split("\n").length + 1}
            ></textarea> */}
            {currentFile && (
              <Editor
                value={currentFile.content}
                highlight={code => highlight(code, languages.js)}
                padding={10}
                className="text-white w-[650px] whitespace-pre-wrap"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeFiles;