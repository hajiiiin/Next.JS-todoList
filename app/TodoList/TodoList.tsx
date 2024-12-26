"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import "./TodoList.styles.css";

export type TodoItem = {
  id: number;
  name: string;
  isCompleted: boolean;
};

export const TENANT_ID = "hihajin";

export default function TodoList() {
  const router = useRouter();
  const [task, setTask] = useState(""); // 입력된 할 일을 관리
  const [todos, setTodos] = useState<TodoItem[]>([]); // todo와 done 목록 관리
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // API URL
  const API_URL = `https://assignment-todolist-api.vercel.app/api/${TENANT_ID}/items`;

  // 데이터 로드 (GET 요청)
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch todos");
        }
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTodos();
  }, []);

  // 할 일 추가 핸들러 (POST 요청)
  const addTask = async () => {
    if (task.trim()) {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: task.trim() }),
        });

        if (!response.ok) {
          throw new Error("Failed to add task");
        }

        const newTask = await response.json();
        setTodos((prev) => [...prev, newTask]);
        setTask(""); // 입력 필드 초기화
      } catch (error) {
        console.error(error);
      }
    }
  };

  // 상태 변경 핸들러 (PUT 요청)
  const toggleTaskStatus = async (id: number) => {
    try {
      const taskToUpdate = todos.find((todo) => todo.id === id);
      if (!taskToUpdate) return;

      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...taskToUpdate, isCompleted: !taskToUpdate.isCompleted }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      const updatedTask = await response.json();
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, isCompleted: updatedTask.isCompleted } : todo))
      );
    } catch (error) {
      console.error(error);
    }
  };

  // 입력 필드 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setTask(e.target.value);
  };

  const handleTodoClick = (itemId: number) => {
    router.push(`/Items/${itemId}`);
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
          {todos.filter((todo) => !todo.isCompleted).length === 0 ? (
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
                .filter((todo) => !todo.isCompleted)
                .map((todo) => (
                  <div key={todo.id} className="todo-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={() => toggleTaskStatus(todo.id)}
                      />
                      <span className="checkbox-custom"></span>
                      <span onClick={() => handleTodoClick(todo.id)}>
                        {todo.name}
                      </span>
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
          {todos.filter((todo) => todo.isCompleted).length === 0 ? (
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
                .filter((todo) => todo.isCompleted)
                .map((todo) => (
                  <div key={todo.id} className="done-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        onChange={() => toggleTaskStatus(todo.id)}
                      />
                      <span className="checkbox-custom"></span>
                      <span
                        className="done-text"
                        onClick={() => handleTodoClick(todo.id)}
                      >
                        {todo.name}
                      </span>
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
