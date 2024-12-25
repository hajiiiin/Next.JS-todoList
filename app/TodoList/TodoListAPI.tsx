"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import Image from "next/image";
import "./TodoList.styles.css";

export type TodoItem = {
  id: string;
  text: string;
  status: "todo" | "done";
};

export const TENANT_ID = "your-tenant-id";

export default function TodoList() {
  const [task, setTask] = useState(""); // 입력된 할 일을 관리
  const [todos, setTodos] = useState<TodoItem[]>([]); // todo와 done 목록 관리
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // API URL
  const API_URL = `https://assignment-todolist-api.vercel.app/api/${TENANT_ID}/items`;

  // 서버에서 데이터 가져오기
  const fetchTodos = async () => {
    try {
      const response = await fetch(API_URL, { method: "GET" });
      if (!response.ok) throw new Error("Failed to fetch todos");
      const data = await response.json();
      setTodos(data); // 데이터를 상태에 저장
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  // 초기 데이터 로드 및 화면 크기 감지
  useEffect(() => {
    fetchTodos();

    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 744);
    };

    handleResize(); // 초기화
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // 할 일 추가 핸들러
  const addTask = async () => {
    if (task.trim()) {
      try {
        const newTodo = { text: task.trim(), status: "todo" };
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTodo),
        });
        if (!response.ok) throw new Error("Failed to add todo");
        const createdTodo = await response.json();
        setTodos((prev) => [...prev, createdTodo]); // 로컬 상태 업데이트
        setTask(""); // 입력 필드 초기화
      } catch (error) {
        console.error("Error adding todo:", error);
      }
    }
  };

  // 상태 변경 핸들러 (todo ↔ done)
  const toggleTaskStatus = async (
    id: string,
    currentStatus: "todo" | "done"
  ) => {
    try {
      const updatedTodo = {
        status: currentStatus === "todo" ? "done" : "todo",
      };
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTodo),
      });
      if (!response.ok) throw new Error("Failed to update todo");
      const updatedItem = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedItem : todo))
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchTodos();
  }, []);

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
        {/* TODO 영역 */}
        <div className="todo-section">
          <Image
            src="/todo.png"
            alt="TODO"
            width={101}
            height={36}
            style={{ marginBottom: "10px" }}
          />
          {todos.filter((todo) => todo.status === "todo").length === 0 ? (
            <div className="empty-state">
              <Image
                src={
                  isSmallScreen ? "/empty-todo-small.png" : "/empty-todo.png"
                }
                alt="Empty TODO"
                width={isSmallScreen ? 120 : 240}
                height={isSmallScreen ? 120 : 240}
              />
              <p>할 일이 없어요. TODO를 새롭게 추가해주세요!</p>
            </div>
          ) : (
            <div className="todo-items">
              {todos
                .filter((todo) => todo.status === "todo")
                .map((todo) => (
                  <div key={todo.id} className="todo-item">
                    <label>
                      <input
                        type="checkbox"
                        onChange={() => toggleTaskStatus(todo.id, todo.status)}
                      />
                      <span className="checkbox-custom"></span>
                      {todo.text}
                    </label>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* DONE 영역 */}
        <div className="done-section">
          <Image
            src="/done.png"
            alt="DONE"
            width={101}
            height={36}
            style={{ marginBottom: "10px" }}
          />
          {todos.filter((todo) => todo.status === "done").length === 0 ? (
            <div className="empty-state">
              <Image
                src={
                  isSmallScreen ? "/empty-done-small.png" : "/empty-done.png"
                }
                alt="Empty DONE"
                width={isSmallScreen ? 120 : 240}
                height={isSmallScreen ? 120 : 240}
              />
              <p>아직 할 일을 완료하지 않았어요. 할 일을 체크해주세요!</p>
            </div>
          ) : (
            <div className="done-items">
              {todos
                .filter((todo) => todo.status === "done")
                .map((todo) => (
                  <div key={todo.id} className="done-item">
                    <label>
                      <input
                        type="checkbox"
                        checked
                        onChange={() => toggleTaskStatus(todo.id, todo.status)}
                      />
                      <span className="checkbox-custom"></span>
                      <span className="done-text">{todo.text}</span>
                    </label>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
