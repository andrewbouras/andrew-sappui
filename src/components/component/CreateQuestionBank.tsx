"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAxios } from "@/hooks/useAxios";

const CreateQuestionBank = () => {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [paid, setPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [urlSlug, setUrlSlug] = useState("");
  const [editors, setEditors] = useState<string[]>([]);
  const [editorInput, setEditorInput] = useState("");
  const [loading, setLoading] = useState(false);

  const axios = useAxios();
  const router = useRouter();

  const handleAddEditor = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && editorInput) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(editorInput)) {
        setEditors([...editors, editorInput]);
        setEditorInput("");
      } else {
        alert("Please enter a valid email address.");
      }
    }
  };

  const handleRemoveEditor = (email: string) => {
    setEditors(editors.filter((editor) => editor !== email));
  };

  const handleSubmit = async () => {
    if (!title || !urlSlug) {
      alert("Please fill in all required fields.");
      return;
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(urlSlug)) {
      alert("Please enter a valid URL slug (lowercase letters, numbers, and hyphens only).");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/create", {
        title,
        visibility,
        paid,
        price,
        urlSlug,
        editors,
      });

      if (response.data.success) {
        alert("Question bank created successfully!");
        router.push(`/bank/${urlSlug}/editor`); // Use router.push for navigation
      } else {
        alert(response.data.message || "Failed to create question bank");
      }
    } catch (error) {
      alert("An error occurred while creating the question bank");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-5">Create Question Bank</h1>
      <div>
        <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">Title</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter question bank title"
          className="mt-1 block w-full"
          required
        />
      </div>
      <div className="mt-5">
        <label className="block text-gray-700 text-sm font-bold mb-2">Visibility</label>
        <div>
          <label className="inline-flex items-center">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
            />
            <span className="ml-2">Public</span>
          </label>
          <label className="inline-flex items-center ml-4">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
            />
            <span className="ml-2">Private</span>
          </label>
        </div>
      </div>
      {visibility === "public" && (
        <div className="mt-5">
          <label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
          <div>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              <span className="ml-2">Paid</span>
            </label>
          </div>
          {paid && (
            <div className="mt-2">
              <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Price</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="Enter price"
                className="mt-1 block w-full"
                disabled={!paid}
              />
            </div>
          )}
        </div>
      )}
      <div className="mt-5">
        <label htmlFor="urlSlug" className="block text-gray-700 text-sm font-bold mb-2">URL Slug</label>
        <input
          type="text"
          id="urlSlug"
          value={urlSlug}
          onChange={(e) => setUrlSlug(e.target.value)}
          placeholder="Enter URL slug"
          className="mt-1 block w-full"
          required
        />
      </div>
      <div className="mt-5">
        <label className="block text-gray-700 text-sm font-bold mb-2">Editors</label>
        <div className="flex items-center">
          <input
            type="text"
            value={editorInput}
            onChange={(e) => setEditorInput(e.target.value)}
            onKeyDown={handleAddEditor}
            placeholder="Enter editor email and press Enter"
            className="flex-grow mt-1 block w-full"
          />
        </div>
        <div className="mt-2">
          {editors.map((editor) => (
            <div
              key={editor}
              className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
            >
              {editor}
              <button
                type="button"
                className="ml-2 text-red-500"
                onClick={() => handleRemoveEditor(editor)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-5 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        disabled={loading}
      >
        {loading ? "Creating..." : "Next"}
      </button>
    </div>
  );
};

export default CreateQuestionBank;
