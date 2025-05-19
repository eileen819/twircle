import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "firebaseApp";
import { IComment } from "pages/posts/detail";
import { useEffect, useMemo, useState } from "react";
import CommentModal from "./CommentModal";
import CommentTree from "./CommentTree";

interface ICommentListProps {
  postId: string;
}

export default function CommentList({ postId }: ICommentListProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [selectedComment, setSelectedComment] = useState<IComment | null>(null);
  const [parentId, setParentId] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [recentlyCreatedId, setRecentlyCreatedId] = useState<string | null>(
    null
  );

  // const rootComments = comments.filter((comment) => comment.parentId === null);
  // 1. 모든 댓글의 id를 집합으로 만듦
  const commentIds = comments.map((c) => c.id);

  // 2. parentId가 null이거나, parentId가 현재 데이터에 없는 경우를 root로 간주
  const rootComments = comments.filter(
    (comment) => !comment.parentId || !commentIds.includes(comment.parentId)
  );

  const repliesMap = useMemo(() => {
    const map = new Map<string, IComment[]>();
    comments.forEach((comment) => {
      if (comment.parentId) {
        const replies = map.get(comment.parentId) ?? [];
        replies.push(comment);
        map.set(comment.parentId, replies);
      }
    });
    return map;
  }, [comments]);

  const handleComment = (commentId: string, conversationId: string) => {
    setParentId(commentId);
    setConversationId(conversationId);
    const selectedData = comments.find((comment) => comment.id === commentId);
    if (selectedData) {
      setSelectedComment(selectedData);
    }
  };

  const closeModal = (newCommentId?: string) => {
    if (newCommentId) {
      setRecentlyCreatedId(newCommentId);
    }
    setSelectedComment(null);
  };

  useEffect(() => {
    const queryDocs = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(queryDocs, (snapshot) => {
      const commentsObj = snapshot.docs.map(
        (doc) =>
          ({
            ...doc.data(),
            id: doc.id,
          } as IComment)
      );
      setComments(commentsObj);
    });

    return () => unsubscribe();
  }, [postId]);

  return (
    <>
      {rootComments.length > 0 &&
        rootComments.map((comment) => (
          <CommentTree
            key={comment.id}
            comment={comment}
            repliesMap={repliesMap}
            commentIds={commentIds}
            recentlyCreatedId={recentlyCreatedId}
            handleComment={handleComment}
          />
        ))}
      {selectedComment && (
        <CommentModal
          mode="create"
          post={selectedComment}
          postId={postId}
          parentId={parentId}
          conversationId={conversationId}
          onSuccess={closeModal}
        />
      )}
    </>
  );
}

/* 
1. "comments" 컬렉션에서 postId === conversationId인 댓글을 가져오기
  => ** 이 단계에서 작성된 순서로 가져와야 하나? -> orderBy로 작성된 순서대로 가져오기

2. comment state의 데이터를 이용해서 트리구조로 댓글들을 맵핑
*/

/* 
포스트 박스의 댓글을 클릭 
  -> 홈에 있거나, 게시글 상세페이지에서 누른 comment 아이콘은 parentId === null
  -> comment 영역에 있는 포스트 박스의 comment 아이콘을 누른 경우에는 parentId === 해당 댓글문서의 id
*/

/* 
1. 
comments 구조: [{...}, {...}] => [{..., children: []}, {..., children: []}]
commentMap 구조: {aID:{..., children: []}, bID: {..., children: []} }
=> 전체 데이터에 대댓글 key를 추가 -> postId를 key로 하는 object 생성 ==> postId 별로 라벨링하는 단계

2.
commentTree = [] 로 설정
comments.forEach 돌림
만약, comment 데이터에 parentId가 있을 경우(대댓글임) commentMap[parentId]의 데이터를 parent로 정의
commentMap[parentId]의 데이터인 aID:{..., children: []} <- 이 데이터의 children 항목에 해당 comment 데이터를 넣기
결과: aID:{..., children: [{대충 코멘트데이터}]} 


쉽게 말해서 이 과정들은 문서Id(key): 댓글 데이터(value)로 하는 object를 만드는 과정. 근데 데이터의 재가공이 이뤄지면서
댓글데이터 영역에 children이름으로 필드가 하나 더 추가 되는 것(여기에는 해당 댓글의 대댓글에 대한 데이터가 있음)

게시글
  ㄴ댓글1
    ㄴ대댓글1
    ㄴ대댓글2
=> 데이터 구조: { 댓글1: {...댓글1데이터, 대댓글: [{대댓글1, 대댓글2}] }
=> 위와 같은 구조의 데이터를 만들어 주기 위해서 재맵핑해주는 거라고 생각하면 됨
*/

/* 
루트 댓글 -> conversationId === 자기자신.id
대댓글 -> 
*/
