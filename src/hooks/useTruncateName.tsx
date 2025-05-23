import { useEffect, useMemo, useState } from "react";

export function useTruncateName(name: string) {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncateName = useMemo(() => {
    const maxLength = windowWidth <= 400 ? 6 : 20;
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name;
  }, [name, windowWidth]);

  return truncateName;
}
