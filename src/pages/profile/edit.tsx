import styles from "./edit.module.scss";
import AuthContext from "context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { FiImage } from "react-icons/fi";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { updateProfile } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import { db, storage } from "firebaseApp";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { DEFAULT_PROFILE_IMG_URL } from "components/users/SignupForm";

interface IProfileForm {
  userName: string;
  bio: string;
  imageFile: string | null;
}

export interface IUserProps {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  photoURL: string;
  photoPath: string;
  updatedAt: string;
}

const STORAGE_DOWNLOAD_URL_STR = "https://firebasestorage.googleapis.com";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [previewImage, setpreviewImage] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<IUserProps | null>(null);
  const { register, handleSubmit, setValue, reset, watch } =
    useForm<IProfileForm>();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setpreviewImage(reader.result); // 업로드 되기 전 이미지를 선택했을 때 이미지 미리보기 용으로 필요함
        setValue("imageFile", reader.result); // 이 부분이 필요한가? -> 변환파일을 넣어주지 않으면 나중에 onValid에서 imageFile을 사용할 수 없음
        if (originalImageUrl) {
          setOriginalImageUrl(null);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  // console.log(imageFile);
  // console.log(originalImageUrl);
  // console.log(userProfile);

  const onValid = async ({ userName, imageFile, bio }: IProfileForm) => {
    if (user) {
      try {
        if (userProfile) {
          let profileImageUrl = userProfile.photoURL;
          let profileImagePath = userProfile.photoPath;
          // 프로필 이미지의 수정
          // 1. 기존의 프로필 이미지를 유지할 경우
          // -> photoURL을 넣어줌, originalImageUrl / imageFile의 값은 없음 즉, preview 이미지 값이 없음
          if (originalImageUrl && !imageFile) {
            // 기존의 값을 유지
            profileImageUrl = userProfile.photoURL;
            profileImagePath = userProfile.photoPath;
          } else {
            // 2. 새로운 프로필 이미지를 등록하는 경우
            if (imageFile && !originalImageUrl) {
              if (
                userProfile.photoURL &&
                userProfile.photoURL.includes(STORAGE_DOWNLOAD_URL_STR)
              ) {
                // 기존 이미지 삭제
                const oldProfileImageRef = ref(
                  storage,
                  userProfile.photoPath || userProfile.photoURL
                );
                await deleteObject(oldProfileImageRef);
              }
              profileImagePath = `${user.uid}/${uuidv4()}`;
              const storageRef = ref(storage, profileImagePath);
              await uploadString(storageRef, imageFile, "data_url");
              profileImageUrl = await getDownloadURL(storageRef);
            }
          }

          // auth의 프로필 수정
          await updateProfile(user, {
            displayName: userName,
            photoURL: profileImageUrl,
          });

          // firestore의 users 안의 문서 수정
          const userDocRef = doc(db, "users", user.uid);
          await updateDoc(userDocRef, {
            displayName: userName,
            bio,
            photoURL: profileImageUrl,
            photoPath: profileImagePath,
            updatedAt: serverTimestamp(),
          });

          // firestore의 user가 작성한 posts 컬렉션의 문서들의 프로필 정보 수정
          const userPostsRef = query(
            collection(db, "posts"),
            where("uid", "==", user.uid)
          );
          const userPostSnap = await getDocs(userPostsRef);
          const batch = writeBatch(db);
          userPostSnap.forEach((docSnap) => {
            const userPostRef = doc(db, "posts", docSnap.id);
            batch.update(userPostRef, {
              userInfo: {
                profileName: userName,
                profileUrl: profileImageUrl,
              },
            });
          });
          await batch.commit();

          setpreviewImage(null);
          reset();
          navigate(`/profile/${user.uid}`, { replace: true });
          toast.success("프로필을 수정했습니다.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error);
          toast.error(error.message);
        } else {
          toast.error("프로필 수정 중에 오류가 발생했습니다.");
        }
      }
    }
  };

  useEffect(() => {
    const getUser = async (uid: string) => {
      const userDocRef = doc(db, "users", uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = {
          ...docSnap.data(),
        } as IUserProps;
        setUserProfile(userData);
      } else {
        toast.error("해당 프로필을 찾을 수 없습니다.");
        navigate("/profile");
      }
    };
    if (user && user?.uid) {
      getUser(user.uid);
    }
  }, [user, user?.uid, navigate]);

  useEffect(() => {
    if (userProfile) {
      setValue("userName", userProfile.displayName);
      setValue("bio", userProfile.bio);
      setOriginalImageUrl(userProfile.photoURL);
    }
  }, [userProfile, setValue]);

  return (
    <form className={styles.editForm} onSubmit={handleSubmit(onValid)}>
      <div className={styles.header}>
        <div className={styles.back__icon} onClick={() => navigate(-1)}>
          <IoArrowBack size={20} />
        </div>
        <div className={styles.title}>Profile Edit</div>
        <input type="submit" className={styles.submitBtn} value="Edit" />
      </div>
      <div className={styles.wrapper}>
        <div className={styles.imageArea}>
          <label htmlFor="file-input" className={styles.file}>
            {previewImage || originalImageUrl ? (
              <img
                src={previewImage ?? originalImageUrl ?? ""}
                alt="attachment"
                className={styles.selectedImg}
              />
            ) : (
              <img
                src={user?.photoURL || DEFAULT_PROFILE_IMG_URL}
                alt="attachment"
                className={styles.defaultImg}
              />
            )}

            <FiImage className={styles.file__icon} />
          </label>
          <input
            {...register("imageFile", {
              onChange: handleFileUpload,
            })}
            id="file-input"
            type="file"
            accept="image/*"
            className="hidden"
          />
        </div>
        <div className={styles.inputArea}>
          <div className={styles.input__block}>
            <div className={styles.input__title}>Name</div>
            <input
              {...register("userName", {
                required: "이름을 입력해주세요.",
                maxLength: {
                  value: 10,
                  message: "이름은 10글자를 넘을 수 없습니다.",
                },
              })}
              onFocus={() => {
                if (watch("userName")) {
                  setValue("userName", "");
                }
              }}
              type="text"
              className={styles.input__el}
              autoComplete="off"
            />
          </div>
          <div className={styles.input__block}>
            <div className={styles.input__title}>Bio</div>
            <input
              {...register("bio", { maxLength: 50 })}
              onFocus={() => {
                if (watch("bio")) {
                  setValue("bio", "");
                }
              }}
              type="text"
              className={styles.input__el}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
