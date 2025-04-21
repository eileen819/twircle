import React from "react";
import { useNavigate } from "react-router-dom";

interface IPostContent {
  content: string;
}

export default function PostContent({ content }: IPostContent) {
  const parts = content.split(/(#[\w가-힣]+)/g);
  const navigate = useNavigate();
  const onLink = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    navigate("/search");
  };
  return (
    <>
      {parts.map((part, i) =>
        part === "" ? null : part.startsWith("#") ? (
          <span key={i} className="hashtag-link" onClick={onLink}>
            {part}
          </span>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}
