import { IComment } from "pages/posts/detail";
import CommentBox from "./CommentBox";

interface ICommentTreeProps {
  comment: IComment;
  repliesMap: Map<string, IComment[]>;
  recentlyCreatedId: string | null;
  handleComment: (commentId: string, conversationId: string) => void;
}

export default function CommentTree({
  comment,
  repliesMap,
  recentlyCreatedId,
  handleComment,
}: ICommentTreeProps) {
  const replies = repliesMap.get(comment.id) ?? [];

  return (
    <>
      {comment.isDeleted ? (
        <p>삭제된 댓글입니다.</p>
      ) : (
        <CommentBox
          comment={comment}
          recentlyCreatedId={recentlyCreatedId}
          handleComment={() =>
            handleComment(comment.id, comment.conversationId)
          }
        />
      )}

      <div style={{ marginLeft: "30px" }}>
        {replies.length > 0 &&
          replies.map((reply) => (
            <CommentTree
              key={reply.id}
              comment={reply}
              // commentIds={commentIds}
              recentlyCreatedId={recentlyCreatedId}
              repliesMap={repliesMap}
              handleComment={handleComment}
            />
          ))}
      </div>
    </>
  );
}

/* 
댓글 a: parentId: null;
 ㄴ 댓글 b: parentId: A;
  ㄴ 댓글 c: parentId: B;

*/
