import { FiImage } from "react-icons/fi";

export default function PostForm() {
  return (
    <form className="post-form">
      <textarea
        name="content"
        id="content"
        className="post-form__textarea"
        required
        placeholder="What is happening?"
      />
      <div className="post-form__submit-area">
        <label htmlFor="file-input" className="post-form__file">
          <FiImage className="post-form__file-icon" />
        </label>
        <input
          type="file"
          id="file-input"
          name="file-input"
          accept="image/*"
          onChange={() => {}}
          className="hidden"
        />
        <input type="submit" value="Tweet" className="post-form__submit-btn" />
      </div>
    </form>
  );
}
