"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import "./Items.styles.css";

type TodoItem = {
  id: string;
  text: string;
  status: "todo" | "done";
  memo?: string;
  image?: string;
};

export default function ItemDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("id");

  const [todo, setTodo] = useState<TodoItem | null>(null);
  const [memo, setMemo] = useState("");
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);

  const API_URL = `https://assignment-todolist-api.vercel.app/api/your-tenant-id/items`;

  // Fetch item details
  useEffect(() => {
    const fetchItem = async () => {
      if (itemId) {
        try {
          const response = await fetch(`${API_URL}/${itemId}`);
          if (!response.ok) throw new Error("Failed to fetch item details");
          const data = await response.json();
          setTodo(data);
          setMemo(data.memo || "");
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchItem();
  }, [itemId]);

  // Handle save
  const handleSave = async () => {
    try {
      const updatedItem = {
        ...todo,
        memo,
        image: uploadedImage ? URL.createObjectURL(uploadedImage) : todo?.image,
      };
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      if (!response.ok) throw new Error("Failed to save item");
      router.push("/"); // Navigate back to home
    } catch (error) {
      console.error("Error saving item:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_URL}/${itemId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      router.push("/"); // Navigate back to home
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (
      file &&
      file.size <= 5 * 1024 * 1024 &&
      /^[a-zA-Z0-9_\-\.]+$/.test(file.name)
    ) {
      setUploadedImage(file);
    } else {
      alert(
        "Invalid file. Please upload an image smaller than 5MB with a valid file name."
      );
    }
  };

  return (
    <div className="item-details-container">
      <div className="input-container">
        <textarea className="task-input" value={todo?.text || ""} readOnly />
        <label className="status-toggle">
          <input
            type="checkbox"
            checked={todo?.status === "done"}
            onChange={() =>
              setTodo((prev) =>
                prev
                  ? {
                      ...prev,
                      status: prev.status === "todo" ? "done" : "todo",
                    }
                  : null
              )
            }
          />
          <span>완료</span>
        </label>
      </div>

      <div className="details-body">
        <div className="image-upload">
          <Image
            src={todo?.image || "/default-image.png"} // 기본 이미지 설정
            alt="Uploaded"
            width={192}
            height={192}
          />
          <input type="file" onChange={handleFileChange} />
        </div>

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
      </div>

      <div className="button-group">
        <button onClick={handleSave} className="save-button">
          <Image src="/save-icon.png" alt="Save" width={24} height={24} />
          수정 완료
        </button>
        <button onClick={handleDelete} className="delete-button">
          <Image src="/delete-icon.png" alt="Delete" width={24} height={24} />
          삭제하기
        </button>
      </div>
    </div>
  );
}
