"use client";

import { useRouter, useParams  } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { TENANT_ID } from "../../TodoList/TodoList"; // TENANT_ID가 정의된 파일에서 import
import "../Items.styles.css";

type TodoItem = {
  id: string;
  name: string;
  isCompleted: boolean;
  memo?: string;
  imageUrl?: string;
};

export default function ItemDetails() {
  const router = useRouter();
  const { itemId } = useParams(); // 동적 경로에서 itemId 가져오기
  
  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [memo, setMemo] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [isCompleted, setisCompleted] = useState(false);

  // API URL
  const API_URL = `https://assignment-todolist-api.vercel.app/api/${TENANT_ID}/items`;
  
  // 데이터 로드 (Get 요청)
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        // Fetch 호출에 tenantId와 itemId를 정확히 포함
        const response = await fetch(`${API_URL}/items/${itemId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch item: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        setTodo(data); // 데이터 설정
        setMemo(data.memo || ""); // 메모 설정
      } catch (error) {
        console.error(error); // 콘솔에 상세 오류 출력
        alert("할 일 정보를 가져오는 데 실패했습니다."); // 사용자에게 알림
        router.push("/"); // 오류 발생 시 홈으로 이동
      }
    };
  
    fetchTodo();
  }, [itemId, router]);

  // 메모 변경 감지
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
    setisCompleted(true); // 메모 변경 시 수정 완료 버튼 활성화
  };

  // 이미지 파일 업로드
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedImage(file);
      setisCompleted(true);
    }
  };

  // 수정 핸들러
  const handleSave = async () => {
    try {
      if (!todo) return;

      let imageUrl = todo.imageUrl || "none";
      
      if (uploadedImage) {
        const formData = new FormData();
        formData.append("file", uploadedImage);
        const uploadResponse = await fetch(`${API_URL}/images/upload`, {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error("Failed to upload image");
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }
      console.log(todo.isCompleted);
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: todo.name, memo : memo || "none", imageUrl, isCompleted: todo.isCompleted }),
      });

      if (!response.ok) throw new Error("Failed to update item");
      const updatedTodo = await response.json();
      setTodo(updatedTodo);
      setisCompleted(false);
      alert("수정되었습니다.");
    } catch (error) {
      console.error(error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  // 데이터 삭제
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete item");
      alert("삭제되었습니다.");
      router.push("/");
    } catch (error) {
      console.error(error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (!todo) return <p>Loading...</p>;

  return (
    <div className="item-details-container">
      <div key={todo.id} className="todo-item">
        <label>
          <Image src="/todo-checkbox.png" alt="Checkbox" width={32} height={32} />
          {todo.name}
        </label>
      </div>

      {/* 이미지 업로드 */}
      <div>
        <img
          src={uploadedImage ? URL.createObjectURL(uploadedImage) : todo.imageUrl || "/default-image.png"}
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
            onChange={handleMemoChange}
            placeholder="메모를 추가하세요"
            className="memo-textarea"
          ></textarea>
        </div>
      </div>

      {/* 버튼 그룹 */}
      <div className="button-group">
        <Image
          onClick={isCompleted ? handleSave : undefined}
          src={isCompleted ? "/save-icon-active.png" : "/save-icon.png"}
          alt="Save"
          width={168}
          height={56}
          style={{
            cursor: isCompleted ? "pointer" : "not-allowed",
            opacity: isCompleted ? 1 : 0.5,
          }}
        />

        <Image onClick={handleDelete} src="/delete-icon.png" alt="Delete" width={168} height={56} />
      </div>
    </div>
  );
}
