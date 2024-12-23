"use client";

import { useState, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import "./TodoList.styles.css";

type TodoItem = {
  id: string;
  text: string;
  status: "todo" | "done";
};

const generateUuid = () => {
  if (typeof window !== "undefined") {
    const { v4: uuidv4 } = require("uuid");
    return uuidv4();
  }
  return ""; // SSR 환경에서는 빈 문자열 반환
};

export default function TodoList() {
  const [task, setTask] = useState(""); // 입력된 할 일을 관리
  const [todos, setTodos] = useState<TodoItem[]>([]); // todo와 done 목록 관리

  // 할 일 추가 핸들러
  const addTask = () => {
    if (task.trim()) {
      setTodos((prev) => [
        ...prev,
        { id: generateUuid(), text: task.trim(), status: "todo" },
      ]);
      setTask(""); // 입력 필드 초기화
    }
  };

  // 상태 변경 핸들러 (todo ↔ done)
  const toggleTaskStatus = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, status: todo.status === "todo" ? "done" : "todo" }
          : todo
      )
    );
  };

  // 입력 필드 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
  };

  return (
    <div className="todo-list-container">
      <div className="input-container">
        <textarea
          className="task-input"
          value={task}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // 기본 Enter 동작 방지
              addTask(); // todo 추가 이벤트
            }
          }}
          placeholder="할 일을 입력해주세요"
        />
        <button className="add-task-button" onClick={addTask}>
          + 추가하기
        </button>
      </div>

      {/* TODO와 DONE 영역 */}
      <div className="todo-done-container">
        <div className="todo-section">
          <Image
            src="/todo.png"
            alt="TODO"
            width={101}
            height={36}
            style={{ marginBottom: "10px" }}
          />
          <div className="todo-items">
            {todos
              .filter((todo) => todo.status === "todo")
              .map((todo) => (
                <div key={todo.id} className="todo-item">
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => toggleTaskStatus(todo.id)}
                    />
                    <span className="checkbox-custom"></span>
                    {todo.text}
                  </label>
                </div>
              ))}
          </div>
        </div>

        <div className="done-section">
          <Image
            src="/done.png"
            alt="DONE"
            width={101}
            height={36}
            style={{ marginBottom: "10px" }}
          />
          <div className="done-items">
            {todos
              .filter((todo) => todo.status === "done")
              .map((todo) => (
                <div key={todo.id} className="done-item">
                  <label>
                    <input
                      type="checkbox"
                      checked
                      onChange={() => toggleTaskStatus(todo.id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="done-text">{todo.text}</span>
                  </label>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
