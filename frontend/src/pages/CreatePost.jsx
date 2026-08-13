import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from "../api/articleApi";
import { uploadImage } from "../api/uploadApi";
import "./CreatePost.css";

const CreatePost = () => {
  const navigate = useNavigate();
  let user = null;
  const token = localStorage.getItem("token");
  if (token) {
  try {
    user = JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid token");
  }
}

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const [status, setStatus] = useState("published");

  

  if (!token || user?.role !== "admin") {
  return <p>Only admin can create posts</p>;
}

  const handleUpload = async () => {
    if (!imageFile) return alert("Select image");

    setUploading(true);

    try {
      const res = await uploadImage(imageFile);
      setImageUrl(res.data.imageUrl);
      alert("Uploaded ✅");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }

    setUploading(false);
  };

  const handlePublish = async () => {
    if (!title || !content) return alert("Fill all fields");

    const res = await createArticle({
      title,
      content,
      status,
      image_url: imageUrl,
    });

    navigate(`/article/${res.data.slug}`);
  };

  return (
    <div className="create-container">
      <input
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        type="file"
        onChange={(e) => setImageFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>

      {imageUrl && <img src={imageUrl} width="200" />}

      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button onClick={handlePublish}>Publish</button>
    </div>
  );
};

export default CreatePost;