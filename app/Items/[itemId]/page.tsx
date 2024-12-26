"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import "../Items.styles.css";

type TodoItem = {
  id: string;
  text: string;
  isCompleted: boolean;
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

  // API URL
  const API_URL = `https://assignment-todolist-api.vercel.app/api/${TENANT_ID}/items`;
  
  // 데이터 로드
  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await fetch(`${API_URL}/items/${itemId}`);
        if (!response.ok) throw new Error("Failed to fetch item");
        const data = await response.json();
        setTodo(data);
        setMemo(data.memo || "");
      } catch (error) {
        console.error(error);
        router.push("/"); // 에러 시 홈으로 리다이렉트
      }
    };

    fetchTodo();
  }, [itemId, router]);

  // 메모 변경 감지
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
    setIsModified(true);
  };

  // 이미지 업로드
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/images/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to upload image");
    const data = await response.json();
    return data.url;
  };

  // 수정 핸들러
  const handleSave = async () => {
    try {
      if (!todo) return;

      let imageUrl = todo.imageUrl;
      if (uploadedImage) {
        imageUrl = await uploadImage(uploadedImage);
      }

      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: todo.name,
          memo,
          imageUrl,
          isCompleted: todo.isCompleted,
        }),
      });

      if (!response.ok) throw new Error("Failed to update item");
      const updatedTodo = await response.json();
      setTodo(updatedTodo);
      setIsModified(false);
      alert("수정되었습니다.");
    } catch (error) {
      console.error(error);
      alert("수정 중 오류가 발생했습니다.");
    }
  };


  // 삭제 핸들러
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/items/${itemId}`, {
        method: "DELETE",
      });

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
          <Image src="/todo-checkbox.png" alt="Save" width={32} height={32} />
          {todo.name}
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
