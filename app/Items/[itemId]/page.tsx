"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import "../Items.styles.css";

type TodoItem = {
  id: string;
  text: string;
  status: "todo" | "done";
  memo?: string;
  image?: string;
};

export default function ItemDetails({
  params,
}: {
  params: { itemId: string };
}) {
  const router = useRouter();
  //const searchParams = useSearchParams();
  const itemId = params.itemId;

  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [memo, setMemo] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isModified, setIsModified] = useState(false);

  const API_URL = `https://assignment-todolist-api.vercel.app/api/your-tenant-id/items`;

  // 데이터 로드
  useEffect(() => {
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    const item = savedTodos.find((todo: TodoItem) => todo.id === itemId);
    if (item) {
      setTodo(item);
      setMemo(item.memo || "");
    } else {
      router.push("/"); // 할 일이 없으면 홈으로 리다이렉트
    }
  }, [itemId, router]);

  // 메모 변경 감지
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
    setIsModified(true); // 변경 시 활성화
  };

  // 이미지 변경 감지
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setIsModified(true); // 변경 시 활성화
    }
  };

  // 수정 핸들러
  const handleSave = () => {
    if (!isModified) return; // 변경사항 없으면 동작 안 함
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    const updatedTodos = savedTodos.map((todo: TodoItem) =>
      todo.id === itemId
        ? {
            ...todo,
            memo,
            image: uploadedImage
              ? URL.createObjectURL(uploadedImage)
              : todo.image,
          }
        : todo
    );
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    router.push("/");
  };

  // 삭제 핸들러
  const handleDelete = () => {
    const savedTodos = JSON.parse(localStorage.getItem("todos") || "[]");
    const updatedTodos = savedTodos.filter(
      (todo: TodoItem) => todo.id !== itemId
    );
    localStorage.setItem("todos", JSON.stringify(updatedTodos));
    router.push("/");
  };

  if (!todo) return <p>Loading...</p>;

  return (
    <div className="item-details-container">
      <div key={todo.id} className="todo-item">
        <label>
          <Image src="/todo-checkbox.png" alt="Save" width={32} height={32} />
          {todo.text}
        </label>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <img
          src={
            uploadedImage
              ? URL.createObjectURL(uploadedImage)
              : todo.image || "/default-image.png"
          }
          alt="Uploaded"
          style={{ width: 200, height: 200 }}
        />
        <input type="file" onChange={handleFileChange} />
      </div>

      {/* 메모 입력 */}
      <div className="memo-section">
        <h3>Memo</h3>
        <div className="memo-container">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 추가하세요"
            className="memo-textarea"
          ></textarea>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="button-group">
        <Image
          onClick={isModified ? handleSave : undefined} // 수정 완료 버튼 클릭 가능 조건
          src={isModified ? "/save-icon-active.png" : "/save-icon.png"} // 활성화 여부에 따라 이미지 변경
          alt="Save"
          width={168}
          height={56}
          style={{
            cursor: isModified ? "pointer" : "not-allowed",
            opacity: isModified ? 1 : 0.5,
          }}
        />

        <Image
          onClick={handleDelete}
          src="/delete-icon.png"
          alt="Delete"
          width={168}
          height={56}
        />
      </div>
    </div>
  );
}
